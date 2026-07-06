import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiAlertCircle, FiMail } from 'react-icons/fi'
import { GiMedicalPack } from 'react-icons/gi'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const VerifyEmail = () => {
  const [params]  = useSearchParams()
  const { user }  = useAuth()
  const token     = params.get('token')

  const [status, setStatus]   = useState('verifying') // verifying | success | error | resent
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No verification token found.'); return }

    api.get(`/auth/verify-email?token=${token}`)
      .then(res => { setStatus('success'); setMessage(res.message || 'Email verified successfully!') })
      .catch(err => { setStatus('error'); setMessage(err?.data?.message || 'Verification failed.') })
  }, [token])

  const resendVerification = async () => {
    setResending(true)
    try {
      await api.post('/auth/send-verification', {})
      setStatus('resent')
    } catch (err) {
      setMessage(err?.data?.message || 'Failed to resend. Please try again.')
    } finally { setResending(false) }
  }

  const Card = ({ children }) => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 420, padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 36, height: 36, background: 'var(--color-teal)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GiMedicalPack color="#fff" size={18} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>MediCare HMS</span>
        </div>
        {children}
      </motion.div>
    </div>
  )

  if (status === 'verifying') return (
    <Card>
      <LoadingSpinner size={36} />
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Verifying your email…</p>
    </Card>
  )

  if (status === 'success') return (
    <Card>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiCheckCircle size={30} color="#059669" />
      </div>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Email Verified! 🎉</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
        Your account is now fully activated. You have access to all features of MediCare HMS.
      </p>
      <Link to="/login" style={{ width: '100%' }}>
        <Button variant="teal" fullWidth size="lg">Continue to Login</Button>
      </Link>
    </Card>
  )

  if (status === 'resent') return (
    <Card>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiMail size={30} color="#2563b0" />
      </div>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Verification Email Sent</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
        A new verification link has been sent to your email. Please check your inbox and spam folder.
      </p>
      <Link to="/login">
        <Button variant="ghost">Back to Login</Button>
      </Link>
    </Card>
  )

  // Error state
  return (
    <Card>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiAlertCircle size={30} color="#dc2626" />
      </div>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>Verification Failed</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>{message}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', width: '100%' }}>
        {user && (
          <Button variant="primary" fullWidth loading={resending} onClick={resendVerification}>
            <FiMail size={14} /> Resend Verification Email
          </Button>
        )}
        <Link to="/login" style={{ width: '100%' }}>
          <Button variant="ghost" fullWidth>Back to Login</Button>
        </Link>
      </div>
    </Card>
  )
}

export default VerifyEmail
