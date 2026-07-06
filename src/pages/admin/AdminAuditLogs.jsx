import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiShield, FiRefreshCw, FiFilter } from 'react-icons/fi'
import api from '../../services/api'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import useBreakpoint from '../../hooks/useBreakpoint'

const statusColors = { success:'accepted', failure:'rejected', warning:'pending' }

const AdminAuditLogs = () => {
  const { isMobile } = useBreakpoint()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 30 })
      if (search) params.set('action', search)
      const res = await api.get(`/admin/audit-logs?${params}`)
      setLogs(res.data)
    } catch {}
    finally { setLoading(false) }
  }, [search, page])

  useEffect(() => { load() }, [load])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h2 style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:'0.25rem' }}>Audit Logs</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>System-wide activity trail for compliance and security</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
          <Input placeholder="Filter by action…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            icon={<FiFilter />} style={{ minWidth: isMobile ? '100%' : 180 }} />
          <Button variant="ghost" size="sm" onClick={load}><FiRefreshCw /></Button>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><LoadingSpinner /></div>
      ) : logs.length === 0 ? (
        <EmptyState icon={<FiShield />} title="No audit logs found" />
      ) : isMobile ? (
        /* ── Mobile: card list ── */
        <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
          {logs.map((log, i) => (
            <motion.div key={log.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.02 }}
              style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius)', padding:'0.875rem', boxShadow:'var(--shadow-xs)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                <code style={{ background:'var(--bg-secondary)', padding:'0.2rem 0.5rem', borderRadius:4, fontSize:'var(--text-xs)', color:'var(--color-primary-light)', fontFamily:'var(--font-mono)' }}>
                  {log.action}
                </code>
                <Badge label={log.status} variant={statusColors[log.status] || 'default'} />
              </div>
              <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginBottom:'0.25rem' }}>
                <strong>{log.actor_name}</strong> · {log.actor_role}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'var(--text-xs)', color:'var(--text-muted)', flexWrap:'wrap', gap:'0.25rem' }}>
                <span>{new Date(log.created_at).toLocaleString()}</span>
                {log.ip_address && <span>{log.ip_address}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* ── Desktop: table with horizontal scroll ── */
        <div style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', overflow:'auto', boxShadow:'var(--shadow-sm)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'var(--text-sm)', minWidth:700 }}>
            <thead>
              <tr style={{ background:'var(--bg-secondary)', borderBottom:'1px solid var(--border-color)' }}>
                {['Timestamp','Actor','Action','Resource','IP Address','Status'].map(h => (
                  <th key={h} style={{ padding:'0.875rem 1rem', textAlign:'left', fontWeight:700, color:'var(--text-secondary)', fontSize:'var(--text-xs)', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <motion.tr key={log.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.02 }}
                  style={{ borderBottom:'1px solid var(--border-color)', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding:'0.75rem 1rem', color:'var(--text-muted)', whiteSpace:'nowrap', fontSize:'var(--text-xs)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding:'0.75rem 1rem' }}>
                    <div style={{ fontWeight:600 }}>{log.actor_name}</div>
                    <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>{log.actor_role}</div>
                  </td>
                  <td style={{ padding:'0.75rem 1rem' }}>
                    <code style={{ background:'var(--bg-secondary)', padding:'0.2rem 0.5rem', borderRadius:4, fontSize:'var(--text-xs)', color:'var(--color-primary-light)', fontFamily:'var(--font-mono)' }}>
                      {log.action}
                    </code>
                  </td>
                  <td style={{ padding:'0.75rem 1rem', color:'var(--text-secondary)', fontSize:'var(--text-xs)' }}>
                    {log.resource_type || '—'}
                  </td>
                  <td style={{ padding:'0.75rem 1rem', color:'var(--text-muted)', fontSize:'var(--text-xs)', fontFamily:'var(--font-mono)' }}>
                    {log.ip_address || '—'}
                  </td>
                  <td style={{ padding:'0.75rem 1rem' }}>
                    <Badge label={log.status} variant={statusColors[log.status] || 'default'} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem' }}>
        <Button variant="ghost" size="sm" disabled={page===1} onClick={() => setPage(p => p-1)}>Previous</Button>
        <span style={{ padding:'0.375rem 0.875rem', fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>Page {page}</span>
        <Button variant="ghost" size="sm" disabled={logs.length<30} onClick={() => setPage(p => p+1)}>Next</Button>
      </div>
    </div>
  )
}

export default AdminAuditLogs
