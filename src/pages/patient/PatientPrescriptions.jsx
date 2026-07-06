import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDownload, FiCalendar } from 'react-icons/fi';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const PatientPrescriptions = () => {
  const [prescriptions, setRx] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [selected, setSelected]= useState(null);

  useEffect(() => {
    api.get('/prescriptions').then(r => setRx(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const printPrescription = (rx) => {
    const meds = Array.isArray(rx.medication_details) ? rx.medication_details : JSON.parse(rx.medication_details || '[]');
    const html = `
      <html><head><title>Prescription</title>
      <style>body{font-family:sans-serif;padding:2rem;max-width:700px;margin:0 auto}h1{color:#1a3d6e;border-bottom:2px solid #1a3d6e;padding-bottom:0.5rem}table{width:100%;border-collapse:collapse;margin-top:1rem}th{background:#f1f5f9;padding:0.5rem;text-align:left;font-size:0.8rem;text-transform:uppercase}td{padding:0.625rem;border-bottom:1px solid #e2e8f0}</style>
      </head><body>
      <h1>Prescription</h1>
      <p><b>Doctor:</b> ${rx.doctor_name} (${rx.specialization})</p>
      <p><b>Patient:</b> ${rx.patient_name}</p>
      <p><b>Date:</b> ${new Date(rx.created_at).toLocaleDateString()}</p>
      ${rx.diagnosis ? `<p><b>Diagnosis:</b> ${rx.diagnosis}</p>` : ''}
      <table><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr>
      ${meds.map(m => `<tr><td>${m.name}</td><td>${m.dosage||'—'}</td><td>${m.frequency||'—'}</td><td>${m.duration||'—'}</td></tr>`).join('')}
      </table>
      ${rx.notes ? `<p style="margin-top:1rem"><b>Notes:</b> ${rx.notes}</p>` : ''}
      ${rx.valid_until ? `<p><b>Valid until:</b> ${new Date(rx.valid_until).toLocaleDateString()}</p>` : ''}
      </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>My Prescriptions</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div>
      ) : prescriptions.length === 0 ? (
        <EmptyState icon={<FiFileText />} title="No prescriptions yet" message="Prescriptions from your doctors will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {prescriptions.map((rx, i) => {
            const meds = Array.isArray(rx.medication_details) ? rx.medication_details : (typeof rx.medication_details === 'string' ? JSON.parse(rx.medication_details || '[]') : []);
            return (
              <motion.div key={rx.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.25rem 1.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                onClick={() => setSelected(rx)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Dr. {rx.doctor_name}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{rx.specialization}</div>
                    {rx.diagnosis && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>Dx: {rx.diagnosis}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                    <Badge label={rx.is_active ? 'Active' : 'Expired'} variant={rx.is_active ? 'active' : 'inactive'} />
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiCalendar size={11} /> {new Date(rx.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {meds.map((m, mi) => (
                    <span key={mi} style={{ background: 'var(--color-slate-light)', color: 'var(--color-primary)', fontSize: 'var(--text-xs)', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: 'var(--border-radius-full)' }}>
                      {m.name}{m.dosage ? ` ${m.dosage}` : ''}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Prescription Details" size="md"
        footer={selected && <><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem' }} onClick={() => setSelected(null)}>Close</button><button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.625rem 1.25rem', background: 'var(--color-primary-light)', color: '#fff', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-sm)' }} onClick={() => printPrescription(selected)}><FiDownload size={14}/> Download / Print</button></>}>
        {selected && (() => {
          const meds = Array.isArray(selected.medication_details) ? selected.medication_details : JSON.parse(selected.medication_details || '[]');
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: 'var(--text-sm)' }}>
                {[['Doctor', `Dr. ${selected.doctor_name}`], ['Specialization', selected.specialization], ['Date', new Date(selected.created_at).toLocaleDateString()], ['Status', <Badge key="s" label={selected.is_active ? 'Active' : 'Expired'} variant={selected.is_active ? 'active' : 'inactive'} />], ['Valid Until', selected.valid_until ? new Date(selected.valid_until).toLocaleDateString() : '—']].map(([k, v]) => (
                  <div key={k} style={{ flex: '1 1 180px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{k}</div>
                    <div>{v}</div>
                  </div>
                ))}
              </div>
              {selected.diagnosis && <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', padding: '0.75rem 1rem' }}><div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: '0.25rem' }}>Diagnosis</div><div style={{ fontSize: 'var(--text-sm)' }}>{selected.diagnosis}</div></div>}
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: 'var(--text-sm)' }}>Medications</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead><tr style={{ background: 'var(--bg-secondary)' }}>{['Drug', 'Dosage', 'Frequency', 'Duration'].map(h => <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
                  <tbody>{meds.map((m, mi) => <tr key={mi} style={{ borderBottom: '1px solid var(--border-color)' }}><td style={{ padding: '0.625rem 0.75rem', fontWeight: 600 }}>{m.name}</td><td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{m.dosage || '—'}</td><td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{m.frequency || '—'}</td><td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-secondary)' }}>{m.duration || '—'}</td></tr>)}</tbody>
                </table>
              </div>
              {selected.notes && <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--border-radius)', padding: '0.75rem 1rem', fontSize: 'var(--text-sm)' }}><div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Notes</div>{selected.notes}</div>}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default PatientPrescriptions;
