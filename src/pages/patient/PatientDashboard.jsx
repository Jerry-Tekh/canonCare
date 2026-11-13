import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCalendar, FiFileText, FiActivity, FiUsers, FiBell, FiHeart, FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import styles from './PatientDashboard.module.css'

const STATUS_COLORS = { completed: '#00a98d', pending: '#d58b18', cancelled: '#82919a', accepted: '#493077', rescheduled: '#8971b1', no_show: '#c94d4d' }
const TYPE_COLORS = ['#00a98d', '#493077', '#d58b18', '#4b9fc2', '#c94d4d', '#82919a']

const Metric = ({ icon, value, label, note, tone = 'teal' }) => (
  <article className={`${styles.metric} ${styles[tone]}`}>
    <span className={styles.metricIcon}>{icon}</span>
    <div><strong>{value}</strong><span>{label}</span><small>{note}</small></div>
  </article>
)

const ChartCard = ({ title, description, children }) => (
  <section className={styles.chartCard}>
    <div className={styles.cardHeading}><h3>{title}</h3><p>{description}</p></div>
    {children}
  </section>
)

const PatientDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/analytics/patient')
      .then(res => setData(res.data))
      .catch(err => setError(err?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.state}><LoadingSpinner /></div>
  if (error) return <div className={styles.stateError} role="alert">{error}</div>

  const { stats, monthly, statusBreakdown, typeBreakdown, doctors, prescriptions } = data
  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })
  const visitTotal = monthly.reduce((sum, item) => sum + Number(item.total || 0), 0)
  const completedTotal = monthly.reduce((sum, item) => sum + Number(item.completed || 0), 0)

  return (
    <div className={styles.dashboard}>
      <motion.header className={styles.pageHeader} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div><span className={styles.eyebrow}>YOUR HEALTH OVERVIEW</span><h2>{greeting}, {firstName}</h2><p>{today} · Your care, all in one place.</p></div>
        <div className={styles.headerActions}>
          <Button variant="teal" onClick={() => navigate('/patient/book')}><FiCalendar /> Book an appointment <FiArrowRight /></Button>
          <Button variant="outline" onClick={() => navigate('/patient/messages')}>Message your doctor</Button>
        </div>
      </motion.header>

      <section className={styles.metricGrid} aria-label="Your care summary">
        <Metric icon={<FiCalendar />} value={stats.upcoming} label="Upcoming appointments" note="Coming up" />
        <Metric icon={<FiCheckCircle />} value={stats.completed} label="Completed visits" note="All time" tone="purple" />
        <Metric icon={<FiHeart />} value={prescriptions.length} label="Active prescriptions" note="Current care" tone="blue" />
        <Metric icon={<FiUsers />} value={stats.doctorsSeen} label="Doctors consulted" note="Your care team" />
      </section>

      <div className={styles.primaryCharts}>
        <ChartCard title="Your visit history" description={`${visitTotal} visits · ${completedTotal} completed over the last six months`}>
          {monthly.every(item => item.total === 0) ? (
            <EmptyState icon={<FiActivity />} title="Your visit history will appear here" message="When you have visits, you’ll see your activity over time." action={<Button variant="teal" size="sm" onClick={() => navigate('/patient/book')}>Book an appointment</Button>} />
          ) : (
            <div className={styles.chart} role="img" aria-label={`${visitTotal} visits and ${completedTotal} completed over the last six months`}>
              <ResponsiveContainer width="100%" height={230}><AreaChart data={monthly}>
                <defs><linearGradient id="patientVisits" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#493077" stopOpacity={.16} /><stop offset="95%" stopColor="#493077" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaf0ee" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#647780', fontSize: 11 }} /><YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ border: '1px solid #e5ecea', borderRadius: 10, fontSize: 12 }} /><Legend />
                <Area type="monotone" dataKey="total" name="Total visits" stroke="#493077" fill="url(#patientVisits)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#00a98d" fill="none" strokeWidth={2} dot={{ r: 3 }} />
                <Area type="monotone" dataKey="video" name="Virtual visits" stroke="#4b9fc2" fill="none" strokeWidth={1.7} strokeDasharray="4 3" dot={{ r: 2 }} />
              </AreaChart></ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Appointment status" description="Appointments grouped by status.">
          {statusBreakdown.length === 0 ? <EmptyState icon={<FiCalendar />} title="No appointment activity yet" message="Your status summary will appear here." /> : (
            <div className={styles.chart} role="img" aria-label={`Appointment status breakdown across ${statusBreakdown.length} statuses`}>
              <ResponsiveContainer width="100%" height={205}><PieChart><Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value">
                {statusBreakdown.map((item, index) => <Cell key={item.name} fill={STATUS_COLORS[item.name] || TYPE_COLORS[index % TYPE_COLORS.length]} />)}
              </Pie><Tooltip contentStyle={{ border: '1px solid #e5ecea', borderRadius: 10, fontSize: 12 }} /><Legend /></PieChart></ResponsiveContainer>
              <ul className={styles.chartSummary}>{statusBreakdown.map(item => <li key={item.name}><span>{item.name.replace('_', ' ')}</span><strong>{item.value}</strong></li>)}</ul>
            </div>
          )}
        </ChartCard>
      </div>

      <div className={styles.activityGrid}>
        <section className={styles.listCard}>
          <div className={styles.listHeading}><div><h3>My care team</h3><p>Doctors you’ve visited</p></div><Button variant="ghost" size="sm" onClick={() => navigate('/patient/appointments')}>Appointments <FiArrowRight /></Button></div>
          {doctors.length === 0 ? <EmptyState icon={<FiUsers />} title="Your care team starts here" message="Book an appointment to connect with a doctor." action={<Button variant="teal" size="sm" onClick={() => navigate('/patient/book')}>Find an appointment</Button>} /> : (
            <div className={styles.rows}>{doctors.map((doctor, index) => <article className={styles.personRow} key={`${doctor.doctor_name}-${index}`}>
              <span className={styles.avatar}>{doctor.doctor_name?.[0] || 'D'}</span><div className={styles.rowText}><strong>{doctor.doctor_name}</strong><span>{doctor.specialization} · {doctor.visit_count} visit{doctor.visit_count !== 1 ? 's' : ''}</span></div><time dateTime={doctor.last_visit}>{new Date(doctor.last_visit).toLocaleDateString()}</time>
            </article>)}</div>
          )}
        </section>

        <section className={styles.listCard}>
          <div className={styles.listHeading}><div><h3>Prescriptions</h3><p>Your current and recent medication details</p></div><Button variant="ghost" size="sm" onClick={() => navigate('/patient/prescriptions')}>View all <FiArrowRight /></Button></div>
          {prescriptions.length === 0 ? <EmptyState icon={<FiFileText />} title="No prescriptions yet" message="Prescriptions from your care team will appear here." /> : (
            <div className={styles.prescriptionList}>{prescriptions.slice(0, 4).map(rx => {
              const meds = (() => { try { return Array.isArray(rx.medication_details) ? rx.medication_details : JSON.parse(rx.medication_details || '[]') } catch { return [] } })()
              return <article className={styles.prescription} key={rx.id}>
                <div className={styles.prescriptionTop}><div><strong>Dr. {rx.doctor_name}</strong><span>{rx.specialization}</span></div><Badge label={rx.is_active ? 'Active' : 'Expired'} variant={rx.is_active ? 'active' : 'inactive'} /></div>
                {rx.diagnosis && <p>{rx.diagnosis}</p>}
                <div className={styles.medicationTags}>{meds.slice(0, 3).map((med, index) => <span key={`${med.name}-${index}`}>{med.name}</span>)}{meds.length > 3 && <small>+{meds.length - 3} more</small>}</div>
                <time dateTime={rx.created_at}>{new Date(rx.created_at).toLocaleDateString()} · {rx.specialization}</time>
              </article>
            })}</div>
          )}
        </section>
      </div>

      <details className={styles.details}><summary>More health activity</summary><div className={styles.secondaryGrid}>
        <Metric icon={<FiCalendar />} value={stats.total} label="Total appointments" note="All time" tone="purple" />
        <Metric icon={<FiBell />} value={stats.unreadNotifs} label="Unread notifications" note="Check your notifications" tone="amber" />
        <ChartCard title="Visit types" description="Visits grouped by appointment type.">
          {typeBreakdown.length === 0 ? <p className={styles.emptyText}>No visit type data yet.</p> : (
            <div className={styles.chart} role="img" aria-label={`Visit type breakdown across ${typeBreakdown.length} categories`}>
              <ResponsiveContainer width="100%" height={210}><BarChart data={typeBreakdown} layout="vertical" barSize={22}><XAxis type="number" hide allowDecimals={false} /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={90} tick={{ fill: '#526872', fontSize: 12 }} /><Tooltip contentStyle={{ border: '1px solid #e5ecea', borderRadius: 10, fontSize: 12 }} /><Bar dataKey="value" name="Visits" fill="#00a98d" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer>
              <ul className={styles.chartSummary}>{typeBreakdown.map(item => <li key={item.name}><span>{item.name.replace('_', ' ')}</span><strong>{item.value}</strong></li>)}</ul>
            </div>
          )}
        </ChartCard>
      </div></details>
    </div>
  )
}

export default PatientDashboard
