import useBreakpoint from '../../hooks/useBreakpoint'
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiShield, FiActivity, FiUserCheck, FiUserX } from 'react-icons/fi';
import { FaHandPaper } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../../services/api';
import { StatCard } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Admin';
  const { isMobile } = useBreakpoint()
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div>;

  const userMap = data?.users?.reduce((acc, u) => { acc[u.role] = u; return acc; }, {}) || {};
  const apptMap = data?.appointments?.reduce((acc, a) => { acc[a.status] = parseInt(a.count); return acc; }, {}) || {};
  const totalUsers = data?.users?.reduce((s, u) => s + parseInt(u.count), 0) || 0;
  const totalAppts = data?.appointments?.reduce((s, a) => s + parseInt(a.count), 0) || 0;

  const apptChartData = data?.appointments?.map(a => ({ name: a.status, count: parseInt(a.count) })) || [];
  const monthData = data?.patientsByMonth?.map(m => ({
    month: new Date(m.month).toLocaleDateString('default', { month: 'short' }),
    patients: parseInt(m.count)
  })).reverse() || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: '0.25rem' }}>
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {firstName} <FaHandPaper size={20} color="#059669" style={{ display: 'inline', marginLeft: 8 }} />
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Real-time metrics across the HMS platform</p>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {[
          { icon: <FiUsers />,     value: totalUsers,                      label: 'Total Users',      color: '#dbeafe', iconColor: '#2563b0' },
          { icon: <FiUserCheck />, value: userMap.doctor?.count || 0,      label: 'Doctors',          color: '#d1fae5', iconColor: '#059669' },
          { icon: <FiUsers />,     value: userMap.patient?.count || 0,     label: 'Patients',         color: '#ede9fe', iconColor: '#7c3aed' },
          { icon: <FiCalendar />,  value: totalAppts,                      label: 'Total Appointments',color: '#fef3c7', iconColor: '#d97706' },
          { icon: <FiShield />,    value: apptMap.completed || 0,          label: 'Completed',        color: '#d1fae5', iconColor: '#059669' },
          { icon: <FiActivity />,  value: apptMap.pending || 0,            label: 'Pending',          color: '#fef3c7', iconColor: '#f59e0b' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Appointment Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={apptChartData} barSize={30}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis hide />
              <Tooltip contentStyle={{ border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#2563b0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Patient Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis hide />
              <Tooltip contentStyle={{ border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="patients" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4, fill: '#0d9488' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="primary"  onClick={() => navigate('/admin/users')}><FiUsers /> Manage Users</Button>
          <Button variant="outline"  onClick={() => navigate('/admin/appointments')}><FiCalendar /> View Appointments</Button>
          <Button variant="ghost"    onClick={() => navigate('/admin/audit-logs')}><FiShield /> Audit Logs</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
