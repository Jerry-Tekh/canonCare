import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiFilter, FiCheck, FiX, FiClock, FiRefreshCw } from 'react-icons/fi'
import api from '../../services/api'
import { useToast } from '../../components/common/Toast'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { Select } from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import useBreakpoint from '../../hooks/useBreakpoint'
import styles from './DoctorAppointments.module.css'

const DoctorAppointments = () => {
  const { toast }    = useToast() || {}
  const { isMobile } = useBreakpoint()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('')
  const [selected, setSelected]         = useState(null)
  const [actionModal, setActionModal]   = useState({ open:false, action:'', apptId:null })
  const [newTime, setNewTime]           = useState('')
  const [notes, setNotes]               = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter ? `?status=${filter}` : ''
      const res = await api.get(`/appointments${params}`)
      setAppointments(res.data)
    } catch { toast?.('Failed to load appointments', 'error') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const updateStatus = async () => {
    const { action, apptId } = actionModal
    try {
      await api.patch(`/appointments/${apptId}/status`, {
        status: action,
        ...(notes && { notes }),
        ...(action === 'rescheduled' && newTime && { newTime }),
      })
      toast?.(`Appointment ${action}`, 'success')
      setActionModal({ open:false, action:'', apptId:null })
      setNotes(''); setNewTime('')
      load()
    } catch (err) { toast?.(err?.data?.message || 'Action failed', 'error') }
  }

  const openAction = (apptId, action) => setActionModal({ open:true, action, apptId })

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 style={{ fontSize:'var(--text-2xl)', fontWeight:800 }}>Appointments</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>Manage patient appointments</p>
        </div>
        <div className={styles.filters}>
          <FiFilter color="var(--text-muted)" size={14} />
          <Select value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth:isMobile ? 130 : 150 }}>
            <option value="">All statuses</option>
            {['pending','accepted','completed','rejected','cancelled'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
            ))}
          </Select>
          <Button variant="ghost" size="sm" onClick={load}><FiRefreshCw /></Button>
        </div>
      </div>

      {/* Appointment list — same card UI works on all sizes */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><LoadingSpinner /></div>
      ) : appointments.length === 0 ? (
        <EmptyState icon={<FiCalendar />} title="No appointments found" message="No appointments match the selected filter." />
      ) : (
        <div className={styles.list}>
          {appointments.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
              className={styles.appointmentCard}
              onClick={() => setSelected(a)}>

              <div className={styles.avatar}>
                {a.patient_name?.[0]}
              </div>

              <div className={styles.patientInfo}>
                <div className={styles.patientName}>{a.patient_name}</div>
                <div className={styles.metadata}>
                  <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                    <FiCalendar size={12} /> {new Date(a.appointment_time).toLocaleDateString()}
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                    <FiClock size={12} /> {new Date(a.appointment_time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </span>
                  <span style={{ textTransform:'capitalize' }}>· {a.type?.replace('_', ' ')}</span>
                </div>
                {a.reason && <div className={styles.reason}>{a.reason}</div>}
              </div>

              <div className={styles.actionArea}>
                <Badge label={a.status} variant={a.status} />
                {a.status === 'pending' && (
                  <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
                    <Button variant="teal"   size="sm" onClick={() => openAction(a.id,'accepted')}><FiCheck />{!isMobile && ' Accept'}</Button>
                    <Button variant="danger" size="sm" onClick={() => openAction(a.id,'rejected')}><FiX />{!isMobile && ' Reject'}</Button>
                    <Button variant="ghost"  size="sm" onClick={() => openAction(a.id,'rescheduled')}><FiClock />{!isMobile && ' Reschedule'}</Button>
                  </div>
                )}
                {a.status === 'accepted' && (
                  <div className={styles.actionButtons} onClick={e => e.stopPropagation()}>
                    <Button variant="primary" size="sm" onClick={() => openAction(a.id,'completed')}>
                      <FiCheck />{!isMobile && ' Complete'}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Appointment Details" size="md">
        {selected && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {[
              ['Patient',    selected.patient_name],
              ['Date & Time', new Date(selected.appointment_time).toLocaleString()],
              ['Type',       selected.type?.replace('_', ' ')],
              ['Status',     <Badge key="s" label={selected.status} variant={selected.status} />],
              ['Reason',     selected.reason || '—'],
              ['Notes',      selected.notes  || '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display:'flex', gap:'0.875rem', flexWrap:'wrap' }}>
                <span style={{ minWidth:90, fontWeight:600, color:'var(--text-secondary)', fontSize:'var(--text-sm)', flexShrink:0 }}>{k}</span>
                <span style={{ color:'var(--text-primary)', fontSize:'var(--text-sm)', textTransform: k==='Type'?'capitalize':undefined }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Action modal */}
      <Modal
        open={actionModal.open}
        onClose={() => setActionModal({ open:false, action:'', apptId:null })}
        title={`${actionModal.action?.charAt(0)?.toUpperCase() + actionModal.action?.slice(1)} Appointment`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActionModal({ open:false, action:'', apptId:null })}>Cancel</Button>
            <Button onClick={updateStatus}>Confirm</Button>
          </>
        }>
        {actionModal.action === 'rescheduled' && (
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ display:'block', fontWeight:600, fontSize:'var(--text-sm)', marginBottom:'0.375rem' }}>New Date & Time</label>
            <input type="datetime-local" value={newTime} onChange={e => setNewTime(e.target.value)}
              style={{ width:'100%', padding:'0.625rem 0.875rem', border:'1.5px solid var(--border-color)', borderRadius:'var(--border-radius)', fontSize:'var(--text-base)', fontFamily:'inherit' }} />
          </div>
        )}
        <div>
          <label style={{ display:'block', fontWeight:600, fontSize:'var(--text-sm)', marginBottom:'0.375rem' }}>Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add a note…"
            style={{ width:'100%', padding:'0.625rem 0.875rem', border:'1.5px solid var(--border-color)', borderRadius:'var(--border-radius)', fontSize:'var(--text-base)', resize:'vertical', fontFamily:'inherit' }} />
        </div>
      </Modal>
    </div>
  )
}

export default DoctorAppointments
