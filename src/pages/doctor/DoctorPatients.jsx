import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiUser, FiCalendar, FiFileText, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api'
import useBreakpoint from '../../hooks/useBreakpoint';
import { Input } from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const DoctorPatients = () => {
  const { isMobile } = useBreakpoint();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState(null);
  const [patientDetail, setDetail]      = useState(null);
  const [detailLoading, setDetailLoad]  = useState(false);

  useEffect(() => {
    api.get('/appointments?limit=100')
      .then(r => setAppointments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Deduplicate patients from appointments
  const patients = Object.values(
    appointments.reduce((acc, a) => {
      if (!acc[a.patient_id]) acc[a.patient_id] = {
        id: a.patient_id, name: a.patient_name, phone: a.patient_phone,
        appointments: [],
      };
      acc[a.patient_id].appointments.push(a);
      return acc;
    }, {})
  ).filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  const openPatient = async (p) => {
    setSelected(p);
    setDetailLoad(true);
    try {
      // Get patient user details via appointments
      setDetail(p);
    } catch {}
    finally { setDetailLoad(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>My Patients</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{patients.length} patient{patients.length !== 1 ? 's' : ''} seen</p>
        </div>
        <div style={{ minWidth: isMobile ? '100%' : 240 }}>
          <Input placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} icon={<FiSearch />} />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div>
      ) : patients.length === 0 ? (
        <EmptyState icon={<FiUser />} title="No patients yet" message="Patients will appear here once you have accepted appointments." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {patients.map((p, i) => {
            const lastAppt = p.appointments.sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time))[0];
            const completed = p.appointments.filter(a => a.status === 'completed').length;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => openPatient(p)}
                style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = ''; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary-light)', flexShrink: 0 }}>
                    {p.name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }} className="truncate">{p.name}</div>
                    {p.phone && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.phone}</div>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>{p.appointments.length}</div>
                    <div>Total visits</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '0.5rem', textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-success)' }}>{completed}</div>
                    <div>Completed</div>
                  </div>
                </div>
                {lastAppt && (
                  <div style={{ marginTop: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <FiCalendar size={11} />
                    Last: {new Date(lastAppt.appointment_time).toLocaleDateString()} ·
                    <Badge label={lastAppt.status} variant={lastAppt.status} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Patient detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Patient: ${selected?.name}`} size="md">
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', padding: '1rem', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{selected.appointments.length}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Total Appointments</div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', padding: '1rem', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-success)' }}>{selected.appointments.filter(a => a.status === 'completed').length}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Completed</div>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: 'var(--text-sm)' }}>Appointment History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 280, overflowY: 'auto' }}>
                {selected.appointments.sort((a, b) => new Date(b.appointment_time) - new Date(a.appointment_time)).map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 'var(--text-sm)' }}>
                    <FiCalendar size={13} color="var(--text-muted)" />
                    <span style={{ flex: 1 }}>{new Date(a.appointment_time).toLocaleDateString()}</span>
                    <Badge label={a.status} variant={a.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPatients;
