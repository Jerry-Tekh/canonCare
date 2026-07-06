import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiUserX, FiUserCheck, FiRefreshCw } from 'react-icons/fi'
import api from '../../services/api'
import { useToast } from '../../components/common/Toast'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { Input, Select } from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import useBreakpoint from '../../hooks/useBreakpoint'

const AdminUsers = () => {
  const { toast }  = useToast() || {}
  const { isMobile } = useBreakpoint()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [roleFilter, setRole]   = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 15 })
      if (search)     params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const res = await api.get(`/users?${params}`)
      setUsers(res.data)
      setTotal(res.pagination?.total || 0)
    } catch { toast?.('Failed to load users', 'error') }
    finally { setLoading(false) }
  }, [search, roleFilter, page])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (userId, isActive) => {
    try {
      await api.patch(`/users/${userId}/status`, { isActive: !isActive })
      toast?.(`User ${isActive ? 'suspended' : 'activated'}`, 'success')
      load()
    } catch { toast?.('Action failed', 'error') }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h2 style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:'0.25rem' }}>User Management</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>{total} total users</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load}><FiRefreshCw /></Button>
      </motion.div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth: isMobile ? '100%' : 200 }}>
          <Input placeholder="Search name or email…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} icon={<FiSearch />} />
        </div>
        <Select value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1) }}
          style={{ minWidth: isMobile ? '100%' : 140 }}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
          <option value="patient">Patient</option>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><LoadingSpinner /></div>
      ) : users.length === 0 ? (
        <EmptyState title="No users found" message="Try adjusting your search or filters." />
      ) : isMobile ? (
        /* ── Mobile: card list ── */
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {users.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}
              style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1rem', boxShadow:'var(--shadow-sm)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'var(--text-sm)', color:'var(--color-primary-light)', flexShrink:0 }}>
                  {u.name?.[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:'var(--text-sm)' }} className="truncate">{u.name}</div>
                  <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }} className="truncate">{u.email}</div>
                </div>
                <Badge label={u.role} variant={u.role} />
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  <Badge label={u.is_active ? 'Active' : 'Inactive'} variant={u.is_active ? 'active' : 'inactive'} />
                  <Badge label={u.is_verified ? 'Verified' : 'Unverified'} variant={u.is_verified ? 'active' : 'inactive'} />
                </div>
                {u.role !== 'admin' && (
                  <Button variant={u.is_active ? 'danger' : 'teal'} size="sm" onClick={() => toggleStatus(u.id, u.is_active)}>
                    {u.is_active ? <><FiUserX /> Suspend</> : <><FiUserCheck /> Activate</>}
                  </Button>
                )}
              </div>
              <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', marginTop:'0.5rem' }}>
                Joined {new Date(u.created_at).toLocaleDateString()}
                {u.last_login && ` · Last login ${new Date(u.last_login).toLocaleDateString()}`}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* ── Desktop: table ── */
        <div style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', overflow:'auto', boxShadow:'var(--shadow-sm)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'var(--text-sm)', minWidth:640 }}>
            <thead>
              <tr style={{ background:'var(--bg-secondary)', borderBottom:'1px solid var(--border-color)' }}>
                {['User','Role','Status','Verified','Last Login','Joined','Actions'].map(h => (
                  <th key={h} style={{ padding:'0.875rem 1rem', textAlign:'left', fontWeight:700, color:'var(--text-secondary)', fontSize:'var(--text-xs)', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                  style={{ borderBottom:'1px solid var(--border-color)', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding:'0.875rem 1rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.625rem' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'var(--text-xs)', color:'var(--color-primary-light)', flexShrink:0 }}>
                        {u.name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight:600 }}>{u.name}</div>
                        <div style={{ color:'var(--text-muted)', fontSize:'var(--text-xs)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'0.875rem 1rem' }}><Badge label={u.role} variant={u.role} /></td>
                  <td style={{ padding:'0.875rem 1rem' }}><Badge label={u.is_active ? 'active' : 'inactive'} variant={u.is_active ? 'active' : 'inactive'} /></td>
                  <td style={{ padding:'0.875rem 1rem' }}><Badge label={u.is_verified ? 'Yes' : 'No'} variant={u.is_verified ? 'active' : 'inactive'} /></td>
                  <td style={{ padding:'0.875rem 1rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding:'0.875rem 1rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding:'0.875rem 1rem' }}>
                    {u.role !== 'admin' && (
                      <Button variant={u.is_active ? 'danger' : 'teal'} size="sm" onClick={() => toggleStatus(u.id, u.is_active)}>
                        {u.is_active ? <><FiUserX /> Suspend</> : <><FiUserCheck /> Activate</>}
                      </Button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 15 && (
        <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem' }}>
          <Button variant="ghost" size="sm" disabled={page===1} onClick={() => setPage(p => p-1)}>Previous</Button>
          <span style={{ padding:'0.375rem 0.875rem', fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>Page {page}</span>
          <Button variant="ghost" size="sm" disabled={page*15>=total} onClick={() => setPage(p => p+1)}>Next</Button>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
