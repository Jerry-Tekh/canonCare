import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiShield, FiCalendar, FiMessageSquare, FiVideo, FiKey } from 'react-icons/fi'
import { GiMedicalPack } from 'react-icons/gi'
import { useAuth } from '../../context/AuthContext'
import api, { setAccessToken } from '../../services/api'
import Button from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import styles from './Login.module.css'

const Login = () => {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  // Step 1 — credentials
  const [form, setForm]           = useState({ email:'', password:'' })
  // Step 2 — 2FA
  const [step, setStep]           = useState('credentials')  // 'credentials' | '2fa'
  const [partialToken, setPToken] = useState(null)
  const [otpCode, setOtpCode]     = useState('')

  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  // ── Step 1: submit credentials ──────────────────────────────
  const handleCredentials = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form.email, form.password)

      // Server says 2FA required
      if (result.requires2FA) {
        setPToken(result.partialToken)
        setStep('2fa')
        return
      }

      navigate(`/${result.user.role}`, { replace: true })
    } catch (err) {
      setError(err?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: submit 2FA code ─────────────────────────────────
  const handle2FA = async e => {
    e.preventDefault()
    if (otpCode.replace(/\s/g,'').length !== 6) { setError('Enter the 6-digit code from your authenticator'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/2fa/authenticate', { partialToken, code: otpCode.replace(/\s/g,'') })
      setAccessToken(res.data.accessToken)
      navigate(`/${res.data.user.role}`, { replace: true })
    } catch (err) {
      setError(err?.data?.message || 'Invalid code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoBox}><GiMedicalPack color="#fff" size={24} /></div>
            <span className={styles.logoName}>Canon Care</span>
          </Link>
          <span className={styles.panelEyebrow}>YOUR HEALTH, OUR PRIORITY</span>
          <h2 className={styles.tagline}>Care that stays connected to you.</h2>
          <p className={styles.sub}>Book visits, connect with your care team, and keep your health information together in one secure place.</p>
          <div className={styles.features}>
            {[
              { icon:<FiCalendar size={16} />,     text:'Manage your appointments in one place' },
              { icon:<FiMessageSquare size={16} />, text:'Stay in touch with your care team' },
              { icon:<FiVideo size={16} />,         text:'Connect through virtual consultations' },
              { icon:<FiShield size={16} />,        text:'Your health information stays protected' },
            ].map((f, i) => (
              <div className={styles.feature} key={i}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <AnimatePresence mode="wait">

          {/* ── Step 1: Credentials ── */}
          {step === 'credentials' && (
            <motion.div key="credentials" className={styles.formWrap}
              initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              transition={{ duration:0.35 }}>
              <span className={styles.formEyebrow}>PATIENT &amp; CARE TEAM PORTAL</span>
              <h1 className={styles.welcome}>Welcome back</h1>
              <p className={styles.welcomeSub}>Access your appointments, care team, and health records.</p>
              {error && <div className={styles.error}>{error}</div>}
              <form className={styles.form} onSubmit={handleCredentials}>
                <Input label="Email address" name="email" type="email" value={form.email}
                  onChange={set} icon={<FiMail />} placeholder="you@example.com" required />
                <div>
                  <Input label="Password" name="password" type="password" value={form.password}
                    onChange={set} icon={<FiLock />} placeholder="••••••••" required />
                  <div className={styles.forgotLink}><Link to="/forgot-password">Forgot password?</Link></div>
                </div>
                <Button type="submit" loading={loading} fullWidth size="lg">Sign In</Button>
              </form>
              <p className={styles.registerLink} style={{ marginTop:'1.5rem' }}>
                Don&apos;t have an account? <Link to="/register">Sign up</Link>
              </p>
            </motion.div>
          )}

          {/* ── Step 2: 2FA ── */}
          {step === '2fa' && (
            <motion.div key="2fa" className={styles.formWrap}
              initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
              transition={{ duration:0.35 }}>
              <div style={{ width:56, height:56, borderRadius:14, background:'var(--color-teal-light)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem' }}>
                <FiKey size={26} color="var(--color-teal)" />
              </div>
              <span className={styles.formEyebrow}>ACCOUNT SECURITY</span>
              <h1 className={styles.welcome}>Verify it’s you</h1>
              <p className={styles.welcomeSub}>
                Open your authenticator app and enter the 6-digit code.
              </p>
              {error && <div className={styles.error}>{error}</div>}
              <form className={styles.form} onSubmit={handle2FA}>
                <div>
                  <label style={{ display:'block', fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text-secondary)', marginBottom:'0.375rem' }}>
                    Authentication Code
                  </label>
                  <input
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g,'').slice(0,6))}
                    placeholder="000000"
                    maxLength={6}
                    style={{ width:'100%', padding:'0.875rem', fontSize:'1.75rem', fontWeight:700, letterSpacing:'0.5rem', textAlign:'center', border:'1.5px solid var(--border-color)', borderRadius:'var(--border-radius)', fontFamily:'var(--font-mono)', outline:'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary-light)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    autoFocus
                  />
                </div>
                <Button type="submit" loading={loading} fullWidth size="lg">Verify</Button>
              </form>
              <div style={{ marginTop:'1rem', textAlign:'center' }}>
                <button onClick={() => { setStep('credentials'); setError(''); setOtpCode('') }}
                  style={{ background:'none', border:'none', color:'var(--color-primary-light)', cursor:'pointer', fontSize:'var(--text-sm)', fontWeight:600 }}>
                  ← Back to login
                </button>
              </div>
              <div style={{ marginTop:'0.75rem', textAlign:'center' }}>
                <Link to="/auth/recovery" style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>
                  Lost access to your authenticator?
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

export default Login
