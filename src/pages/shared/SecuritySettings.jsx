import useBreakpoint from '../../hooks/useBreakpoint'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShield, FiSmartphone, FiMonitor, FiLogOut, FiTrash2,
  FiCheck, FiX, FiAlertTriangle, FiRefreshCw, FiKey, FiClock,
  FiGlobe, FiCopy,
} from 'react-icons/fi'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'

// ── Sessions panel ─────────────────────────────────────────────
const SessionsPanel = () => {
  const { isMobile } = useBreakpoint()
  const { toast }  = useToast() || {}
  const { logout } = useAuth()
  const [sessions, setSessions]         = useState([])
  const [loading,  setLoading]          = useState(true)
  const [revoking, setRevoking]         = useState(null)
  const [confirmAll, setConfirmAll]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/auth/sessions')
      setSessions(res.data || [])
    } catch { setSessions([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const revokeOne = async (id) => {
    setRevoking(id)
    try {
      await api.delete(`/auth/sessions/${id}`)
      toast?.('Session revoked', 'success')
      load()
    } catch { toast?.('Failed to revoke session', 'error') }
    finally { setRevoking(null) }
  }

  const revokeAll = async () => {
    try {
      await api.post('/auth/logout-all', {})
      toast?.('All sessions revoked. You have been logged out.', 'success')
      logout()
    } catch { toast?.('Failed to revoke all sessions', 'error') }
    setConfirmAll(false)
  }

  const getDeviceIcon = (ua) => {
    if (!ua) return <FiMonitor />
    if (/mobile|android|iphone/i.test(ua)) return <FiSmartphone />
    return <FiMonitor />
  }

  const formatUA = (ua) => {
    if (!ua) return 'Unknown device'
    const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)[/\s]([\d.]+)/)?.[1] || 'Browser'
    const os = ua.match(/(Windows|Mac OS|Linux|Android|iOS)/i)?.[1] || 'Unknown OS'
    return `${browser} on ${os}`
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h3 style={{ fontWeight:700, fontSize:'var(--text-lg)', marginBottom:'0.25rem' }}>Active Sessions</h3>
          <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)' }}>
            {sessions.length} active session{sessions.length !== 1 ? 's' : ''} across your devices
          </p>
        </div>
        <div style={{ display:'flex', gap:'0.625rem' }}>
          <Button variant="ghost" size="sm" onClick={load}><FiRefreshCw size={14} /></Button>
          {sessions.length > 1 && (
            <Button variant="danger" size="sm" onClick={() => setConfirmAll(true)}>
              <FiLogOut size={14} /> Logout All
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><LoadingSpinner size={28} /></div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)', fontSize:'var(--text-sm)' }}>
          No active sessions found.
        </div>
      ) : sessions.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
          style={{ display:'flex', alignItems:'flex-start', gap:'1rem', padding:'1rem 1.25rem', background:'var(--bg-secondary)', borderRadius:'var(--border-radius)', border:'1px solid var(--border-color)' }}>
          <div style={{ width:40, height:40, borderRadius:'var(--border-radius)', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-primary-light)', flexShrink:0 }}>
            {getDeviceIcon(s.user_agent)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:600, fontSize:'var(--text-sm)', marginBottom:'0.25rem' }}>
              {formatUA(s.user_agent)}
            </div>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
              {s.ip_address && (
                <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                  <FiGlobe size={11} /> {s.ip_address}
                </span>
              )}
              <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                <FiClock size={11} /> Created {new Date(s.created_at).toLocaleDateString()}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:'0.25rem' }}>
                <FiClock size={11} /> Last used {new Date(s.last_used_at).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => revokeOne(s.id)}
            disabled={revoking === s.id}
            style={{ padding:'0.375rem 0.75rem', borderRadius:'var(--border-radius)', border:'1px solid var(--color-error)', background:'transparent', color:'var(--color-error)', cursor:'pointer', fontSize:'var(--text-xs)', fontWeight:600, display:'flex', alignItems:'center', gap:'0.25rem', opacity: revoking === s.id ? 0.5 : 1 }}>
            <FiLogOut size={12} /> {revoking === s.id ? 'Revoking…' : 'Revoke'}
          </button>
        </motion.div>
      ))}

      <Modal open={confirmAll} onClose={() => setConfirmAll(false)} title="Logout All Sessions" size="sm"
        footer={<><Button variant="ghost" onClick={() => setConfirmAll(false)}>Cancel</Button><Button variant="danger" onClick={revokeAll}><FiLogOut size={14} /> Logout All</Button></>}>
        <p style={{ color:'var(--text-secondary)', lineHeight:1.7 }}>
          This will immediately revoke all active sessions on all devices including this one. You will be logged out.
        </p>
      </Modal>
    </div>
  )
}

