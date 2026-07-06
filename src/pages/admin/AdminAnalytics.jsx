import useBreakpoint from '../../hooks/useBreakpoint'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers, FiCalendar, FiMessageSquare, FiFileText,
  FiShield, FiTrendingUp, FiActivity, FiCheckCircle,
} from 'react-icons/fi'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
  AreaChart, Area, Legend,
} from 'recharts'
import api from '../../services/api'
import { StatCard } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const PIE_COLORS = ['#2563b0','#059669','#d97706','#7c3aed','#dc2626','#6b7280']
const STATUS_COLORS = {
  completed:'#059669', pending:'#d97706', cancelled:'#6b7280',
  accepted:'#2563b0', rescheduled:'#7c3aed', no_show:'#dc2626',
}

const AdminAnalytics = () => {
  const { isMobile, isTablet } = useBreakpoint()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setData(res.data))
      .catch(err => setError(err?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><LoadingSpinner /></div>
  if (error)   return <div style={{ textAlign:'center', padding:'3rem', color:'var(--color-error)' }}>{error}</div>

  const { overview, userGrowth, apptTrend, apptByStatus, apptByType, topDoctors, recentActivity } = data

  const stats = [
    { icon:<FiUsers />,       value: parseInt(overview.total_users),              label:'Total Users',            color:'#dbeafe', iconColor:'#2563b0' },
    { icon:<FiUsers />,       value: parseInt(overview.total_patients),            label:'Patients',               color:'#d1fae5', iconColor:'#059669' },
    { icon:<FiUsers />,       value: parseInt(overview.total_doctors),             label:'Doctors',                color:'#ede9fe', iconColor:'#7c3aed' },
    { icon:<FiCalendar />,    value: parseInt(overview.total_appointments),        label:'Total Appointments',     color:'#fef3c7', iconColor:'#d97706' },
    { icon:<FiCheckCircle />, value: parseInt(overview.completed_appointments),    label:'Completed',              color:'#d1fae5', iconColor:'#059669' },
    { icon:<FiCalendar />,    value: parseInt(overview.today_appointments),        label:"Today's Appointments",  color:'#ccfbf1', iconColor:'#0d9488' },
    { icon:<FiMessageSquare />,value: parseInt(overview.total_messages),           label:'Messages Sent',          color:'#e0e7ff', iconColor:'#4f46e5' },
    { icon:<FiFileText />,    value: parseInt(overview.active_prescriptions),      label:'Active Prescriptions',   color:'#fce7f3', iconColor:'#db2777' },
    { icon:<FiShield />,      value: parseInt(overview.users_with_2fa),            label:'Users with 2FA',         color:'#d1fae5', iconColor:'#059669' },
    { icon:<FiCheckCircle />, value: parseInt(overview.verified_users),            label:'Verified Accounts',      color:'#dbeafe', iconColor:'#2563b0' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h2 style={{ fontSize:'var(--text-3xl)', fontWeight:800, marginBottom:'0.25rem' }}>Platform Analytics</h2>
        <p style={{ color:'var(--text-secondary)' }}>Real-time system-wide metrics — all data from the database.</p>
      </motion.div>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px,1fr))', gap:'1rem' }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* User growth + Appointment trend */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1.5rem' }}>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <FiTrendingUp color="var(--color-teal)" size={16}/> User Growth (6 months)
          </h3>
          {userGrowth.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userGrowth} barSize={20} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#94a3b8', fontSize:11 }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} />
                <Legend style={{ fontSize:12 }} />
                <Bar dataKey="patients" name="Patients" fill="#059669" radius={[4,4,0,0]} />
                <Bar dataKey="doctors"  name="Doctors"  fill="#2563b0" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <FiActivity color="var(--color-teal)" size={16}/> Appointment Volume (6 months)
          </h3>
          {apptTrend.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={apptTrend}>
                <defs>
                  <linearGradient id="totalG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563b0" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563b0" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="compG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#059669" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#94a3b8', fontSize:11 }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} />
                <Legend style={{ fontSize:12 }} />
                <Area type="monotone" dataKey="total"     name="Total"     stroke="#2563b0" fill="url(#totalG)" strokeWidth={2} dot={{ r:3 }} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#059669" fill="url(#compG)"  strokeWidth={2} dot={{ r:3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Status pie + Type donut + Top doctors */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap:'1.5rem' }}>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'var(--text-base)' }}>Status Breakdown</h3>
          {apptByStatus.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={apptByStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {apptByStatus.map((e,i) => <Cell key={i} fill={STATUS_COLORS[e.name] || PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} />
                <Legend iconType="circle" iconSize={8} style={{ fontSize:10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'var(--text-base)' }}>Visit Types</h3>
          {apptByType.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={apptByType} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                  {apptByType.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ border:'none', borderRadius:8, fontSize:12 }} />
                <Legend iconType="circle" iconSize={8} style={{ fontSize:10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
          style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'var(--text-base)' }}>Top Doctors</h3>
          {topDoctors.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No data</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
              {topDoctors.map((d,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.5rem 0.625rem', background:'var(--bg-secondary)', borderRadius:'var(--border-radius)' }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'var(--text-xs)', color:'var(--color-primary-light)', flexShrink:0 }}>
                    {d.doctor_name?.[0]}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'var(--text-xs)' }} className="truncate">{d.doctor_name}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{d.specialization}</div>
                  </div>
                  <span style={{ fontSize:'var(--text-xs)', fontWeight:700, color:'var(--color-teal)', background:'var(--color-teal-light)', padding:'2px 6px', borderRadius:'9999px', flexShrink:0 }}>
                    {d.completed} ✓
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent security activity */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65 }}
        style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.5rem', boxShadow:'var(--shadow-sm)' }}>
        <h3 style={{ fontWeight:700, marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <FiShield color="var(--color-teal)" size={16}/> Recent Security Events
        </h3>
        {recentActivity.length === 0 ? (
          <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>No security events recorded</div>
        ) : (
          <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'var(--text-sm)', minWidth:540 }}>
              <thead>
                <tr style={{ background:'var(--bg-secondary)', borderBottom:'1px solid var(--border-color)' }}>
                  {['Event', 'User', 'Role', 'IP Address', 'Time'].map(h => (
                    <th key={h} style={{ padding:'0.625rem 0.875rem', textAlign:'left', fontWeight:700, color:'var(--text-secondary)', fontSize:'var(--text-xs)', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((e,i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border-color)' }}
                    onMouseEnter={el => el.currentTarget.style.background = 'var(--bg-secondary)'}
                    onMouseLeave={el => el.currentTarget.style.background = ''}>
                    <td style={{ padding:'0.625rem 0.875rem' }}>
                      <code style={{ background:'var(--bg-secondary)', padding:'2px 8px', borderRadius:4, fontSize:'0.7rem', color:'var(--color-primary-light)', fontFamily:'var(--font-mono)' }}>
                        {e.event_type}
                      </code>
                    </td>
                    <td style={{ padding:'0.625rem 0.875rem', fontWeight:600 }}>{e.user_name || '—'}</td>
                    <td style={{ padding:'0.625rem 0.875rem' }}>
                      {e.user_role && <Badge label={e.user_role} variant={e.user_role} />}
                    </td>
                    <td style={{ padding:'0.625rem 0.875rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'var(--text-xs)' }}>{e.ip_address || '—'}</td>
                    <td style={{ padding:'0.625rem 0.875rem', color:'var(--text-muted)', fontSize:'var(--text-xs)', whiteSpace:'nowrap' }}>
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AdminAnalytics
