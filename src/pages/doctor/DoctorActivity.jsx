import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiActivity, FiCalendar, FiMessageSquare,
  FiUsers, FiBell, FiClock, FiCheckCircle,
  FiAlertCircle, FiTrendingUp,
} from 'react-icons/fi'
import api from '../../services/api'
import useBreakpoint from '../../hooks/useBreakpoint'
import { useAuth } from '../../context/AuthContext'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

const DoctorActivity = () => {
  const { user }    = useAuth()
  const { isMobile } = useBreakpoint()
  const navigate    = useNavigate()
  const [data, setData]       = useState({ appointments: [], notifications: [], conversations: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, notifRes, msgRes] = await Promise.all([
          api.get('/appointments?limit=50'),
          api.get('/notifications?limit=10'),
          api.get('/messages/conversations'),
        ])
        setData({
          appointments:  apptRes.data  || [],
          notifications: notifRes.data || [],
          conversations: msgRes.data   || [],
        })
      } catch { /* show empty gracefully */ }
      finally { setLoading(false) }
    }
    if (user?.id) load()
  }, [user?.id])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <LoadingSpinner />
    </div>
  )

  const { appointments, notifications, conversations } = data

  const now        = new Date()
  const today      = appointments.filter(a => new Date(a.appointment_time).toDateString() === now.toDateString())
  const upcoming   = appointments.filter(a => ['pending','accepted'].includes(a.status) && new Date(a.appointment_time) > now)
  const pending    = appointments.filter(a => a.status === 'pending')
  const recent     = appointments.filter(a => a.status === 'completed').slice(0, 5)
  const unreadMsgs = conversations.filter(c => !c.is_read && c.source === 'message').length
  const unreadNotifs = notifications.filter(n => !n.is_read).length

  // Build a unified activity feed (most recent first)
  const feed = [
    ...appointments.slice(0, 15).map(a => ({
      id:   `appt-${a.id}`,
      type: 'appointment',
      text: `Appointment with ${a.patient_name}`,
      sub:  `${a.status} · ${new Date(a.appointment_time).toLocaleString()}`,
      status: a.status,
      time:   new Date(a.appointment_time),
      icon:   <FiCalendar />,
    })),
    ...notifications.slice(0, 5).map(n => ({
      id:   `notif-${n.id}`,
      type: 'notification',
      text: n.title,
      sub:  n.message,
      status: n.is_read ? 'completed' : 'pending',
      time:   new Date(n.created_at),
      icon:   <FiBell />,
    })),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 20)

  const iconColor = {
    appointment: 'var(--color-primary-light)',
    notification: 'var(--color-teal)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.25rem' }}>
          Activity
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your recent interactions and upcoming schedule, Dr. {user?.name?.split(' ').slice(-1)[0]}.
        </p>
      </motion.div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem' }}>
        {[
          { icon: <FiCalendar />,      value: today.length,     label: "Today's Appointments", color: '#dbeafe', iconColor: '#2563b0', onClick: () => navigate('/doctor/appointments') },
          { icon: <FiAlertCircle />,   value: pending.length,   label: 'Pending Review',        color: '#fef3c7', iconColor: '#d97706', onClick: () => navigate('/doctor/appointments') },
          { icon: <FiMessageSquare />, value: unreadMsgs,       label: 'Unread Messages',       color: '#d1fae5', iconColor: '#059669', onClick: () => navigate('/doctor/messages') },
          { icon: <FiBell />,          value: unreadNotifs,     label: 'Notifications',          color: '#ede9fe', iconColor: '#7c3aed', onClick: () => navigate('/doctor/notifications') },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <div
              onClick={s.onClick}
              style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', cursor: 'pointer', transition: 'all .2s', boxShadow: 'var(--shadow-sm)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = '' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--border-radius)', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', color: s.iconColor, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: '1.5rem' }}>

        {/* Activity feed */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <FiActivity color="var(--color-teal)" size={16} /> Recent Activity
          </div>

          {feed.length === 0 ? (
            <EmptyState icon={<FiActivity />} title="No activity yet" message="Appointments and notifications will appear here." />
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: 480 }}>
              {feed.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border-color)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: item.type === 'appointment' ? '#dbeafe' : '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: iconColor[item.type], flexShrink: 0, marginTop: 2 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.2rem' }} className="truncate">
                      {item.text}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }} className="truncate">
                      {item.sub}
                    </div>
                  </div>
                  {item.type === 'appointment' && (
                    <Badge label={item.status} variant={item.status} />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column: upcoming + messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Upcoming consultations */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                <FiClock color="var(--color-teal)" size={14} /> Upcoming
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>View all</Button>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                No upcoming appointments.
              </div>
            ) : (
              upcoming.slice(0, 5).map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary-light)', fontSize: 'var(--text-sm)', flexShrink: 0 }}>
                    {a.patient_name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }} className="truncate">{a.patient_name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiCalendar size={10} />
                      {new Date(a.appointment_time).toLocaleDateString()} {new Date(a.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <Badge label={a.status} variant={a.status} />
                </div>
              ))
            )}
          </motion.div>

          {/* Message summary */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                <FiMessageSquare color="var(--color-teal)" size={14} /> Messages
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/messages')}>Open</Button>
            </div>
            {conversations.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                No conversations yet.
              </div>
            ) : (
              conversations.slice(0, 4).map(c => (
                <div key={c.other_user} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background .15s' }}
                  onClick={() => navigate('/doctor/messages')}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary-light)', fontSize: 'var(--text-sm)', flexShrink: 0 }}>
                    {c.user?.name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: !c.is_read ? 700 : 600, fontSize: 'var(--text-sm)' }} className="truncate">{c.user?.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }} className="truncate">{c.message || 'Appointment confirmed'}</div>
                  </div>
                  {!c.is_read && c.source === 'message' && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary-light)', flexShrink: 0 }} />
                  )}
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default DoctorActivity
