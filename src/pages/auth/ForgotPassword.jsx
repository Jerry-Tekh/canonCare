import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { GiMedicalPack } from 'react-icons/gi'
import api from '../../services/api'
import Button from '../../components/common/Button'
import { Input } from '../../components/common/Input'

const ForgotPassword = () => {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err?.data?.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const cardStyle = {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg-secondary)', padding: '2rem',
  }

  return (
    <div style={cardStyle}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 440, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ width: 40, height: 40, background: 'var(--color-teal)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GiMedicalPack color="#fff" size={20} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800 }}>MediCare HMS</span>
          </div>

          {!sent ? (
            <>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.375rem' }}>Forgot Password?</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                Enter your email and we'll send you a link to reset your password.
              </p>
            </>
          ) : (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <FiCheckCircle size={28} color="#059669" />
              </div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.375rem' }}>Check your email</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                If <strong>{email}</strong> is registered, a password reset link has been sent. Check your inbox (and spam folder).
              </p>
            </>
          )}
        </div>

        {!sent && (
          <>
            {error && (
              <div style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input label="Email address" type="email" value={email}
                onChange={e => setEmail(e.target.value)} icon={<FiMail />}
                placeholder="you@example.com" required />
              <Button type="submit" loading={loading} fullWidth size="lg">
                Send Reset Link
              </Button>
            </form>
          </>
        )}

        {sent && (
          <Button variant="ghost" fullWidth onClick={() => { setSent(false); setEmail('') }}>
            Try a different email
          </Button>
        )}

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
            <FiArrowLeft size={14} /> Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default ForgotPassword
