import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiArrowLeft } from 'react-icons/fi'
import { useAuth }   from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import api from '../../services/api'

const ChatWindow = ({ peerId, peerName, peerAvatar, onBack, showBack = false }) => {
  const { user }   = useAuth()
  const { socket } = useSocket() || {}

  const [messages, setMessages] = useState([])
  const [text, setText]         = useState('')
  const [typing, setTyping]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const [sending, setSending]   = useState(false)

  const endRef      = useRef(null)
  const typingTimer = useRef(null)
  const textareaRef = useRef(null)

  const loadMessages = useCallback(async () => {
    if (!peerId) return
    setLoading(true)
    try {
      const res = await api.get(`/messages/${peerId}`)
      setMessages(res.data || [])
    } catch {}
    finally { setLoading(false) }
  }, [peerId])

  useEffect(() => { loadMessages() }, [loadMessages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Socket: incoming messages + typing indicator
  useEffect(() => {
    if (!socket) return

    const onReceive = (msg) => {
      if (
        (msg.sender_id === peerId   && msg.receiver_id === user.id) ||
        (msg.sender_id === user.id  && msg.receiver_id === peerId)
      ) {
        setMessages(prev => {
          // Avoid duplicates (message:sent and message:received can both fire)
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
    }

    const onTyping = ({ senderId }) => {
      if (senderId === peerId) {
        setTyping(true)
        clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setTyping(false), 2500)
      }
    }

    socket.on('message:received', onReceive)
    socket.on('message:sent',     onReceive)
    socket.on('message:typing',   onTyping)

    return () => {
      socket.off('message:received', onReceive)
      socket.off('message:sent',     onReceive)
      socket.off('message:typing',   onTyping)
      clearTimeout(typingTimer.current)
    }
  }, [socket, peerId, user.id])

  const send = async () => {
    const msg = text.trim()
    if (!msg || sending) return
    setSending(true)
    try {
      if (socket) {
        socket.emit('message:send', { receiverId: peerId, message: msg })
      } else {
        // Fallback: HTTP send if socket not connected
        const res = await api.post('/messages', { receiverId: peerId, message: msg })
        setMessages(prev => [...prev, res.data])
      }
      setText('')
      // Auto-resize textarea back to 1 row
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch {}
    finally { setSending(false) }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    } else {
      socket?.emit('message:typing', { receiverId: peerId })
    }
  }

  // Auto-resize textarea as user types
  const handleTextChange = e => {
    setText(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    }
  }

  const initials = peerName?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff', borderRadius:'var(--border-radius-lg)', border:'1px solid var(--border-color)', overflow:'hidden' }}>

      {/* ── Header ── */}
      <div style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'center', gap:'0.75rem', background:'#fff', flexShrink:0 }}>
        {/* Back arrow — shown on mobile */}
        {showBack && (
          <button onClick={onBack}
            style={{ width:36, height:36, border:'none', background:'var(--bg-secondary)', borderRadius:'var(--border-radius-full)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)', flexShrink:0, transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--border-color)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}>
            <FiArrowLeft size={17} />
          </button>
        )}

        {/* Avatar */}
        <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--color-primary-light)', flexShrink:0, overflow:'hidden' }}>
          {peerAvatar
            ? <img src={peerAvatar} alt={peerName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : initials}
        </div>

        {/* Name + typing */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:'var(--text-sm)' }} className="truncate">{peerName}</div>
          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                style={{ fontSize:'var(--text-xs)', color:'var(--color-teal)', fontWeight:500 }}>
                typing…
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex:1, overflowY:'auto', padding:'1rem 1rem', display:'flex', flexDirection:'column', gap:'0.625rem', WebkitOverflowScrolling:'touch' }}>
        {loading ? (
          <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:'var(--text-sm)', padding:'2rem' }}>Loading messages…</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:'var(--text-sm)', padding:'2rem', lineHeight:1.7 }}>
            No messages yet. Say hello! 👋
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map(msg => {
              const isMe = msg.sender_id === user.id
              return (
                <motion.div key={msg.id}
                  initial={{ opacity:0, y:6 }}
                  animate={{ opacity:1, y:0 }}
                  style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'75%',
                    padding:'0.625rem 0.875rem',
                    borderRadius: isMe ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                    background: isMe ? 'var(--color-primary-light)' : 'var(--bg-secondary)',
                    color: isMe ? '#fff' : 'var(--text-primary)',
                    fontSize:'var(--text-sm)',
                    lineHeight:1.55,
                    wordBreak:'break-word',
                  }}>
                    <div>{msg.message}</div>
                    <div style={{ fontSize:'0.675rem', opacity:0.65, marginTop:'0.25rem', textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Input ── */}
      <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid var(--border-color)', display:'flex', gap:'0.625rem', alignItems:'flex-end', background:'#fff', flexShrink:0 }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          style={{ flex:1, resize:'none', border:'1.5px solid var(--border-color)', borderRadius:'var(--border-radius)', padding:'0.625rem 0.875rem', fontSize:'var(--text-base)', fontFamily:'inherit', outline:'none', maxHeight:120, lineHeight:1.55, overflowY:'auto', transition:'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary-light)'}
          onBlur={e  => e.target.style.borderColor = 'var(--border-color)'}
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          style={{ width:40, height:40, borderRadius:'var(--border-radius-full)', background: text.trim() ? 'var(--color-primary-light)' : 'var(--bg-tertiary)', border:'none', cursor: text.trim() ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', color: text.trim() ? '#fff' : 'var(--text-muted)', transition:'all 0.15s', flexShrink:0 }}>
          <FiSend size={16} />
        </button>
      </div>
    </div>
  )
}

export default ChatWindow
