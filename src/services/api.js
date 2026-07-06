/**
 * HMS Fetch API Client
 *
 * Security model:
 *  - Access token  → memory only (React state). Never persisted. Lost on page reload,
 *                    silently restored via /auth/refresh (HttpOnly cookie).
 *  - Refresh token → HttpOnly cookie set by server. JS cannot read it.
 *  - CSRF token    → Readable JS cookie (hms_csrf) sent as X-CSRF-Token header on
 *                    every POST/PUT/PATCH/DELETE. Prevents CSRF on cookie-reliant endpoints.
 *
 * Why CSRF is required here:
 *  Browsers auto-send HttpOnly cookies cross-origin. An attacker page can POST to
 *  /api/auth/refresh or /api/auth/logout and the browser sends hms_refresh automatically.
 *  JWT-in-memory doesn't help because those endpoints don't require the access token.
 *  The CSRF token (read by JS, sent as header) cannot be read or set by cross-origin pages.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── In-memory access token ────────────────────────────────────
let _accessToken = null
export const setAccessToken  = (t) => { _accessToken = t }
export const clearAccessToken = ()  => { _accessToken = null }
export const getAccessToken  = ()   => _accessToken

// ── Read CSRF token from non-HttpOnly cookie ──────────────────
const getCsrfToken = () => {
  const match = document.cookie.match(/(?:^|;\s*)hms_csrf=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

// ── Refresh queue ─────────────────────────────────────────────
let _refreshing = false
let _queue      = []

const processQueue = (err, token = null) => {
  _queue.forEach(cb => err ? cb.reject(err) : cb.resolve(token))
  _queue = []
}

// ── Silent token refresh via HttpOnly cookie ──────────────────
const doRefresh = async () => {
  const csrfToken = getCsrfToken()
  const headers   = { 'Content-Type': 'application/json' }
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken

  const res  = await fetch(`${BASE_URL}/auth/refresh`, {
    method:      'POST',
    credentials: 'include',
    headers,
  })
  if (!res.ok) throw new Error('Session expired')
  const json = await res.json()
  setAccessToken(json.data.accessToken)
  return json.data.accessToken
}

// ── Core request ──────────────────────────────────────────────
const request = async (method, path, body = null, opts = {}, _isRetry = false) => {
  const url     = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const headers = { 'Content-Type': 'application/json', ...opts.headers }

  // Inject access token
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`

  // Inject CSRF token on all state-mutating requests
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
  if (isMutating) {
    const csrfToken = getCsrfToken()
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken
  }

  const init = { method, headers, credentials: 'include' }
  if (body !== null && isMutating) init.body = JSON.stringify(body)

  let res = await fetch(url, init)

  // ── 401 → silent refresh then retry once ─────────────────
  if (res.status === 401 && !_isRetry) {
    if (_refreshing) {
      try {
        const newToken = await new Promise((resolve, reject) => _queue.push({ resolve, reject }))
        headers['Authorization'] = `Bearer ${newToken}`
        return request(method, path, body, { ...opts, headers }, true)
      } catch {
        clearAccessToken()
        window.location.href = '/login'
        throw new Error('Session expired')
      }
    }

    _refreshing = true
    try {
      const newToken = await doRefresh()
      processQueue(null, newToken)
      headers['Authorization'] = `Bearer ${newToken}`
      // Also update CSRF after refresh (server issues new one)
      const newCsrf = getCsrfToken()
      if (newCsrf) headers['X-CSRF-Token'] = newCsrf
      res = await fetch(url, { ...init, headers })
    } catch (err) {
      processQueue(err)
      clearAccessToken()
      window.location.href = '/login'
      throw new Error('Session expired')
    } finally {
      _refreshing = false
    }
  }

  // ── Parse response ────────────────────────────────────────
  const ct   = res.headers.get('content-type') || ''
  const data = ct.includes('application/json')
    ? await res.json()
    : { success: res.ok, message: await res.text() }

  if (!res.ok) {
    const err  = new Error(data?.message || `HTTP ${res.status}`)
    err.status = res.status
    err.data   = data
    throw err
  }

  return data
}

// ── Public API surface ────────────────────────────────────────
const api = {
  get:    (path, opts)       => request('GET',    path, null, opts),
  post:   (path, body, opts) => request('POST',   path, body, opts),
  put:    (path, body, opts) => request('PUT',    path, body, opts),
  patch:  (path, body, opts) => request('PATCH',  path, body, opts),
  delete: (path, opts)       => request('DELETE', path, null, opts),

  upload: async (path, formData) => {
    const headers = {}
    if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`
    const csrfToken = getCsrfToken()
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken

    const res  = await fetch(`${BASE_URL}${path}`, {
      method: 'POST', headers, body: formData, credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) { const e = new Error(data?.message); e.status = res.status; throw e }
    return data
  },
}

export default api
