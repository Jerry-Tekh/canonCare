import useBreakpoint from '../../hooks/useBreakpoint'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiPhone, FiAward, FiCalendar } from 'react-icons/fi'
import { GiMedicalPack } from 'react-icons/gi'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import { Input, Select } from '../../components/common/Input'
import bg2 from '../../assets/bg2.png'

const Register = () => {
  const { register } = useAuth()
  const { isMobile } = useBreakpoint()
  const navigate     = useNavigate()
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'patient', phone: '',
    specialization: '', licenseNumber: '',
    dateOfBirth: '', gender: '',
  })

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setError('')
    setLoading(true)
    try {
      const user = await register(form)
      navigate(`/${user.role}`, { replace: true })
    } catch (err) {
      setError(err?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const card = { background: '#fff', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 520, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `linear-gradient(rgba(10,20,40,0.6), rgba(10,20,40,0.6)), url(${bg2})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '2rem' }}>
      <motion.div style={card} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, background: 'var(--color-teal)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GiMedicalPack color="#fff" size={20} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>Canon Care HMS</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>Create an account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Join the HMS platform</p>
        </div>

        {error && (
          <div style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select label="I am registering as" name="role" value={form.role} onChange={set} required>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor / Physician</option>
          </Select>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
            <Input label="Full name" name="name" value={form.name} onChange={set} icon={<FiUser />} placeholder="Jane Smith" required />
            <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={set} icon={<FiPhone />} placeholder="+1 555 0100" />
          </div>

          <Input label="Email address" name="email" type="email" value={form.email} onChange={set} icon={<FiMail />} placeholder="you@example.com" required />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
            <Input label="Password" name="password" type="password" value={form.password} onChange={set} icon={<FiLock />} placeholder="Min 8 chars" required />
            <Input label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={set} icon={<FiLock />} placeholder="Repeat" required />
          </div>

          {form.role === 'doctor' && (
            <>
              <Input label="Specialization" name="specialization" value={form.specialization} onChange={set} icon={<FiAward />} placeholder="e.g. Cardiology" required />
              <Input label="License number" name="licenseNumber" value={form.licenseNumber} onChange={set} placeholder="e.g. LIC-001-CARD" required />
            </>
          )}

          {form.role === 'patient' && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
              <Input label="Date of birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set} icon={<FiCalendar />} />
              <Select label="Gender" name="gender" value={form.gender} onChange={set}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </Select>
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth size="lg">Create Account</Button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register
