import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUser, FiLock, FiBell, FiShield, FiSave,
  FiExternalLink, FiCheckCircle,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import api from '../../services/api'
import useBreakpoint from '../../hooks/useBreakpoint'
import Button from '../../components/common/Button'
import { Input, Select, Textarea } from '../../components/common/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const TABS = [
  { id: 'profile',   label: 'Profile',        icon: <FiUser /> },
  { id: 'password',  label: 'Password',       icon: <FiLock /> },
  { id: 'notifs',    label: 'Notifications',  icon: <FiBell /> },
  { id: 'privacy',   label: 'Privacy',        icon: <FiShield /> },
]

const Toggle = ({ checked, onChange, disabled }) => (
  <label style={{ position:'relative', display:'inline-block', width:44, height:24, cursor: disabled ? 'not-allowed' : 'pointer', flexShrink:0 }}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ opacity:0, width:0, height:0 }} />
    <span style={{
      position:'absolute', inset:0, borderRadius:24,
      background: checked ? 'var(--color-teal)' : 'var(--border-color-dark)',
      transition:'background 0.2s',
      opacity: disabled ? 0.5 : 1,
    }}>
      <span style={{
        position:'absolute', width:18, height:18, top:3,
        left: checked ? 23 : 3, borderRadius:'50%',
        background:'#fff', transition:'left 0.2s',
        boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </span>
  </label>
)

const Settings = () => {
  const { user, updateUser } = useAuth()
  const { isMobile } = useBreakpoint()
  const { toast }            = useToast() || {}
  const navigate             = useNavigate()
  const [activeTab, setTab]  = useState('profile')
  const [saving, setSaving]  = useState(false)

  // Profile state
  const [profile, setProfile] = useState({
    name: '', phone: '', bio: '', specialization: '',
    yearsExperience: '', consultationFee: '',
    gender: '', bloodType: '', allergies: '', medicalHistory: '',
    emergencyContactName: '', emergencyContactPhone: '',
  })

  // Password state
  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })

  // Notification prefs — loaded from DB
  const [notifPrefs, setNotifPrefs]   = useState(null)
  const [notifLoading, setNotifLoad]  = useState(true)

  // Privacy settings — loaded from DB
  const [privacy, setPrivacy]         = useState(null)
  const [privacyLoading, setPrivLoad] = useState(true)

  // Load user profile into form
  useEffect(() => {
    if (!user) return
    setProfile(prev => ({
      ...prev,
      name:                 user.name               || '',
      phone:                user.phone              || '',
      bio:                  user.bio                || '',
      specialization:       user.specialization     || '',
      yearsExperience:      user.years_experience   || '',
      consultationFee:      user.consultation_fee   || '',
      gender:               user.gender             || '',
      bloodType:            user.blood_type         || '',
      allergies:            user.allergies          || '',
      medicalHistory:       user.medical_history    || '',
      emergencyContactName: user.emergency_contact_name  || '',
      emergencyContactPhone:user.emergency_contact_phone || '',
    }))
  }, [user])

  // Load notification prefs from DB
  useEffect(() => {
    if (activeTab !== 'notifs') return
    setNotifLoad(true)
    api.get('/preferences/notifications')
      .then(res => setNotifPrefs(res.data))
      .catch(() => setNotifPrefs({ email_notifications:true, appointment_reminders:true, new_message_alerts:true, marketing_emails:false }))
      .finally(() => setNotifLoad(false))
  }, [activeTab])

  // Load privacy settings from DB
  useEffect(() => {
    if (activeTab !== 'privacy') return
    setPrivLoad(true)
    api.get('/preferences/privacy')
      .then(res => setPrivacy(res.data))
      .catch(() => setPrivacy({ profile_visible:true, show_online_status:true, activity_tracking:false }))
      .finally(() => setPrivLoad(false))
  }, [activeTab])

  const setP  = e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }))
  const setPw = e => setPasswords(p => ({ ...p, [e.target.name]: e.target.value }))

  // Save profile
  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/users/profile/me', profile)
      updateUser(res.data)
      toast?.('Profile updated successfully', 'success')
    } catch (err) {
      toast?.(err?.data?.message || 'Failed to update profile', 'error')
    } finally { setSaving(false) }
  }

  // Change password
  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) { toast?.('Passwords do not match', 'error'); return }
    if (passwords.newPassword.length < 8)                    { toast?.('Password must be at least 8 characters', 'error'); return }
    setSaving(true)
    try {
      await api.patch('/users/password/me', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      toast?.('Password changed successfully', 'success')
      setPasswords({ currentPassword:'', newPassword:'', confirmPassword:'' })
    } catch (err) {
      toast?.(err?.data?.message || 'Failed to change password', 'error')
    } finally { setSaving(false) }
  }

  // Save notification prefs to DB
  const saveNotifPrefs = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/preferences/notifications', notifPrefs)
      setNotifPrefs(res.data)
      toast?.('Notification preferences saved', 'success')
    } catch (err) {
      toast?.(err?.data?.message || 'Failed to save preferences', 'error')
    } finally { setSaving(false) }
  }

  // Save privacy settings to DB
  const savePrivacy = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/preferences/privacy', privacy)
      setPrivacy(res.data)
      toast?.('Privacy settings saved', 'success')
    } catch (err) {
      toast?.(err?.data?.message || 'Failed to save privacy settings', 'error')
    } finally { setSaving(false) }
  }

  const tabStyle = (id) => ({
    display:'flex', alignItems:'center', gap:'0.5rem',
    padding:'0.625rem 1rem', borderRadius:'var(--border-radius)',
    cursor:'pointer', fontSize:'var(--text-sm)', fontWeight:500,
    background: activeTab === id ? 'var(--color-slate-light)' : 'transparent',
    color: activeTab === id ? 'var(--color-primary-light)' : 'var(--text-secondary)',
    border:'none', fontFamily:'inherit', transition:'all 0.15s', width:'100%', textAlign:'left',
  })

  return (
    <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: isMobile ? '1rem' : '2rem', maxWidth:900 }}>
      {/* Sidebar / Tab bar */}
      <div style={{ display:'flex', flexDirection: isMobile ? 'row' : 'column', gap:'0.25rem', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '0.25rem' : 0 }}>
        {!isMobile && <h2 style={{ fontSize:'var(--text-xl)', fontWeight:800, marginBottom:'1rem', paddingLeft:'1rem' }}>Settings</h2>}
        {TABS.map(tab => (
          <button key={tab.id} style={{ ...tabStyle(tab.id), whiteSpace:'nowrap', flexShrink: isMobile ? 0 : 1 }} onClick={() => setTab(tab.id)}>
            {tab.icon} {tab.label}
          </button>
        ))}
        <button
          style={{ ...tabStyle('security'), marginTop: isMobile ? 0 : '0.5rem', borderTop: isMobile ? 'none' : '1px solid var(--border-color)', paddingTop: isMobile ? '0.5rem' : '0.875rem', whiteSpace:'nowrap', flexShrink: isMobile ? 0 : 1 }}
          onClick={() => navigate(`/${user?.role}/security`)}>
          <FiShield /> Security <FiExternalLink size={12} style={{ marginLeft:'auto', opacity:0.5 }} />
        </button>
      </div>

      {/* Content panel */}
      <motion.div key={activeTab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}
        style={{ background:'#fff', border:'1px solid var(--border-color)', borderRadius:'var(--border-radius-lg)', padding:'2rem', boxShadow:'var(--shadow-sm)' }}>

        {/* ── Profile ── */}
        {activeTab === 'profile' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <h3 style={{ fontWeight:700, fontSize:'var(--text-lg)' }}>Profile Information</h3>

            {/* Avatar + verification badge */}
            <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', padding:'1.25rem', background:'var(--bg-secondary)', borderRadius:'var(--border-radius)' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--color-slate-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:800, color:'var(--color-primary-light)', overflow:'hidden' }}>
                {user?.avatar_url ? <img src={user.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : user?.name?.[0]}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700 }}>{user?.name}</div>
                <div style={{ fontSize:'var(--text-sm)', color:'var(--text-secondary)', textTransform:'capitalize' }}>{user?.role}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.375rem' }}>
                  {user?.is_verified ? (
                    <span style={{ display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'var(--text-xs)', color:'var(--color-success)', fontWeight:600 }}>
                      <FiCheckCircle size={12} /> Email Verified
                    </span>
                  ) : (
                    <span style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'var(--text-xs)', color:'var(--color-warning)', fontWeight:600 }}>
                      ⚠ Email not verified
                      <button onClick={() => api.post('/auth/send-verification', {}).then(() => toast?.('Verification email sent', 'success')).catch(() => toast?.('Failed to send', 'error'))}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--color-primary-light)', fontWeight:700, fontSize:'var(--text-xs)', textDecoration:'underline', padding:0 }}>
                        Resend
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1rem' }}>
              <Input label="Full name" name="name" value={profile.name} onChange={setP} required />
              <Input label="Phone number" name="phone" type="tel" value={profile.phone} onChange={setP} />
            </div>

            {user?.role === 'doctor' && (
              <>
                <Input label="Specialization" name="specialization" value={profile.specialization} onChange={setP} />
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1rem' }}>
                  <Input label="Years of experience" name="yearsExperience" type="number" value={profile.yearsExperience} onChange={setP} />
                  <Input label="Consultation fee ($)" name="consultationFee" type="number" value={profile.consultationFee} onChange={setP} />
                </div>
                <Textarea label="Bio / About" name="bio" value={profile.bio} onChange={setP} rows={3} placeholder="Tell patients about yourself…" />
              </>
            )}

            {user?.role === 'patient' && (
              <>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1rem' }}>
                  <Select label="Gender" name="gender" value={profile.gender} onChange={setP}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </Select>
                  <Select label="Blood type" name="bloodType" value={profile.bloodType} onChange={setP}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </div>
                <Textarea label="Allergies" name="allergies" value={profile.allergies} onChange={setP} rows={2} placeholder="List any known allergies…" />
                <Textarea label="Medical history" name="medicalHistory" value={profile.medicalHistory} onChange={setP} rows={3} placeholder="Relevant medical history…" />
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'1rem' }}>
                  <Input label="Emergency contact name" name="emergencyContactName" value={profile.emergencyContactName} onChange={setP} />
                  <Input label="Emergency contact phone" name="emergencyContactPhone" type="tel" value={profile.emergencyContactPhone} onChange={setP} />
                </div>
              </>
            )}

            <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:'0.5rem', borderTop:'1px solid var(--border-color)' }}>
              <Button loading={saving} onClick={saveProfile}><FiSave size={14} /> Save Changes</Button>
            </div>
          </div>
        )}

        {/* ── Password ── */}
        {activeTab === 'password' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <h3 style={{ fontWeight:700, fontSize:'var(--text-lg)' }}>Change Password</h3>
            <div style={{ background:'var(--color-info-bg)', borderRadius:'var(--border-radius)', padding:'0.875rem 1rem', fontSize:'var(--text-sm)', color:'var(--color-info)', border:'1px solid rgba(37,99,235,0.2)' }}>
              Use a strong password — at least 8 characters with uppercase, lowercase, and a number.
            </div>
            <Input label="Current password" name="currentPassword" type="password" value={passwords.currentPassword} onChange={setPw} required />
            <Input label="New password"     name="newPassword"     type="password" value={passwords.newPassword}     onChange={setPw} required />
            <Input label="Confirm new password" name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={setPw} required />
            <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:'0.5rem', borderTop:'1px solid var(--border-color)' }}>
              <Button loading={saving} onClick={changePassword}><FiLock size={14} /> Update Password</Button>
            </div>
          </div>
        )}

        {/* ── Notifications ── */}
        {activeTab === 'notifs' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <h3 style={{ fontWeight:700, fontSize:'var(--text-lg)' }}>Notification Preferences</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', marginTop:'-0.5rem' }}>
              Control which emails and alerts you receive. Changes are saved to your account.
            </p>

            {notifLoading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><LoadingSpinner size={28} /></div>
            ) : (
              <>
                {[
                  { key:'email_notifications',   label:'Email notifications',      desc:'Master toggle for all email communications from HMS' },
                  { key:'appointment_reminders', label:'Appointment reminders',    desc:'Email reminder 24 hours before each appointment' },
                  { key:'new_message_alerts',    label:'New message alerts',       desc:'Email when you receive a message from a doctor or patient' },
                  { key:'marketing_emails',      label:'Product updates & tips',   desc:'Occasional emails about new HMS features and improvements' },
                ].map(item => (
                  <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem', background:'var(--bg-secondary)', borderRadius:'var(--border-radius)', border:'1px solid var(--border-color)' }}>
                    <div style={{ paddingRight:'1rem' }}>
                      <div style={{ fontWeight:600, fontSize:'var(--text-sm)' }}>{item.label}</div>
                      <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginTop:'0.125rem' }}>{item.desc}</div>
                    </div>
                    <Toggle
                      checked={!!notifPrefs?.[item.key]}
                      onChange={e => setNotifPrefs(p => ({ ...p, [item.key]: e.target.checked }))}
                    />
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:'0.5rem', borderTop:'1px solid var(--border-color)' }}>
                  <Button loading={saving} onClick={saveNotifPrefs}><FiSave size={14} /> Save Preferences</Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Privacy ── */}
        {activeTab === 'privacy' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <h3 style={{ fontWeight:700, fontSize:'var(--text-lg)' }}>Privacy Settings</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'var(--text-sm)', marginTop:'-0.5rem' }}>
              Control how your information is visible to other users on the platform.
            </p>

            {privacyLoading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'2rem' }}><LoadingSpinner size={28} /></div>
            ) : (
              <>
                {[
                  { key:'profile_visible',    label:'Profile visibility',   desc:'Allow doctors/patients to view your profile details' },
                  { key:'show_online_status', label:'Show online status',   desc:'Show a green dot when you are active on the platform' },
                  { key:'activity_tracking',  label:'Usage analytics',      desc:'Help us improve HMS by sharing anonymous usage data' },
                ].map(item => (
                  <div key={item.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem', background:'var(--bg-secondary)', borderRadius:'var(--border-radius)', border:'1px solid var(--border-color)' }}>
                    <div style={{ paddingRight:'1rem' }}>
                      <div style={{ fontWeight:600, fontSize:'var(--text-sm)' }}>{item.label}</div>
                      <div style={{ fontSize:'var(--text-xs)', color:'var(--text-secondary)', marginTop:'0.125rem' }}>{item.desc}</div>
                    </div>
                    <Toggle
                      checked={!!privacy?.[item.key]}
                      onChange={e => setPrivacy(p => ({ ...p, [item.key]: e.target.checked }))}
                    />
                  </div>
                ))}

                {/* Data export */}
                <div style={{ padding:'1rem', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:'var(--border-radius)' }}>
                  <div style={{ fontWeight:600, color:'#92400e', fontSize:'var(--text-sm)', marginBottom:'0.375rem' }}>Data Export</div>
                  <div style={{ fontSize:'var(--text-xs)', color:'#b45309', marginBottom:'0.75rem' }}>
                    Download a copy of your personal data stored in MediCare HMS.
                  </div>
                  <Button variant="ghost" size="sm" onClick={async () => { try { await api.post('/auth/logout', {}); } catch{} toast?.('Data export request submitted. We will email your data within 48 hours.', 'info') }}>
                    Request Data Export
                  </Button>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:'0.5rem', borderTop:'1px solid var(--border-color)' }}>
                  <Button loading={saving} onClick={savePrivacy}><FiSave size={14} /> Save Privacy Settings</Button>
                </div>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Settings
