import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUsers, FiCalendar, FiShield, FiActivity, FiUserCheck, FiArrowRight } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import styles from './AdminDashboard.module.css'

const Metric = ({ icon, value, label, note, tone = 'teal' }) => (
  <article className={`${styles.metric} ${styles[tone]}`}><span className={styles.metricIcon}>{icon}</span><div><strong>{value}</strong><span>{label}</span><small>{note}</small></div></article>
)

const ChartCard = ({ title, description, children }) => (
  <section className={styles.chartCard}><div className={styles.cardHeading}><h3>{title}</h3><p>{description}</p></div>{children}</section>
)

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Admin'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(response => setData(response.data))
      .catch(err => setError(err?.data?.message || 'Could not load the admin dashboard. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.state}><LoadingSpinner /></div>
  if (error) return <div className={styles.stateError} role="alert">{error}</div>

  const userMap = data?.users?.reduce((acc, item) => { acc[item.role] = item; return acc }, {}) || {}
  const apptMap = data?.appointments?.reduce((acc, item) => { acc[item.status] = parseInt(item.count); return acc }, {}) || {}
  const totalUsers = data?.users?.reduce((sum, item) => sum + parseInt(item.count), 0) || 0
  const totalAppts = data?.appointments?.reduce((sum, item) => sum + parseInt(item.count), 0) || 0
  const apptChartData = data?.appointments?.map(item => ({ name: item.status, count: parseInt(item.count) })) || []
  const monthData = data?.patientsByMonth?.map(item => ({ month: new Date(item.month).toLocaleDateString('default', { month: 'short' }), patients: parseInt(item.count) })).reverse() || []
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const statusSummary = apptChartData.map(item => `${item.name.replace('_', ' ')}: ${item.count}`).join(', ')
  const latestPatients = monthData[monthData.length - 1]?.patients || 0

  return (
    <div className={styles.dashboard}>
      <motion.header className={styles.pageHeader} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div><span className={styles.eyebrow}>CANON CARE · ADMIN</span><h2>{greeting}, {firstName}</h2><p>Here’s a summary of activity across your hospital.</p></div>
        <Button variant="teal" onClick={() => navigate('/admin/users')}><FiUsers /> Manage users <FiArrowRight /></Button>
      </motion.header>

      <section className={styles.metricGrid} aria-label="Hospital overview">
        <Metric icon={<FiUsers />} value={totalUsers} label="Total users" note="Across all roles" />
        <Metric icon={<FiUserCheck />} value={userMap.patient?.count || 0} label="Patients" note="Registered patients" tone="purple" />
        <Metric icon={<FiCalendar />} value={totalAppts} label="Appointments" note="All statuses" tone="blue" />
        <Metric icon={<FiActivity />} value={apptMap.pending || 0} label="Pending appointments" note="Awaiting attention" tone="amber" />
      </section>

      <div className={styles.primaryCharts}>
        <ChartCard title="Appointment status" description={statusSummary || 'Appointment counts by status.'}>
          {apptChartData.length === 0 ? <EmptyState icon={<FiCalendar />} title="No appointment data yet" message="Status totals will appear here as the system records activity." /> : (
            <div className={styles.chart} role="img" aria-label={`Appointments by status: ${statusSummary}`}>
              <ResponsiveContainer width="100%" height={250}><BarChart data={apptChartData} barSize={30}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#647780', fontSize: 11 }} /><YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ border: '1px solid #e5ecea', borderRadius: 10, fontSize: 12 }} /><Bar dataKey="count" name="Appointments" fill="#00a98d" radius={[6, 6, 0, 0]} />
              </BarChart></ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Patient growth" description={`Monthly registered patients · ${latestPatients} in the latest month shown`}>
          {monthData.length === 0 ? <EmptyState icon={<FiUsers />} title="No patient history yet" message="Monthly patient totals will appear here." /> : (
            <div className={styles.chart} role="img" aria-label={`Monthly patient growth. Latest month shown: ${latestPatients} patients.`}>
              <ResponsiveContainer width="100%" height={250}><LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaf0ee" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#647780', fontSize: 11 }} /><YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ border: '1px solid #e5ecea', borderRadius: 10, fontSize: 12 }} /><Legend /><Line type="monotone" dataKey="patients" name="Patients" stroke="#493077" strokeWidth={2.5} dot={{ r: 4, fill: '#493077' }} />
              </LineChart></ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <details className={styles.details}><summary>More hospital metrics</summary><div className={styles.secondaryMetrics}>
        <Metric icon={<FiUserCheck />} value={userMap.doctor?.count || 0} label="Doctors" note="Registered clinicians" tone="teal" />
        <Metric icon={<FiShield />} value={apptMap.completed || 0} label="Completed appointments" note="All time" tone="purple" />
        <Metric icon={<FiActivity />} value={apptMap.cancelled || 0} label="Cancelled appointments" note="All time" tone="amber" />
      </div></details>

      <section className={styles.quickActions}>
        <div className={styles.cardHeading}><h3>Management shortcuts</h3><p>Go directly to common admin tasks.</p></div>
        <div className={styles.actionGrid}>
          <button type="button" onClick={() => navigate('/admin/users')}><span><FiUsers /></span><span><strong>Manage users</strong><small>Review patient and clinician accounts</small></span><FiArrowRight /></button>
          <button type="button" onClick={() => navigate('/admin/appointments')}><span><FiCalendar /></span><span><strong>Appointments</strong><small>Review scheduling activity</small></span><FiArrowRight /></button>
          <button type="button" onClick={() => navigate('/admin/audit-logs')}><span><FiShield /></span><span><strong>Audit logs</strong><small>Review system activity records</small></span><FiArrowRight /></button>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
