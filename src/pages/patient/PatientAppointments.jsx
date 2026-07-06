import useBreakpoint from '../../hooks/useBreakpoint'
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiFilter, FiPlus, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Select } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint()
  const { toast } = useToast() || {};
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('');
  const [cancelModal, setCancelModal]   = useState({ open: false, id: null });
  const [cancelling, setCancelling]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const res = await api.get(`/appointments${params}`);
      setAppointments(res.data);
    } catch { toast?.('Failed to load appointments', 'error'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const cancelAppt = async () => {
    setCancelling(true);
    try {
      await api.patch(`/appointments/${cancelModal.id}/status`, { status: 'cancelled' });
      toast?.('Appointment cancelled', 'success');
      setCancelModal({ open: false, id: null });
      load();
    } catch (err) {
      toast?.(err?.data?.message || 'Cancellation failed', 'error');
    } finally { setCancelling(false); }
  };

  const upcoming = appointments.filter(a => ['pending','accepted'].includes(a.status) && new Date(a.appointment_time) > new Date());
  const past     = appointments.filter(a => !upcoming.find(u => u.id === a.id));

  const ApptCard = ({ a, i }) => (
    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
      style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--border-radius)', background: 'var(--color-slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary-light)', flexShrink: 0 }}>
        {a.doctor_name?.[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{a.doctor_name}</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{a.specialization}</div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiCalendar size={12} /> {new Date(a.appointment_time).toLocaleDateString()}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiClock size={12} /> {new Date(a.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span style={{ textTransform: 'capitalize' }}>· {a.type?.replace('_', ' ')}</span>
        </div>
        {a.reason && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }} className="truncate">{a.reason}</div>}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.375rem', alignItems: isMobile ? 'flex-start' : 'flex-end', flexShrink:0 }}>
        <Badge label={a.status} variant={a.status} />
        {['pending','accepted'].includes(a.status) && new Date(a.appointment_time) > new Date() && (
          <Button variant="ghost" size="sm" onClick={() => setCancelModal({ open: true, id: a.id })}>
            <FiX size={12} /> Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>My Appointments</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{appointments.length} total appointment{appointments.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <FiFilter color="var(--text-muted)" />
          <Select value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: 150 }}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Button variant="teal" size="sm" onClick={() => navigate('/patient/book')}><FiPlus /> Book New</Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div>
      ) : appointments.length === 0 ? (
        <EmptyState icon={<FiCalendar />} title="No appointments found" message="Book your first appointment with a doctor."
          action={<Button variant="teal" onClick={() => navigate('/patient/book')}><FiPlus /> Book Appointment</Button>} />
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 'var(--text-xs)' }}>Upcoming</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcoming.map((a, i) => <ApptCard key={a.id} a={a} i={i} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 'var(--text-xs)' }}>Past</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {past.map((a, i) => <ApptCard key={a.id} a={a} i={i} />)}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={cancelModal.open} onClose={() => setCancelModal({ open: false, id: null })} title="Cancel Appointment" size="sm"
        footer={<><Button variant="ghost" onClick={() => setCancelModal({ open: false, id: null })}>Keep Appointment</Button><Button variant="danger" loading={cancelling} onClick={cancelAppt}>Yes, Cancel</Button></>}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Are you sure you want to cancel this appointment? The doctor will be notified.</p>
      </Modal>
    </div>
  );
};

export default PatientAppointments;
