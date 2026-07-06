import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiCalendar, FiFilter, FiRefreshCw, FiClock } from 'react-icons/fi'
import api from '../../services/api'
import { useToast } from '../../components/common/Toast'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { Select } from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import useBreakpoint from '../../hooks/useBreakpoint'

const AdminAppointments = () => {
  const { toast }    = useToast() || {}
  const { isMobile } = useBreakpoint()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('')
  const [selected, setSelected]         = useState(null)
  const [page, setPage]                 = useState(1)
  const [total, setTotal]               = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 20 })
      if (filter) params.set('status', filter)
      const res = await api.get(`/appointments?${params}`)
      setAppointments(res.data)
      setTotal(res.pagination?.total || 0)
    } catch { toast?.('Failed to load appointments', 'error') }
    finally { setLoading(false) }
  }, [filter, page])

  useEffect(() => { load() }, [load])

  const overrideStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status })
      toast?.(`Appointment ${status}`, 'success')
      setSelected(null)
      load()
    } catch (err) { toast?.(err?.data?.message || 'Action failed', 'error') }
  }

  const STATUSES = ['pending','accepted','rejected','rescheduled','completed','cancelled','no_show']

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h2 style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:'0.25rem' }}>All Appointments</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{total} total across all doctors</p>
        </div>
        <div style={{ display:'flex', gap:'0.625rem', alignItems:'center', flexWrap:'wrap' }}>
          <FiFilter color="var(--text-muted)" size={14} />
          <Select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }}
            style={{ minWidth: isMobile ? 140 : 160 }}>
            <option value="">All statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
            ))}
          </Select>
          <Button variant="ghost" size="sm" onClick={load}><FiRefreshCw /></Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><LoadingSpinner /></div>
      ) : appointments.length === 0 ? (
        <EmptyState icon={<FiCalendar />} title="No appointments found" />
      ) : isMobile ? (
        /* ── Mobile: cards ── */
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {appointments.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}
              onClick={() => setSelected(a)}
              style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1rem', boxShadow:'var(--shadow-sm)', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'var(--text-sm)' }}>{a.patient_name}</div>
                  <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)' }}>Dr. {a.doctor_name}</div>
                </div>
                <Badge label={a.status} variant={a.status} />
              </div>
              <div style={{ display:'flex', gap:'0.75rem', fontSize:'var(--text-xs)', color:'var(--text-muted)', flexWrap:'wrap' }}>
                <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                  <FiCalendar size={10} /> {new Date(a.appointment_time).toLocaleDateString()}
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                  <FiClock size={10} /> {new Date(a.appointment_time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                </span>
                <span style={{ textTransform:'capitalize' }}>{a.type?.replace('_', ' ')}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* ── Desktop: table ── */
        <div style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', overflow:'auto', boxShadow:'var(--shadow-sm)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'var(--text-sm)', minWidth:600 }}>
            <thead>
              <tr style={{ background:'var(--bg-secondary)', borderBottom:'1px solid var(--border-color)' }}>
                {['Patient','Doctor','Date & Time','Type','Status','Actions'].map(h => (
                  <th key={h} style={{ padding:'0.875rem 1rem', textAlign:'left', fontWeight:700, color:'var(--text-secondary)', fontSize:'var(--text-xs)', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.025 }}
                  style={{ borderBottom:'1px solid var(--border-color)', cursor:'pointer', transition:'background 0.15s' }}
                  onClick={() => setSelected(a)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding:'0.875rem 1rem', fontWeight:600 }}>{a.patient_name}</td>
                  <td style={{ padding:'0.875rem 1rem', color:'var(--text-secondary)' }}>{a.doctor_name}</td>
                  <td style={{ padding:'0.875rem 1rem', color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                    {new Date(a.appointment_time).toLocaleDateString()}<br />
                    <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
                      {new Date(a.appointment_time).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </td>
                  <td style={{ padding:'0.875rem 1rem', color:'var(--text-secondary)', textTransform:'capitalize' }}>{a.type?.replace('_', ' ')}</td>
                  <td style={{ padding:'0.875rem 1rem' }}><Badge label={a.status} variant={a.status} /></td>
                  <td style={{ padding:'0.875rem 1rem' }}>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(a) }}>Manage</Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem' }}>
          <Button variant="ghost" size="sm" disabled={page===1} onClick={() => setPage(p => p-1)}>Previous</Button>
          <span style={{ padding:'0.375rem 0.875rem', fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>Page {page}</span>
          <Button variant="ghost" size="sm" disabled={page*20>=total} onClick={() => setPage(p => p+1)}>Next</Button>
        </div>
      )}

      {/* Admin override modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Manage Appointment" size="md">
        {selected && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {[
              ['Patient',    selected.patient_name],
              ['Doctor',     selected.doctor_name],
              ['Date & Time', new Date(selected.appointment_time).toLocaleString()],
              ['Type',       selected.type?.replace('_', ' ')],
              ['Status',     <Badge key="s" label={selected.status} variant={selected.status} />],
              ['Reason',     selected.reason || '—'],
              ['Notes',      selected.notes  || '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display:'flex', gap:'1rem', fontSize:'var(--text-sm)', padding:'0.5rem 0', borderBottom:'1px solid var(--border-color)', flexWrap:'wrap' }}>
                <span style={{ minWidth:110, fontWeight:600, color:'var(--text-secondary)', flexShrink:0 }}>{k}</span>
                <span style={{ textTransform: k==='Type' ? 'capitalize' : undefined }}>{v}</span>
              </div>
            ))}
            <div style={{ paddingTop:'0.5rem' }}>
              <div style={{ fontWeight:700, marginBottom:'0.75rem', fontSize:'var(--text-sm)' }}>Override Status</div>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                {['accepted','rejected','completed','cancelled','no_show'].map(s => (
                  <Button key={s}
                    variant={s==='accepted'||s==='completed' ? 'teal' : s==='rejected'||s==='cancelled' ? 'danger' : 'ghost'}
                    size="sm"
                    onClick={() => overrideStatus(selected.id, s)}
                    disabled={selected.status === s}>
                    {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminAppointments
