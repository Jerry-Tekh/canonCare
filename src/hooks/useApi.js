import { useState, useCallback } from 'react'
import api from '../services/api'

const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const request = useCallback(async (method, url, body = null) => {
    setLoading(true)
    setError(null)
    try {
      return await api[method](url, body)
    } catch (err) {
      const message = err?.data?.message || err?.message || 'Request failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    get:    (url)       => request('get',    url),
    post:   (url, body) => request('post',   url, body),
    patch:  (url, body) => request('patch',  url, body),
    delete: (url)       => request('delete', url),
  }
}

export default useApi
