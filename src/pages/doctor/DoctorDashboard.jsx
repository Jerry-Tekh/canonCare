import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUsers, FiCalendar, FiCheckCircle, FiClock, FiTrendingUp,
  FiAlertTriangle, FiStar, FiActivity, FiArrowRight,
} from 'react-icons/fi'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
  AreaChart, Area, Legend,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import styles from './DoctorDashboard.module.css'

const STATUS_COLORS = { completed:'#00a98d', pending:'#d58b18', cancelled:'#82919a', accepted:'#493077', rescheduled:'#8971b1', no_show:'#c94d4d' }
const PIE_COLORS = ['#00a98d','#493077','#d58b18','#4b9fc2','#c94d4d','#82919a']

const Metric = ({ icon, value, label, note, tone = 'teal' }) => (
  <article className={`${styles.metric} ${styles[tone]}`}>
    <span className={styles.metricIcon}>{icon}</span>
    <div className={styles.metricCopy}><span className={styles.metricValue}>{value}</span><span className={styles.metricLabel}>{label}</span>{note && <span className={styles.metricNote}>{note}</span>}</div>
  </article>
)

const ChartCard = ({ title, description, children, className = '' }) => (
  <section className={`${styles.chartCard} ${className}`}>
    <div className={styles.cardHeading}><h3>{title}</h3>{description && <p>{description}</p>}</div>
    {children}
  </section>
)

const DoctorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) return <div className={styles.state}><LoadingSpinner /></div>
  if (error) return <div className={styles.stateError} role="alert">{error}</div>

  const { stats, weekly, monthly, statusBreakdown, typeBreakdown, topPatients, recent, rating } = analytics
  const firstName = user?.name?.split(' ')[0] || 'Doctor'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todayLabel = new Date().toLocaleDateString('default', { weekday:'long', month:'long', day:'numeric' })
  const weekAppointments = weekly.reduce((sum, day) => sum + Number(day.appointments || 0), 0)
  const weekCompleted = weekly.reduce((sum, day) => sum + Number(day.completed || 0), 0)
  const latestRating = rating?.slice(-1)[0]?.avg_rating ?? '—'

  return (
    <div className={styles.dashboard}>
      <motion.header className={styles.pageHeader} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
        <div><span className={styles.eyebrow}>CLINICAL OVERVIEW</span><h2>{greeting}, Dr. {firstName}</h2><p>{todayLabel} · Here’s your practice at a glance.</p></div>
        <Button variant="teal" onClick={() => navigate('/doctor/appointments')}><FiCalendar /> View appointments <FiArrowRight /></Button>
      </motion.header>

      {stats.pending > 3 && <div className={styles.attention} role="status"><FiAlertTriangle /><div><strong>{stats.pending} appointments need your attention</strong><span>Review pending requests when you’re ready.</span></div><Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>Review</Button></div>}

      <section className={styles.metricGrid} aria-label="Practice summary">
        <Metric icon={<FiCalendar />} value={stats.total} label="Total appointments" note="All time" />
        <Metric icon={<FiClock />} value={stats.pending} label="Awaiting response" note={stats.pending > 0 ? 'Review when available' : 'You’re all caught up'} tone={stats.pending ? 'amber' : 'teal'} />
        <Metric icon={<FiUsers />} value={stats.today} label="Patients today" note="Scheduled today" tone="purple" />
        <Metric icon={<FiCheckCircle />} value={stats.completed} label="Completed visits" note="All time" tone="blue" />
      </section>

      <div className={styles.primaryCharts}>
        <ChartCard title="Appointments this week" description={`${weekAppointments} appointments · ${weekCompleted} completed`}>
          {weekly.every(day => day.appointments === 0) ? <EmptyState icon={<FiCalendar />} title="No appointments this week" message="Your weekly activity will appear here." /> : (
            <div className={styles.chart} role="img" aria-label={`${weekAppointments} appointments and ${weekCompleted} completed over the last seven days`}>
              <ResponsiveContainer width="100%" height={240}><BarChart data={weekly} barSize={25} barGap={5}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill:'#647780', fontSize:12 }} />
                <YAxis hide allowDecimals={false} /><Tooltip contentStyle={{ border:'1px solid #e5ecea', borderRadius:10, fontSize:12 }} formatter={(v,n) => [v, n === 'appointments' ? 'Total' : 'Completed']} />
                <Legend /><Bar dataKey="appointments" name="Total" fill="#bcece2" radius={[6,6,0,0]} /><Bar dataKey="completed" name="Completed" fill="#00a98d" radius={[6,6,0,0]} />
              </BarChart></ResponsiveContainer>
            </div>
          )}
        </ChartCard>
        <ChartCard title="Six-month activity" description="Appointment totals and completed visits by month.">
          {monthly.length === 0 ? <EmptyState icon={<FiActivity />} title="No history yet" message="Monthly activity will appear as appointments are recorded." /> : (
            <div className={styles.chart} role="img" aria-label="Area chart comparing total appointments with completed visits across the last six months">
              <ResponsiveContainer width="100%" height={240}><AreaChart data={monthly}>
                <defs><linearGradient id="doctorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#493077" stopOpacity={.18} /><stop offset="95%" stopColor="#493077" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaf0ee" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#647780', fontSize:11 }} /><YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ border:'1px solid #e5ecea', borderRadius:10, fontSize:12 }} /><Legend />
                <Area type="monotone" dataKey="total" name="Total" stroke="#493077" fill="url(#doctorTotal)" strokeWidth={2.5} dot={{ r:3 }} /><Area type="monotone" dataKey="completed" name="Completed" stroke="#00a98d" fill="none" strokeWidth={2} dot={{ r:3 }} />
              </AreaChart></ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className={styles.activityGrid}>
        <section className={styles.listCard}>
          <div className={styles.listHeading}><div><h3>Recent appointments</h3><p>Your latest patient visits</p></div><Button variant="ghost" size="sm" onClick={() => navigate('/doctor/appointments')}>View all <FiArrowRight /></Button></div>
          {recent.length === 0 ? <EmptyState icon={<FiCalendar />} title="No appointments yet" message="Recent appointments will appear here." /> : <div className={styles.rows}>{recent.map(appointment => <article className={styles.personRow} key={appointment.id}>
            <span className={styles.avatar}>{appointment.patient_name?.[0] || 'P'}</span><div className={styles.rowText}><strong>{appointment.patient_name}</strong><span>{new Date(appointment.appointment_time).toLocaleDateString()} · {appointment.type?.replace('_',' ')}</span></div><Badge label={appointment.status} variant={appointment.status} />
          </article>)}</div>}
        </section>
        <section className={styles.listCard}>
          <div className={styles.listHeading}><div><h3>Most-seen patients</h3><p>Patients with the most visits</p></div><Button variant="ghost" size="sm" onClick={() => navigate('/doctor/patients')}>View patients <FiArrowRight /></Button></div>
          {topPatients.length === 0 ? <EmptyState icon={<FiUsers />} title="No patients yet" message="Patient activity will appear here." /> : <div className={styles.rows}>{topPatients.map((patient,index) => <article className={styles.personRow} key={`${patient.patient_name}-${index}`}>
            <span className={styles.avatar}>{patient.patient_name?.[0] || 'P'}</span><div className={styles.rowText}><strong>{patient.patient_name}</strong><span>{patient.visit_count} visit{patient.visit_count !== 1 ? 's' : ''} · Last: {new Date(patient.last_visit).toLocaleDateString()}</span></div><span className={styles.rank}>#{index + 1}</span>
          </article>)}</div>}
        </section>
      </div>

      <details className={styles.details}>
        <summary>More practice insights</summary>
        <div className={styles.secondaryCharts}>
          <ChartCard title="Appointment status" description="Status counts; labels and values are available in the chart tooltip.">
            {statusBreakdown.length === 0 ? <p className={styles.emptyText}>No appointment status data yet.</p> : <div className={styles.chart} role="img" aria-label={`Appointment status breakdown across ${statusBreakdown.length} statuses`}><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value">{statusBreakdown.map((item,index)=><Cell key={item.name} fill={STATUS_COLORS[item.name] || PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ border:'1px solid #e5ecea', borderRadius:10, fontSize:12 }} /><Legend /></PieChart></ResponsiveContainer><ul className={styles.chartSummary}>{statusBreakdown.map(item=><li key={item.name}><span>{item.name.replace('_',' ')}</span><strong>{item.value}</strong></li>)}</ul></div>}
          </ChartCard>
          <ChartCard title="Visit types" description="Appointments grouped by visit type.">
            {typeBreakdown.length === 0 ? <p className={styles.emptyText}>No visit type data yet.</p> : <div className={styles.chart} role="img" aria-label={`Visit type breakdown across ${typeBreakdown.length} categories`}><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value">{typeBreakdown.map((item,index)=><Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={{ border:'1px solid #e5ecea', borderRadius:10, fontSize:12 }} /><Legend /></PieChart></ResponsiveContainer><ul className={styles.chartSummary}>{typeBreakdown.map(item=><li key={item.name}><span>{item.name.replace('_',' ')}</span><strong>{item.value}</strong></li>)}</ul></div>}
          </ChartCard>
          <ChartCard title="Patient rating trend" description={`Latest monthly average rating: ${latestRating} out of 5.`}>
            {rating.length === 0 ? <EmptyState icon={<FiStar />} title="No reviews yet" message="Ratings will appear when patients leave feedback." /> : <div className={styles.chart} role="img" aria-label={`Patient rating trend with a latest average rating of ${latestRating} out of five`}><ResponsiveContainer width="100%" height={220}><LineChart data={rating}><CartesianGrid strokeDasharray="3 3" stroke="#eaf0ee" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:'#647780', fontSize:11 }} /><YAxis domain={[0,5]} hide /><Tooltip contentStyle={{ border:'1px solid #e5ecea', borderRadius:10, fontSize:12 }} formatter={value => [`${value} / 5`, 'Average rating']} /><Line type="monotone" dataKey="avg_rating" name="Average rating" stroke="#d58b18" strokeWidth={2.5} dot={{ r:4, fill:'#d58b18' }} /></LineChart></ResponsiveContainer></div>}
          </ChartCard>
          <Metric icon={<FiUsers />} value={stats.uniquePatients} label="Unique patients" note="All time" tone="purple" />
          <Metric icon={<FiStar />} value={latestRating} label="Latest average rating" note="Out of 5" tone="amber" />
        </div>
      </details>
    </div>
  )
}

export default DoctorDashboard
