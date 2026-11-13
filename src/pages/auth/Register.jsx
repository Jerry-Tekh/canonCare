import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiPhone, FiAward, FiCalendar, FiShield } from 'react-icons/fi'
import { GiMedicalPack } from 'react-icons/gi'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import { Input, Select } from '../../components/common/Input'
import styles from './Register.module.css'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedRole = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: requestedRole, phone: '', specialization: '', licenseNumber: '',
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

  return (
    <div className={styles.page}>
      <aside className={styles.visual}>
        <div className={styles.visualTop}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}><GiMedicalPack /></span>
            <span><strong>Canon Care</strong><small>HEALTH &amp; WELLNESS</small></span>
          </Link>
          <Link to="/" className={styles.homeLink}>Back to home</Link>
        </div>
        <div className={styles.visualCopy}>
          <span className={styles.eyebrow}>CARE THAT PUTS YOU FIRST</span>
          <h2>A healthier journey starts here.</h2>
          <p>Create your account to connect with your care team and keep your health journey organized.</p>
          <div className={styles.trustNote}><FiShield /><span><strong>Your information matters.</strong><small>Your account is designed with privacy and security in mind.</small></span></div>
        </div>
      </aside>

      <main className={styles.content}>
        <motion.div className={styles.formWrap} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
          <Link to="/" className={styles.mobileLogo}><span className={styles.logoMark}><GiMedicalPack /></span><strong>Canon Care</strong></Link>
          <span className={styles.formEyebrow}>GET STARTED WITH CANON CARE</span>
          <h1>Create your account</h1>
          <p className={styles.intro}>Join us and stay connected to the care that matters to you.</p>

          {error && <div className={styles.error} role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <Select label="I am registering as" name="role" value={form.role} onChange={set} required>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor / Physician</option>
            </Select>

            <div className={styles.pairGrid}>
              <Input label="Full name" name="name" value={form.name} onChange={set} icon={<FiUser />} placeholder="Jane Smith" required />
              <Input label="Phone number" name="phone" type="tel" value={form.phone} onChange={set} icon={<FiPhone />} placeholder="+234 800 000 0000" />
            </div>

            <Input label="Email address" name="email" type="email" value={form.email} onChange={set} icon={<FiMail />} placeholder="you@example.com" required />

            <div className={styles.pairGrid}>
              <Input label="Password" name="password" type="password" value={form.password} onChange={set} icon={<FiLock />} placeholder="At least 8 characters" required />
              <Input label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={set} icon={<FiLock />} placeholder="Enter it again" required />
            </div>

            {form.role === 'doctor' && <div className={styles.pairGrid}>
              <Input label="Specialization" name="specialization" value={form.specialization} onChange={set} icon={<FiAward />} placeholder="e.g. Cardiology" required />
              <Input label="License number" name="licenseNumber" value={form.licenseNumber} onChange={set} placeholder="Your professional license" required />
            </div>}

            {form.role === 'patient' && <div className={styles.pairGrid}>
              <Input label="Date of birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set} icon={<FiCalendar />} />
              <Select label="Gender" name="gender" value={form.gender} onChange={set}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </Select>
            </div>}

            <Button type="submit" loading={loading} fullWidth size="lg">Create account</Button>
          </form>

          <p className={styles.signIn}>Already have an account? <Link to="/login">Sign in</Link></p>
          <p className={styles.terms}>By creating an account, you agree to keep your sign-in details private and secure.</p>
        </motion.div>
      </main>
    </div>
  )
}

export default Register
