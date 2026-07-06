import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiFileText, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api'
import useBreakpoint from '../../hooks/useBreakpoint';
import { useToast } from '../../components/common/Toast';
import Button from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const empty = { patientId: '', diagnosis: '', notes: '', validUntil: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }] };

const DoctorPrescriptions = () => {
  const { toast } = useToast() || {};
  const { isMobile } = useBreakpoint()
  const [prescriptions, setRx] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [modal, setModal]      = useState(false);
  const [form, setForm]        = useState(empty);
  const [saving, setSaving]    = useState(false);
  const [patients, setPatients]= useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/prescriptions'),
      api.get('/appointments?status=accepted&limit=100'),
    ]).then(([rx, ap]) => {
      setRx(rx.data);
      // Extract unique patients
      const seen = {};
      ap.data.forEach(a => { if (!seen[a.patient_id]) seen[a.patient_id] = { id: a.patient_id, name: a.patient_name }; });
      setPatients(Object.values(seen));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addMed = () => setForm(p => ({ ...p, medications: [...p.medications, { name: '', dosage: '', frequency: '', duration: '' }] }));
  const removeMed = i => setForm(p => ({ ...p, medications: p.medications.filter((_, idx) => idx !== i) }));
  const setMed = (i, field, val) => setForm(p => {
    const meds = [...p.medications];
    meds[i] = { ...meds[i], [field]: val };
    return { ...p, medications: meds };
  });

  const save = async () => {
    if (!form.patientId) { toast?.('Select a patient', 'error'); return; }
    if (!form.medications[0].name) { toast?.('Add at least one medication', 'error'); return; }
    setSaving(true);
    try {
      await api.post('/prescriptions', {
        patientId: form.patientId,
        diagnosis: form.diagnosis,
        notes: form.notes,
        validUntil: form.validUntil || null,
        medicationDetails: form.medications,
      });
      toast?.('Prescription created', 'success');
      setModal(false); setForm(empty);
      const r = await api.get('/prescriptions');
      setRx(r.data);
    } catch (err) {
      toast?.(err?.data?.message || 'Failed to create prescription', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>Prescriptions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''} issued</p>
        </div>
        <Button variant="teal" onClick={() => setModal(true)}><FiPlus /> New Prescription</Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div>
      ) : prescriptions.length === 0 ? (
        <EmptyState icon={<FiFileText />} title="No prescriptions yet" message="Create your first prescription for a patient." action={<Button variant="teal" onClick={() => setModal(true)}><FiPlus /> New Prescription</Button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {prescriptions.map((rx, i) => {
            const meds = Array.isArray(rx.medication_details) ? rx.medication_details : (typeof rx.medication_details === 'string' ? JSON.parse(rx.medication_details) : []);
            return (
              <motion.div key={rx.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{rx.patient_name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{new Date(rx.created_at).toLocaleDateString()}</div>
                  </div>
                  <Badge label={rx.is_active ? 'Active' : 'Expired'} variant={rx.is_active ? 'active' : 'inactive'} />
                </div>
                {rx.diagnosis && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>Dx: {rx.diagnosis}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {meds.map((m, mi) => (
                    <div key={mi} style={{ background: 'var(--bg-secondary)', borderRadius: 6, padding: '0.5rem 0.75rem', fontSize: 'var(--text-xs)' }}>
                      <span style={{ fontWeight: 700 }}>{m.name}</span>
                      {m.dosage && <span style={{ color: 'var(--text-secondary)' }}> · {m.dosage}</span>}
                      {m.frequency && <span style={{ color: 'var(--text-muted)' }}> · {m.frequency}</span>}
                    </div>
                  ))}
                </div>
                {rx.valid_until && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Valid until: {new Date(rx.valid_until).toLocaleDateString()}</div>}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Prescription" size="lg"
        footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button loading={saving} onClick={save}><FiFileText /> Create Prescription</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.375rem', color: 'var(--text-secondary)' }}>Patient *</label>
            <select value={form.patientId} onChange={e => setForm(p => ({ ...p, patientId: e.target.value }))}
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--border-radius)', fontSize: 'var(--text-base)', fontFamily: 'inherit' }}>
              <option value="">Select a patient…</option>
              {patients.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
            </select>
          </div>
          <Input label="Diagnosis" value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} placeholder="Primary diagnosis" />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Medications *</label>
              <Button variant="ghost" size="sm" onClick={addMed}><FiPlus /> Add</Button>
            </div>
            {form.medications.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end' }}>
                <Input placeholder="Drug name" value={m.name} onChange={e => setMed(i, 'name', e.target.value)} />
                <Input placeholder="Dosage" value={m.dosage} onChange={e => setMed(i, 'dosage', e.target.value)} />
                <Input placeholder="Frequency" value={m.frequency} onChange={e => setMed(i, 'frequency', e.target.value)} />
                <Input placeholder="Duration" value={m.duration} onChange={e => setMed(i, 'duration', e.target.value)} />
                {form.medications.length > 1 && (
                  <button onClick={() => removeMed(i)} style={{ width: 36, height: 36, border: 'none', background: 'var(--color-error-bg)', borderRadius: 'var(--border-radius)', cursor: 'pointer', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional instructions…" rows={2} />
          <Input label="Valid until" type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
        </div>
      </Modal>
    </div>
  );
};

export default DoctorPrescriptions;
