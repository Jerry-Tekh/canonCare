import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiActivity, FiCalendar, FiFileText, FiBell,
  FiHeart, FiClock, FiTrendingUp, FiAlertCircle,
} from 'react-icons/fi'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../services/api'
import useBreakpoint from '../../hooks/useBreakpoint'
import { useAuth } from '../../context/AuthContext'
import { StatCard } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const PatientHealth = () => {
  const { user }   = useAuth()
  const { isMobile } = useBreakpoint()
  const navigate   = useNavigate()
  const [data, setData]       = useState({ appointments: [], prescriptions: [], notifications: [], profile: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [apptRes, rxRes, notifRes, profileRes] = await Promise.all([
          api.get('/appointments?limit=20'),
          api.get('/prescriptions?limit=5'),
          api.get('/notifications?limit=5'),
          api.get(`/users/${user?.id}`),
        ])
        setData({
          appointments:  apptRes.data  || [],
          prescriptions: rxRes.data    || [],
          notifications: notifRes.data || [],
          profile:       profileRes.data,
        })
      } catch { /* show empty state gracefully */ }
      finally { setLoading(false) }
    }
    if (user?.id) load()
  }, [user?.id])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <LoadingSpinner />
    </div>
  )

  const { appointments, prescriptions, notifications, profile } = data
  const p = profile?.profile || {}

  const upcoming  = appointments.filter(a => ['pending','accepted'].includes(a.status) && new Date(a.appointment_time) > new Date())
  const completed = appointments.filter(a => a.status === 'completed')
  const activeRx  = prescriptions.filter(rx => rx.is_active)
  const unread    = notifications.filter(n => !n.is_read)

  // Simple appointment-per-month chart data (last 6 months)
  const monthlyData = (() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleDateString('default', { month: 'short' })
      const count = appointments.filter(a => {
        const ad = new Date(a.appointment_time)
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear()
      }).length
      months.push({ month: label, visits: count })
    }
    return months
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.25rem' }}>
          Health Overview
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your complete health summary, {user?.name?.split(' ')[0]}.
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { icon: <FiCalendar />,   value: upcoming.length,  label: 'Upcoming Appointments', color: '#dbeafe', iconColor: '#2563b0' },
          { icon: <FiActivity />,   value: completed.length, label: 'Visits Completed',       color: '#d1fae5', iconColor: '#059669' },
          { icon: <FiFileText />,   value: activeRx.length,  label: 'Active Prescriptions',   color: '#ede9fe', iconColor: '#7c3aed' },
          { icon: <FiBell />,       value: unread.length,    label: 'Unread Notifications',   color: '#fef3c7', iconColor: '#d97706' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>

        {/* Activity chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <FiTrendingUp color="var(--color-teal)" />
            <span style={{ fontWeight: 700 }}>Visit History (6 months)</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis hide allowDecimals={false} />
              <Tooltip contentStyle={{ border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="visits" stroke="var(--color-primary-light)" strokeWidth={2.5}
                dot={{ r: 4, fill: 'var(--color-primary-light)' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Health profile */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <FiHeart color="var(--color-teal)" />
            <span style={{ fontWeight: 700 }}>Health Profile</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              ['Blood Type',        p.blood_type       || '—'],
              ['Gender',            p.gender           || '—'],
              ['Allergies',         p.allergies        || 'None known'],
              ['Medical History',   p.medical_history  || 'None on record'],
              ['Emergency Contact', p.emergency_contact_name
                ? `${p.emergency_contact_name} · ${p.emergency_contact_phone || ''}`
                : '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', fontSize: 'var(--text-sm)' }}>
                <span style={{ minWidth: 130, fontWeight: 600, color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center' }}>{label}</span>
                <span style={{ color: val === '—' ? 'var(--text-muted)' : 'var(--text-primary)', fontStyle: val === '—' ? 'italic' : 'normal' }}>{val}</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" style={{ marginTop: '1rem', width: '100%' }} onClick={() => navigate('/patient/settings')}>
            Update Health Profile
          </Button>
        </motion.div>
      </div>

      {/* Upcoming appointments */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <FiCalendar color="var(--color-teal)" /> Upcoming Appointments
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/patient/appointments')}>View all</Button>
        </div>
        {upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No upcoming appointments.
            <Button variant="teal" size="sm" style={{ marginLeft: '0.75rem' }} onClick={() => navigate('/patient/book')}>
              Book now
            </Button>
          </div>
        ) : (
          upcoming.slice(0, 4).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0.875rem', borderRadius: 'var(--border-radius)', background: 'var(--bg-secondary)', marginBottom: '0.5rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-primary-light)', fontSize: 'var(--text-sm)', flexShrink: 0 }}>
                {a.doctor_name?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{a.doctor_name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', gap: '0.625rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiCalendar size={10} /> {new Date(a.appointment_time).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiClock size={10} /> {new Date(a.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <Badge label={a.status} variant={a.status} />
            </div>
          ))
        )}
      </motion.div>

      {/* Recent prescriptions */}
      {prescriptions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <FiFileText color="var(--color-teal)" /> Recent Prescriptions
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/prescriptions')}>View all</Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {prescriptions.slice(0, 3).map(rx => {
              const meds = Array.isArray(rx.medication_details)
                ? rx.medication_details
                : (() => { try { return JSON.parse(rx.medication_details || '[]') } catch { return [] } })()
              return (
                <div key={rx.id} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', padding: '0.875rem 1rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.25rem' }}>
                    Dr. {rx.doctor_name}
                  </div>
                  {rx.diagnosis && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                      {rx.diagnosis}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {meds.slice(0, 2).map((m, mi) => (
                      <span key={mi} style={{ fontSize: '0.65rem', background: 'var(--color-slate-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--border-radius-full)', fontWeight: 600 }}>
                        {m.name}
                      </span>
                    ))}
                    {meds.length > 2 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{meds.length - 2} more</span>
                    )}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                    {new Date(rx.created_at).toLocaleDateString()}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Recent notifications */}
      {notifications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <FiBell color="var(--color-teal)" /> Recent Notifications
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/notifications')}>View all</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifications.slice(0, 4).map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.625rem 0.875rem', background: n.is_read ? 'transparent' : 'var(--color-info-bg)', borderRadius: 'var(--border-radius)', border: `1px solid ${n.is_read ? 'var(--border-color)' : 'rgba(37,99,235,.15)'}` }}>
                <FiAlertCircle size={14} color={n.is_read ? 'var(--text-muted)' : 'var(--color-info)'} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 'var(--text-sm)' }}>{n.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{n.message}</div>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {new Date(n.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default PatientHealth
