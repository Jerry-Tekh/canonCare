import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiCalendar, FiFileText, FiActivity, FiUsers,
  FiClock, FiTrendingUp, FiBell, FiHeart,
} from 'react-icons/fi'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import useBreakpoint from '../../hooks/useBreakpoint'
import api from '../../services/api'
import { StatCard } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'

const STATUS_COLORS = {
  completed:'#059669', pending:'#d97706', cancelled:'#6b7280',
  accepted:'#2563b0',  rescheduled:'#7c3aed', no_show:'#dc2626',
}
const PIE_COLORS = ['#2563b0','#059669','#d97706','#7c3aed','#dc2626','#6b7280']

const PatientDashboard = () => {
  const { user }    = useAuth()
  const { isMobile } = useBreakpoint()
  const navigate    = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    api.get('/analytics/patient')
      .then(res => setData(res.data))
      .catch(err => setError(err?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}>
      <LoadingSpinner />
    </div>
  )
  if (error) return (
    <div style={{ textAlign:'center', padding:'3rem', color:'var(--color-error)' }}>{error}</div>
  )

  const { stats, monthly, statusBreakdown, typeBreakdown, doctors, prescriptions } = data
  const firstName = user?.name?.split(' ')[0]
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>

      {/* Greeting */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}>
        <h2 style={{ fontSize:'var(--text-3xl)', fontWeight:800, marginBottom:'0.25rem' }}>
          {greeting}, {firstName} 
        </h2>
        <p style={{ color:'var(--text-secondary)' }}>
          Your personal health overview — {new Date().toLocaleDateString('default', { weekday:'long', month:'long', day:'numeric' })}
        </p>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
        style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
        <Button variant="primary" onClick={() => navigate('/patient/book')}>
          <FiCalendar size={14} /> Book Appointment
        </Button>
        <Button variant="outline" onClick={() => navigate('/patient/messages')}>
          Message Doctor
        </Button>
        <Button variant="ghost" onClick={() => navigate('/patient/prescriptions')}>
          <FiFileText size={14} /> Prescriptions
        </Button>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px,1fr))', gap:'1rem' }}>
        {[
          { icon:<FiCalendar />,   value:stats.total,        label:'Total Appointments',   color:'#dbeafe', iconColor:'#2563b0' },
          { icon:<FiClock />,      value:stats.upcoming,     label:'Upcoming',             color:'#d1fae5', iconColor:'#059669' },
          { icon:<FiActivity />,   value:stats.completed,    label:'Completed Visits',     color:'#ede9fe', iconColor:'#7c3aed' },
          { icon:<FiUsers />,      value:stats.doctorsSeen,  label:'Doctors Consulted',    color:'#ccfbf1', iconColor:'#0d9488' },
          { icon:<FiFileText />,   value:prescriptions.length, label:'Active Prescriptions', color:'#fef3c7', iconColor:'#d97706' },
          { icon:<FiBell />,       value:stats.unreadNotifs, label:'Unread Notifications', color:'#fee2e2', iconColor:'#dc2626' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1+i*0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Monthly visits area chart + Status pie */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap:'1.5rem' }}>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <FiTrendingUp color="var(--color-teal)" /> Visit History (6 months)
          </h3>
          {monthly.every(m => m.total === 0) ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>
              No visit history yet. <Button variant="teal" size="sm" style={{ marginLeft:'0.5rem' }} onClick={() => navigate('/patient/book')}>Book now</Button>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563b0" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2563b0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#059669" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#94a3b8', fontSize:11 }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} />
                <Legend style={{ fontSize:12 }} />
                <Area type="monotone" dataKey="total"     name="Total"     stroke="#2563b0" fill="url(#visitGrad)"     strokeWidth={2} dot={{ r:3 }} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#059669" fill="url(#completedGrad)" strokeWidth={2} dot={{ r:3 }} />
                <Area type="monotone" dataKey="video"     name="Video"     stroke="#0d9488" fill="none"                strokeWidth={1.5} strokeDasharray="4 2" dot={{ r:2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'var(--text-base)' }}>Appointment Status</h3>
          {statusBreakdown.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={75} paddingAngle={3} dataKey="value">
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} />
                <Legend iconType="circle" iconSize={8} style={{ fontSize:10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Visit type bar + Doctors visited */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1.5rem' }}>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'var(--text-base)' }}>Visit Types</h3>
          {typeBreakdown.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={typeBreakdown} layout="vertical" barSize={22}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={80}
                  tick={{ fill:'#64748b', fontSize:12, textTransform:'capitalize' }} />
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {typeBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h3 style={{ fontWeight:700, fontSize:'var(--text-base)' }}>My Doctors</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/appointments')}>View all</Button>
          </div>
          {doctors.length === 0 ? (
            <EmptyState icon={<FiUsers />} title="No doctors yet"
              message="Book an appointment to get started."
              action={<Button variant="teal" size="sm" onClick={() => navigate('/patient/book')}>Book now</Button>} />
          ) : doctors.map((d, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.75rem', borderRadius:'var(--border-radius)', background:'var(--bg-secondary)', marginBottom:'0.5rem' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'var(--text-sm)', color:'var(--color-primary-light)', flexShrink:0 }}>
                {d.doctor_name?.[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:'var(--text-sm)' }} className="truncate">{d.doctor_name}</div>
                <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
                  {d.specialization} · {d.visit_count} visit{d.visit_count !== 1 ? 's' : ''}
                </div>
              </div>
              <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', flexShrink:0 }}>
                {new Date(d.last_visit).toLocaleDateString()}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Recent prescriptions */}
      {prescriptions.length > 0 && (
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h3 style={{ fontWeight:700, display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <FiHeart color="var(--color-teal)" size={16} /> Active Prescriptions
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/prescriptions')}>View all</Button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'0.875rem' }}>
            {prescriptions.map(rx => {
              const meds = (() => { try { return Array.isArray(rx.medication_details) ? rx.medication_details : JSON.parse(rx.medication_details || '[]') } catch { return [] } })()
              return (
                <div key={rx.id} style={{ background:'var(--bg-secondary)', borderRadius:'var(--border-radius)', padding:'0.875rem 1rem', border:'1px solid var(--border-color)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.375rem' }}>
                    <div style={{ fontWeight:700, fontSize:'var(--text-sm)' }}>Dr. {rx.doctor_name}</div>
                    <Badge label={rx.is_active ? 'Active' : 'Expired'} variant={rx.is_active ? 'active' : 'inactive'} />
                  </div>
                  {rx.diagnosis && <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginBottom:'0.5rem', fontStyle:'italic' }}>{rx.diagnosis}</div>}
                  <div style={{ display:'flex', gap:'0.375rem', flexWrap:'wrap' }}>
                    {meds.slice(0,3).map((m, mi) => (
                      <span key={mi} style={{ fontSize:'0.65rem', background:'var(--color-slate-light)', color:'var(--color-primary)', padding:'2px 7px', borderRadius:'9999px', fontWeight:600 }}>
                        {m.name}
                      </span>
                    ))}
                    {meds.length > 3 && <span style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>+{meds.length-3} more</span>}
                  </div>
                  <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', marginTop:'0.375rem' }}>
                    {new Date(rx.created_at).toLocaleDateString()} · {rx.specialization}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default PatientDashboard
