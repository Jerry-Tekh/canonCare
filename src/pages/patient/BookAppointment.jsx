import useBreakpoint from '../../hooks/useBreakpoint'
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiStar, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import Button from '../../components/common/Button';
import { Input, Select, Textarea } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast() || {};
  const [doctors, setDoctors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [spec, setSpec]           = useState('');
  const [selected, setSelected]   = useState(null);
  const [modal, setModal]         = useState(false);
  const [booking, setBooking]     = useState(false);
  const [form, setForm]           = useState({ appointmentTime: '', type: 'in_person', reason: '' });

  const SPECIALIZATIONS = ['Cardiology','Neurology','General Practice','Orthopedics','Pediatrics','Dermatology','Psychiatry','Oncology'];

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ available: 'true' });
      if (search) params.set('search', search);
      if (spec) params.set('specialization', spec);
      const res = await api.get(`/users/doctors?${params}`);
      setDoctors(res.data);
    } catch { toast?.('Failed to load doctors', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDoctors(); }, [search, spec]);

  const handleBook = async () => {
    if (!form.appointmentTime) { toast?.('Please select a date and time', 'warning'); return; }
    setBooking(true);
    try {
      await api.post('/appointments', {
        doctorId: selected.id,
        appointmentTime: new Date(form.appointmentTime).toISOString(),
        type: form.type,
        reason: form.reason,
      });
      toast?.('Appointment booked successfully!', 'success');
      setModal(false);
      navigate('/patient/appointments');
    } catch (err) {
      toast?.(err?.data?.message || 'Booking failed', 'error');
    } finally { setBooking(false); }
  };

  const openBook = (doc) => { setSelected(doc); setModal(true); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>Book an Appointment</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Find a doctor and schedule your visit</p>
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input placeholder="Search by name or specialization…" value={search}
            onChange={e => setSearch(e.target.value)} icon={<FiSearch />} />
        </div>
        <Select value={spec} onChange={e => setSpec(e.target.value)} style={{ minWidth: 180 }}>
          <option value="">All Specializations</option>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {/* Doctors grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <FiUser size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No doctors found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {doctors.map((doc, i) => (
            <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              style={{ background: '#fff', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
              <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-light)', flexShrink: 0 }}>
                  {doc.name?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{doc.name}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{doc.specialization}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <FiStar size={12} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{doc.rating || '—'}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>({doc.total_reviews} reviews)</span>
                  </div>
                </div>
                <Badge label={doc.availability_status} variant={doc.availability_status} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                {doc.years_experience && <span><FiClock size={11} style={{ marginRight: 4 }} />{doc.years_experience} yrs exp</span>}
                {doc.consultation_fee && <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>${doc.consultation_fee}</span>}
              </div>
              {doc.bio && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.bio}</p>}
              <Button variant={doc.availability_status === 'available' ? 'teal' : 'ghost'}
                onClick={() => doc.availability_status === 'available' && openBook(doc)}
                disabled={doc.availability_status !== 'available'} fullWidth>
                {doc.availability_status === 'available' ? <><FiCalendar /> Book Appointment</> : 'Unavailable'}
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={`Book with ${selected?.name}`} size="md"
        footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button loading={booking} onClick={handleBook}><FiCalendar /> Confirm Booking</Button></>}>
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-slate-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-primary-light)' }}>{selected.name?.[0]}</div>
              <div><div style={{ fontWeight: 700 }}>{selected.name}</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{selected.specialization}</div></div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Date & Time <span style={{ color: 'var(--color-error)' }}>*</span></label>
              <input type="datetime-local" value={form.appointmentTime} onChange={e => setForm(p => ({ ...p, appointmentTime: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
                style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--border-radius)', fontSize: 'var(--text-base)' }} />
            </div>
            <Select label="Appointment type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="in_person">In-Person</option>
              <option value="video">Video Consultation</option>
              <option value="phone">Phone Call</option>
            </Select>
            <Textarea label="Reason for visit" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Briefly describe your symptoms or reason…" rows={3} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookAppointment;
