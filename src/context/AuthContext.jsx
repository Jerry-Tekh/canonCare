import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import api, { setAccessToken, clearAccessToken } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const didInit               = useRef(false)

  // ── On mount: attempt silent session restore via HttpOnly cookie ──
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    const silentRefresh = async () => {
      try {
        // Read CSRF from cookie if already set (e.g. after a hard reload)
        const csrfMatch = document.cookie.match(/(?:^|;\s*)hms_csrf=([^;]+)/)
        const csrfToken = csrfMatch ? decodeURIComponent(csrfMatch[1]) : null

        const headers = { 'Content-Type': 'application/json' }
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken

        const res = await fetch(
          (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/refresh',
          { method: 'POST', credentials: 'include', headers }
        )
        if (res.ok) {
          const json = await res.json()
          setAccessToken(json.data.accessToken)
          setUser(json.data.user)
        }
      } catch {
        // Network error or no session — stay logged out silently
      } finally {
        setLoading(false)
      }
    }

    silentRefresh()
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    return res.data
  }

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData)
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    try { await api.post('/auth/logout', {}) } catch {}
    clearAccessToken()
    setUser(null)
  }

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }))

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
