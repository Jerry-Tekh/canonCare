import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSocket } from './SocketContext'
import { useAuth } from './AuthContext'
import api from '../services/api'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const { socket } = useSocket() || {}
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)

  const fetchNotifications = useCallback(async () => {
    // Guard: only fetch when logged in
    if (!user) return
    try {
      const res = await api.get('/notifications?limit=20')
      setNotifications(res.data)
      setUnreadCount(res.unreadCount || 0)
    } catch {
      // Silently ignore — 401 is handled by api.js redirect
    }
  }, [user])   // re-fetch when user changes (login/logout)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Reset on logout
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user])

  useEffect(() => {
    if (!socket) return
    const handler = (notif) => {
      setNotifications(prev => [notif, ...prev])
      setUnreadCount(prev => prev + 1)
    }
    socket.on('notification:new', handler)
    return () => socket.off('notification:new', handler)
  }, [socket])

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch {}
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
export default NotificationContext