// ── 2FA panel ──────────────────────────────────────────────────
const TwoFactorPanel = ({ user }) => {
  const { isMobile } = useBreakpoint()
  const { toast }      = useToast() || {}
  const { updateUser } = useAuth()

  const [phase, setPhase]           = useState('idle')  // idle|setup|verify|disable|recovery
  const [qrCode, setQrCode]         = useState(null)
  const [secret, setSecret]         = useState(null)
  const [code, setCode]             = useState('')
  const [password, setPassword]     = useState('')
  const [recoveryCodes, setRecovery]= useState([])
  const [loading, setLoading]       = useState(false)
  const [copied, setCopied]         = useState(false)

  const is2FAEnabled = user?.totp_enabled

  const startSetup = async () => {
    setLoading(true)
    try {
      const res = await api.post('/2fa/setup', {})
      setQrCode(res.data.qrCode)
      setSecret(res.data.secret)
      setPhase('setup')
    } catch (err) { toast?.(err?.data?.message || 'Setup failed', 'error') }
    finally { setLoading(false) }
  }

  const verifySetup = async () => {
    if (code.length !== 6) { toast?.('Enter the 6-digit code', 'error'); return }
    setLoading(true)
    try {
      const res = await api.post('/2fa/verify-setup', { code })
      setRecovery(res.data.recoveryCodes)
      updateUser({ totp_enabled: true })
      setPhase('recovery')
      toast?.('2FA enabled successfully!', 'success')
    } catch (err) { toast?.(err?.data?.message || 'Invalid code', 'error') }
    finally { setLoading(false) }
  }

  const disable2FA = async () => {
    if (!code || !password) { toast?.('Password and 2FA code required', 'error'); return }
    setLoading(true)
    try {
      await api.post('/2fa/disable', { password, code })
      updateUser({ totp_enabled: false })
      setPhase('idle')
      setCode(''); setPassword('')
      toast?.('2FA disabled', 'success')
    } catch (err) { toast?.(err?.data?.message || 'Failed to disable', 'error') }
    finally { setLoading(false) }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const copyRecovery = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n')).then(() => toast?.('Recovery codes copied', 'success'))
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', background: is2FAEnabled ? '#d1fae5' : 'var(--bg-secondary)', borderRadius:'var(--border-radius)', border:`1px solid ${is2FAEnabled ? '#6ee7b7' : 'var(--border-color)'}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
          <div style={{ width:40, height:40, borderRadius:'var(--border-radius)', background: is2FAEnabled ? '#059669' : 'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
            {is2FAEnabled ? <FiCheck size={20} /> : <FiShield size={20} color="var(--text-muted)" />}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:'var(--text-sm)' }}>
              Two-Factor Authentication
              <span style={{ marginLeft:'0.625rem', fontSize:'0.65rem', fontWeight:700, padding:'2px 8px', borderRadius:'9999px', background: is2FAEnabled ? '#059669' : '#6b7280', color:'#fff' }}>
                {is2FAEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginTop:'0.125rem' }}>
              {is2FAEnabled ? 'Your account is protected with a TOTP authenticator.' : 'Add an extra layer of security with Google Authenticator, Authy, or similar apps.'}
            </div>
          </div>
        </div>
        {phase === 'idle' && (
          <Button variant={is2FAEnabled ? 'danger' : 'teal'} size="sm"
            loading={loading}
            onClick={is2FAEnabled ? () => setPhase('disable') : startSetup}>
            {is2FAEnabled ? 'Disable' : 'Enable 2FA'}
          </Button>
        )}
      </div>

      {/* Setup: show QR code */}
      <AnimatePresence>
        {phase === 'setup' && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{ display:'flex', flexDirection:'column', gap:'1.25rem', padding:'1.5rem', background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)' }}>
            <div style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start', flexWrap:'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
              <div>
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginBottom:'1rem', lineHeight:1.7 }}>
                  <strong>Step 1:</strong> Scan this QR code with Google Authenticator, Authy, or Microsoft Authenticator.
                </p>
                {qrCode && <img src={qrCode} alt="2FA QR Code" style={{ width:180, height:180, border:'4px solid #fff', borderRadius:8, boxShadow:'var(--shadow-md)' }} />}
              </div>
              <div style={{ flex:1, minWidth:200 }}>
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginBottom:'0.75rem', lineHeight:1.7 }}>
                  <strong>Can&apos;t scan?</strong> Enter this key manually:
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--bg-secondary)', padding:'0.625rem 0.875rem', borderRadius:'var(--border-radius)', border:'1px solid var(--border-color)' }}>
                  <code style={{ flex:1, fontSize:'var(--text-xs)', wordBreak:'break-all', fontFamily:'var(--font-mono)', letterSpacing:'0.05em' }}>{secret}</code>
                  <button onClick={copySecret} style={{ background:'none', border:'none', cursor:'pointer', color: copied ? 'var(--color-success)' : 'var(--text-muted)', flexShrink:0 }}>
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                  </button>
                </div>
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginTop:'1.25rem', marginBottom:'0.5rem' }}>
                  <strong>Step 2:</strong> Enter the 6-digit code from your app:
                </p>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/[^0-9]/g,'').slice(0,6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{ width:'100%', padding:'0.75rem', fontSize:'1.5rem', fontWeight:700, letterSpacing:'0.5rem', textAlign:'center', border:'1.5px solid var(--border-color)', borderRadius:'var(--border-radius)', fontFamily:'var(--font-mono)', outline:'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary-light)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
              <Button variant="ghost" onClick={() => { setPhase('idle'); setCode('') }}>Cancel</Button>
              <Button variant="teal" loading={loading} onClick={verifySetup}>
                <FiCheck size={14} /> Verify &amp; Enable
              </Button>
            </div>
          </motion.div>
        )}

        {/* Recovery codes — shown once after enabling */}
        {phase === 'recovery' && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            style={{ padding:'1.5rem', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'var(--border-radius-lg)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'0.875rem' }}>
              <FiKey color="#d97706" size={18} />
              <h4 style={{ fontWeight:700, color:'#92400e' }}>Save your recovery codes</h4>
            </div>
            <p style={{ fontSize:'var(--text-sm)', color:'#b45309', marginBottom:'1rem', lineHeight:1.7 }}>
              These 8 single-use codes let you log in if you lose your authenticator. Store them somewhere safe — they will <strong>not be shown again</strong>.
            </p>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'0.5rem', marginBottom:'1rem' }}>
              {recoveryCodes.map((c, i) => (
                <code key={i} style={{ background:'#fff', border:'1px solid #fde68a', borderRadius:6, padding:'0.375rem 0.75rem', fontSize:'var(--text-sm)', fontFamily:'var(--font-mono)', fontWeight:700, letterSpacing:'0.1em', textAlign:'center' }}>
                  {c.slice(0,4)}-{c.slice(4)}
                </code>
              ))}
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={copyRecovery}><FiCopy size={13} /> Copy all</Button>
              <Button variant="teal" size="sm" onClick={() => setPhase('idle')}>Done, I&apos;ve saved them</Button>
            </div>
          </motion.div>
        )}

        {/* Disable 2FA form */}
        {phase === 'disable' && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            style={{ padding:'1.5rem', background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--color-error)' }}>
              <FiAlertTriangle size={16} />
              <span style={{ fontWeight:700, fontSize:'var(--text-sm)' }}>Confirm to disable 2FA</span>
            </div>
            <p style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', lineHeight:1.7 }}>
              Disabling 2FA reduces your account security. Enter your password and current authenticator code to confirm.
            </p>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Current password"
              style={{ width:'100%', padding:'0.625rem 0.875rem', border:'1.5px solid var(--border-color)', borderRadius:'var(--border-radius)', fontSize:'var(--text-base)', fontFamily:'inherit', outline:'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
            <input value={code} onChange={e => setCode(e.target.value.replace(/[^0-9]/g,'').slice(0,6))} placeholder="6-digit code"
              maxLength={6}
              style={{ width:'100%', padding:'0.75rem', fontSize:'1.25rem', fontWeight:700, letterSpacing:'0.4rem', textAlign:'center', border:'1.5px solid var(--border-color)', borderRadius:'var(--border-radius)', fontFamily:'var(--font-mono)', outline:'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--color-error)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'} />
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
              <Button variant="ghost" onClick={() => { setPhase('idle'); setCode(''); setPassword('') }}>Cancel</Button>
              <Button variant="danger" loading={loading} onClick={disable2FA}>
                <FiX size={14} /> Disable 2FA
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main SecuritySettings page ─────────────────────────────────
const SecuritySettings = () => {
  const { isMobile } = useBreakpoint()
  const { user } = useAuth()
  const [tab, setTab] = useState('sessions')

  const tabs = [
    { id:'sessions', label:'Active Sessions', icon:<FiMonitor size={14} /> },
    { id:'2fa',      label:'Two-Factor Auth', icon:<FiShield size={14} /> },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:800 }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h2 style={{ fontSize:'var(--text-2xl)', fontWeight:800, marginBottom:'0.25rem' }}>Security</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)' }}>
          Manage your active sessions and authentication settings.
        </p>
      </motion.div>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:'0.375rem', background:'var(--bg-secondary)', padding:'0.25rem', borderRadius:'var(--border-radius)', width:'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display:'flex', alignItems:'center', gap:'0.375rem', padding:'0.5rem 1rem', borderRadius:6, border:'none', cursor:'pointer', fontSize:'var(--text-sm)', fontWeight:600, background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? 'var(--color-primary-light)' : 'var(--text-secondary)', boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none', transition:'all .15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}
        style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'1.75rem', boxShadow:'var(--shadow-sm)' }}>
        {tab === 'sessions' && <SessionsPanel />}
        {tab === '2fa'      && <TwoFactorPanel user={user} />}
      </motion.div>
    </div>
  )
}

export default SecuritySettings
