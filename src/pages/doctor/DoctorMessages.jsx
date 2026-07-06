import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageSquare, FiSearch, FiClock, FiCalendar } from 'react-icons/fi'
import api from '../../services/api'
import useBreakpoint from '../../hooks/useBreakpoint'
import ChatWindow from '../../components/chat/ChatWindow'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

const DoctorMessages = () => {
  const { isMobile } = useBreakpoint()
  const [contacts, setContacts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [activePeer, setActivePeer] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await api.get('/messages/conversations')
      setContacts(res.data || [])
    } catch { setContacts([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = contacts.filter(c =>
    !search || c.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (ts) => {
    if (!ts) return null
    const d = new Date(ts), now = new Date()
    if (d.toDateString() === now.toDateString())
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ display: 'flex', gap: isMobile ? 0 : '1.25rem', height: 'calc(100vh - var(--topbar-height) - 4rem)', minHeight: 0 }}>

      {/* ── Sidebar ── */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
        style={{ width: isMobile ? '100%' : 300, flexShrink: 0, background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', display: (isMobile && activePeer) ? 'none' : 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', marginBottom: '0.75rem' }}>Messages</div>
          <div style={{ position: 'relative' }}>
            <FiSearch size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients…"
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--border-radius)', fontSize: 'var(--text-sm)', fontFamily: 'inherit', background: 'var(--bg-secondary)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><LoadingSpinner size={28} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
              {search ? 'No patients match your search.' : 'Patients with confirmed appointments will appear here.'}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((c, i) => {
                const isActive  = activePeer?.id === c.other_user
                const hasUnread = !c.is_read && c.source === 'message'
                return (
                  <motion.div key={c.other_user}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    onClick={() => setActivePeer({ id: c.other_user, name: c.user?.name, avatar: c.user?.avatar_url })}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', background: isActive ? 'var(--color-slate-light)' : '#fff', transition: 'background 0.15s' }}>

                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: isActive ? 'var(--color-primary-light)' : 'var(--color-slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--text-base)', color: isActive ? '#fff' : 'var(--color-primary-light)', flexShrink: 0, overflow: 'hidden' }}>
                      {c.user?.avatar_url
                        ? <img src={c.user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : c.user?.name?.[0]}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: hasUnread ? 700 : 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }} className="truncate">
                          {c.user?.name}
                        </span>
                        {c.created_at && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 4 }}>
                            {formatTime(c.created_at)}
                          </span>
                        )}
                      </div>

                      {c.source === 'appointment' && !c.message ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 'var(--text-xs)', color: 'var(--color-teal)', fontWeight: 500 }}>
                          <FiCalendar size={10} />
                          Appointment confirmed · tap to chat
                        </div>
                      ) : (
                        <div className="truncate" style={{ fontSize: 'var(--text-xs)', color: hasUnread ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: hasUnread ? 600 : 400 }}>
                          {c.message || 'No messages yet'}
                        </div>
                      )}
                    </div>

                    {hasUnread && (
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--color-primary-light)', flexShrink: 0 }} />
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, minWidth: 0, display: (isMobile && !activePeer) ? 'none' : 'flex', flexDirection: 'column' }}>
        {activePeer ? (
          <ChatWindow
            peerId={activePeer.id}
            peerName={activePeer.name}
            peerAvatar={activePeer.avatar}
            onBack={() => setActivePeer(null)}
            showBack={isMobile}
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ height: '100%', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState
              icon={<FiMessageSquare />}
              title="Select a patient"
              message="Choose a patient from the left to open or start a conversation."
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default DoctorMessages
