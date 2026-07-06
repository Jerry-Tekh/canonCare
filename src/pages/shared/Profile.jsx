import useBreakpoint from '../../hooks/useBreakpoint'
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiPhone, FiMail, FiCalendar, FiDroplet, FiAlertCircle, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Row = ({ icon, label, value }) => (
  <div style={{ display:'flex', gap:'1rem', padding:'0.75rem 0', borderBottom:'1px solid var(--border-color)', flexWrap:'wrap' }}>
    <span style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontSize: 'var(--text-sm)', color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: value ? 'normal' : 'italic' }}>{value || 'Not provided'}</div>
    </div>
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${user.id}`)
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  const { isMobile } = useBreakpoint()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner /></div>;

  const p = profile?.profile || {};

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', borderRadius: 'var(--border-radius-xl)', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#fff' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, flexShrink: 0, border: '3px solid rgba(255,255,255,0.4)' }}>
          {user?.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user?.name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>{user?.name}</h2>
          <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: '0.75rem' }}>{user?.email}</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Badge label={user?.role} variant={user?.role} />
            {p.blood_type && <Badge label={`Blood: ${p.blood_type}`} variant="default" />}
            {p.gender && <Badge label={p.gender} variant="default" />}
          </div>
        </div>
        <Button variant="ghost" size="sm"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }}
          onClick={() => navigate(`/${user?.role}/settings`)}>
          <FiEdit2 /> Edit Profile
        </Button>
      </motion.div>

      {/* Details */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: 'var(--text-lg)' }}>Personal Information</h3>
        <Row icon={<FiMail size={16} />}     label="Email"         value={user?.email} />
        <Row icon={<FiPhone size={16} />}    label="Phone"         value={user?.phone} />
        {user?.role === 'patient' && (
          <>
            <Row icon={<FiCalendar size={16} />} label="Date of Birth"  value={p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : null} />
            <Row icon={<FiDroplet size={16} />}  label="Blood Type"     value={p.blood_type} />
            <Row icon={<FiAlertCircle size={16}/>}label="Allergies"     value={p.allergies} />
            <Row icon={<FiUser size={16} />}     label="Medical History" value={p.medical_history} />
            <Row icon={<FiPhone size={16} />}    label="Emergency Contact" value={p.emergency_contact_name ? `${p.emergency_contact_name} · ${p.emergency_contact_phone}` : null} />
            <Row icon={<FiUser size={16} />}     label="Insurance"      value={p.insurance_provider ? `${p.insurance_provider} (${p.insurance_number})` : null} />
          </>
        )}
        {user?.role === 'doctor' && (
          <>
            <Row icon={<FiUser size={16} />}     label="Specialization"  value={p.specialization} />
            <Row icon={<FiUser size={16} />}     label="License Number"  value={p.license_number} />
            <Row icon={<FiCalendar size={16} />} label="Experience"      value={p.years_experience ? `${p.years_experience} years` : null} />
            <Row icon={<FiUser size={16} />}     label="Consultation Fee" value={p.consultation_fee ? `$${p.consultation_fee}` : null} />
            <Row icon={<FiUser size={16} />}     label="Bio"             value={p.bio} />
          </>
        )}
        <div style={{ paddingTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <Badge label={user?.is_verified ? 'Verified' : 'Unverified'} variant={user?.is_verified ? 'accepted' : 'pending'} />
          <Badge label={user?.is_active   ? 'Active'   : 'Inactive'}   variant={user?.is_active   ? 'active'   : 'inactive'} />
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
