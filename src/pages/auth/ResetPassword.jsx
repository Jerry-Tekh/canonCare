import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLock, FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import { GiMedicalPack } from 'react-icons/gi'
import api from '../../services/api'
import Button from '../../components/common/Button'
import { Input } from '../../components/common/Input'

const ResetPassword = () => {
  const [params]    = useSearchParams()
  const navigate    = useNavigate()
  const token       = params.get('token')

  const [tokenValid, setTokenValid]   = useState(null)  // null=checking, true, false
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [done, setDone]               = useState(false)
  const [error, setError]             = useState('')

  // Validate token on mount
  useEffect(() => {
    if (!token) { setTokenValid(false); return }
    api.get(`/auth/verify-reset-token?token=${token}`)
      .then(res => { setTokenValid(true); setEmail(res.data?.email || '') })
      .catch(() => setTokenValid(false))
  }, [token])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err?.data?.message || 'Reset failed. Please request a new link.')
    } finally { setLoading(false) }
  }

  const wrap = (content) => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 440, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 40, height: 40, background: 'var(--color-teal)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GiMedicalPack color="#fff" size={20} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800 }}>MediCare HMS</span>
          </div>
          {content}
        </div>
      </motion.div>
    </div>
  )

  // Checking token validity
  if (tokenValid === null) return wrap(
    <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Verifying your reset link…</div>
  )

  // Invalid token
  if (tokenValid === false) return wrap(
    <>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
        <FiAlertCircle size={28} color="#dc2626" />
      </div>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Link Invalid or Expired</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: '1rem' }}>
        This password reset link has expired or already been used. Reset links are valid for 1 hour.
      </p>
      <Link to="/forgot-password">
        <Button variant="primary" fullWidth>Request a new link</Button>
      </Link>
    </>
  )

  // Success
  if (done) return wrap(
    <>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
        <FiCheckCircle size={28} color="#059669" />
      </div>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Password Reset!</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
        Your password has been changed. All existing sessions have been logged out for security. Redirecting to login…
      </p>
    </>
  )

  // Reset form
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 440, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 40, height: 40, background: 'var(--color-teal)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GiMedicalPack color="#fff" size={20} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800 }}>MediCare HMS</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.375rem' }}>Set New Password</h1>
          {email && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>For <strong>{email}</strong></p>}
        </div>

        {error && (
          <div style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="New password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} icon={<FiLock />}
            placeholder="Min 8 characters" required
            hint="Use uppercase, lowercase, and numbers for a strong password" />
          <Input label="Confirm new password" type="password" value={confirm}
            onChange={e => setConfirm(e.target.value)} icon={<FiLock />}
            placeholder="Repeat password" required />

          {/* Password strength indicator */}
          {password.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[
                password.length >= 8,
                /[A-Z]/.test(password),
                /[0-9]/.test(password),
                /[^A-Za-z0-9]/.test(password),
              ].map((met, i) => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: met ? (i < 2 ? '#f59e0b' : '#059669') : 'var(--border-color)', transition: 'background 0.2s' }} />
              ))}
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg">
            Reset Password
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
            <FiArrowLeft size={14} /> Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default ResetPassword
