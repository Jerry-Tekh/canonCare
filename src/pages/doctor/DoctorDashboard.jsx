import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUsers, FiCalendar, FiCheckCircle, FiClock,
  FiTrendingUp, FiAlertTriangle, FiStar, FiActivity,
} from 'react-icons/fi'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
  AreaChart, Area, Legend,
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
  completed:   '#059669',
  pending:     '#d97706',
  cancelled:   '#6b7280',
  accepted:    '#2563b0',
  rescheduled: '#7c3aed',
  no_show:     '#dc2626',
}

const PIE_COLORS = ['#2563b0','#059669','#d97706','#7c3aed','#dc2626','#6b7280']

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.35 } }),
}

const DoctorDashboard = () => {
  const { user }  = useAuth()
  const { isMobile, isTablet } = useBreakpoint()
  const navigate  = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/analytics/doctor')
        setAnalytics(res.data)
      } catch (err) {
        setError(err?.data?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}>
      <LoadingSpinner />
    </div>
  )

  if (error) return (
    <div style={{ textAlign:'center', padding:'3rem', color:'var(--color-error)' }}>{error}</div>
  )

  const { stats, weekly, monthly, statusBreakdown, typeBreakdown, topPatients, recent, rating } = analytics

  const firstName = user?.name?.split(' ')[0]
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>

      {/* Greeting */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}>
        <h2 style={{ fontSize:'var(--text-3xl)', fontWeight:800, marginBottom:'0.25rem' }}>
          {greeting}, Dr. {firstName} 👋
        </h2>
        <p style={{ color:'var(--text-secondary)' }}>
          Here's your clinical overview — {new Date().toLocaleDateString('default', { weekday:'long', month:'long', day:'numeric' })}
        </p>
      </motion.div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px,1fr))', gap:'1rem' }}>
        {[
          { icon:<FiCalendar />,    value: stats.total,          label:'Total Appointments', color:'#dbeafe', iconColor:'#2563b0', change:'+12% this month', changeType:'up' },
          { icon:<FiClock />,       value: stats.pending,         label:'Awaiting Response',  color:'#fef3c7', iconColor:'#d97706', change: stats.pending > 0 ? 'Needs attention' : 'All clear', changeType: stats.pending > 0 ? 'down' : 'up' },
          { icon:<FiUsers />,       value: stats.today,           label:"Today's Patients",   color:'#d1fae5', iconColor:'#059669', change:'Scheduled today',  changeType:'up' },
          { icon:<FiCheckCircle />, value: stats.completed,       label:'Completed',          color:'#ede9fe', iconColor:'#7c3aed', change:'All time',         changeType:'up' },
          { icon:<FiUsers />,       value: stats.uniquePatients,  label:'Unique Patients',    color:'#ccfbf1', iconColor:'#0d9488', change:'All time',         changeType:'up' },
          { icon:<FiStar />,        value: `${analytics.rating?.slice(-1)[0]?.avg_rating || '—'}`, label:'Avg Rating', color:'#fef9c3', iconColor:'#ca8a04', change:'Last month', changeType:'up' },
        ].map((s, i) => (
          <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Weekly bar + Monthly area */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1.5rem' }}>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <FiTrendingUp color="var(--color-teal)" /> Last 7 Days
          </h3>
          {weekly.every(d => d.appointments === 0) ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>
              No appointments in the last 7 days
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekly} barSize={28} barGap={4}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill:'#94a3b8', fontSize:12 }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ border:'none', borderRadius:8, boxShadow:'var(--shadow-md)', fontSize:13 }}
                  formatter={(v, n) => [v, n === 'appointments' ? 'Total' : 'Completed']} />
                <Legend style={{ fontSize:12 }} />
                <Bar dataKey="appointments" name="Total"     fill="#dbeafe" radius={[4,4,0,0]} />
                <Bar dataKey="completed"    name="Completed" fill="#2563b0"  radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <FiActivity color="var(--color-teal)" /> 6-Month Trend
          </h3>
          {monthly.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No historical data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563b0" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563b0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#94a3b8', fontSize:11 }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} />
                <Legend style={{ fontSize:12 }} />
                <Area type="monotone" dataKey="total"     name="Total"     stroke="#2563b0" fill="url(#totalGrad)"     strokeWidth={2} dot={{ r:3 }} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#059669" fill="url(#completedGrad)" strokeWidth={2} dot={{ r:3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Status pie + Type donut + Rating line */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap:'1.5rem' }}>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'var(--text-base)' }}>Appointment Status</h3>
          {statusBreakdown.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} formatter={(v,n) => [v, n]} />
                <Legend iconType="circle" iconSize={8} style={{ fontSize:11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'var(--text-base)' }}>Visit Types</h3>
          {typeBreakdown.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {typeBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} />
                <Legend iconType="circle" iconSize={8} style={{ fontSize:11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'var(--text-base)' }}>Rating Trend</h3>
          {rating.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No reviews yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={rating}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#94a3b8', fontSize:11 }} />
                <YAxis domain={[0, 5]} hide />
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} formatter={(v) => [`${v} ⭐`, 'Avg Rating']} />
                <Line type="monotone" dataKey="avg_rating" stroke="#ca8a04" strokeWidth={2.5} dot={{ r:4, fill:'#ca8a04' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Top patients + Recent appointments */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1.5rem' }}>

        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h3 style={{ fontWeight:700 }}>Top Patients</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/patients')}>View all</Button>
          </div>
          {topPatients.length === 0 ? (
            <EmptyState icon={<FiUsers />} title="No patients yet" />
          ) : topPatients.map((p, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.75rem', borderRadius:'var(--border-radius)', background:'var(--bg-secondary)', marginBottom:'0.5rem' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'var(--text-sm)', color:'var(--color-primary-light)', flexShrink:0 }}>
                {p.patient_name?.[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:'var(--text-sm)' }} className="truncate">{p.patient_name}</div>
                <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
                  {p.visit_count} visit{p.visit_count !== 1 ? 's' : ''} · Last: {new Date(p.last_visit).toLocaleDateString()}
                </div>
              </div>
              <span style={{ fontSize:'var(--text-xs)', fontWeight:700, color:'var(--color-teal)', background:'var(--color-teal-light)', padding:'2px 8px', borderRadius:'9999px' }}>
                #{i + 1}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h3 style={{ fontWeight:700 }}>Recent Appointments</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>View all</Button>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={<FiCalendar />} title="No appointments yet" />
          ) : recent.map((a) => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.625rem 0.75rem', borderRadius:'var(--border-radius)', background:'var(--bg-secondary)', marginBottom:'0.5rem' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'var(--text-sm)', color:'var(--color-primary-light)', flexShrink:0 }}>
                {a.patient_name?.[0]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:'var(--text-sm)' }} className="truncate">{a.patient_name}</div>
                <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
                  {new Date(a.appointment_time).toLocaleDateString()} · {a.type?.replace('_',' ')}
                </div>
              </div>
              <Badge label={a.status} variant={a.status} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Emergency alert if pending > 3 */}
      {stats.pending > 3 && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:'var(--border-radius-lg)', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem' }}>
          <FiAlertTriangle size={24} color="#f59e0b" style={{ flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:'#92400e' }}>
              {stats.pending} appointment{stats.pending !== 1 ? 's' : ''} awaiting your response
            </div>
            <div style={{ fontSize:'var(--text-sm)', color:'#b45309' }}>Review and accept or decline pending appointments.</div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>Review</Button>
        </motion.div>
      )}
    </div>
  )
}

export default DoctorDashboard
