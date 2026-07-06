import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { getAccessToken } from '../services/api'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [socket, setSocket]           = useState(null)
  const [connected, setConnected]     = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    // Only connect when there is an authenticated user
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setSocket(null)
      setConnected(false)
      return
    }

    const token     = getAccessToken()
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

    const newSocket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,   // keep trying — calls/messages depend on this
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true,
    })

    newSocket.on('connect', () => {
      console.log('[Socket] Connected')
      setConnected(true)
    })

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
      setConnected(false)
    })

    // If the server rejects auth (e.g. stale token after a refresh elsewhere),
    // re-fetch the current token from memory and retry the handshake.
    newSocket.on('connect_error', (err) => {
      console.warn('[Socket] Connect error:', err.message)
      if (err.message === 'Authentication error') {
        const freshToken = getAccessToken()
        if (freshToken && freshToken !== newSocket.auth.token) {
          newSocket.auth.token = freshToken
          newSocket.connect()
        }
      }
    })

    newSocket.on('user:online',  ({ userId }) => setOnlineUsers(p => [...new Set([...p, userId])]))
    newSocket.on('user:offline', ({ userId }) => setOnlineUsers(p => p.filter(id => id !== userId)))

    socketRef.current = newSocket
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      socketRef.current = null
      setSocket(null)
      setConnected(false)
      setOnlineUsers([])
    }
  }, [user?.id])

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
export default SocketContext
