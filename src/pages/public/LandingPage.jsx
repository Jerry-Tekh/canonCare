import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiMessageSquare, FiVideo, FiShield, FiActivity, FiArrowRight, FiPhone, FiMail, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import { GiMedicalPack } from 'react-icons/gi';
import bg2 from '../../assets/bg2.png';
import styles from './LandingPage.module.css';
import Button from '../../components/common/Button';

const FEATURES = [
  { icon: <FiCalendar size={28} />, title: 'Smart Scheduling', desc: 'Book appointments 24/7 with real-time availability and instant confirmation.' },
  { icon: <FiVideo size={28} />,    title: 'Video Consultations', desc: 'Secure WebRTC-powered video calls with your doctor from anywhere.' },
  { icon: <FiMessageSquare size={28} />, title: 'Real-time Chat', desc: 'Encrypted messaging between patients and doctors with file sharing.' },
  { icon: <FiShield size={28} />,   title: 'Role-Based Security', desc: 'Enterprise-grade RBAC ensures the right people see the right data.' },
  { icon: <FiActivity size={28} />, title: 'Health Dashboard', desc: 'Visualize your health timeline, prescriptions, and medical history.' },
  { icon: <FiAlertCircle size={28} />, title: 'Emergency Alerts', desc: 'Instant emergency notifications with on-call doctor routing.' },
];

const Nav = () => (
  <nav className={styles.nav}>
    <div className={styles.navInner}>
      <div className={styles.logo}>
        <div className={styles.logoBox}>
          <GiMedicalPack color="#fff" size={18} />
        </div>
        <span className={styles.logoText}>Canon Care HMS</span>
      </div>
      <div className={styles.navActions}>
        <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.625rem, 2vw, var(--text-sm))', fontWeight: 600, padding: '0.375rem 0.5rem', whiteSpace: 'nowrap' }}>Sign In</Link>
        <Link to="/register"><Button variant="primary" size="sm">Get Started</Button></Link>
      </div>
    </div>
  </nav>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', background: '#fff' }}>
      <Nav />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}>
          <GiMedicalPack className={styles.overlayIcon1} />
          <GiMedicalPack className={styles.overlayIcon2} />
          <GiMedicalPack className={styles.overlayIcon3} />
        </div>
        <motion.div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }} initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className={styles.badge}>
            <GiMedicalPack color="#fff" size={18} />
            Ready Healthcare Platform
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>
            The Modern Hospital<br />Management System
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 560, margin: '0 auto 2.5rem' }}>
            A unified platform connecting doctors, patients, and administrators — with real-time chat, video consultations, smart scheduling, and enterprise-grade security.
          </p>
          <div className={styles.heroButtons}>
            <Button variant="teal" size="xl" onClick={() => navigate('/register?role=patient')}>I'm a Patient <FiArrowRight /></Button>
            <Button size="xl" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }} onClick={() => navigate('/register?role=doctor')}>I'm a Doctor</Button>
          </div>
         
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className={styles.statsSection}>
        <div className={styles.statsInner}>
          {[
            { value: '10,000+', label: 'Patients Managed' },
            { value: '500+',    label: 'Registered Doctors' },
            { value: '99.9%',   label: 'Uptime SLA' },
            { value: '< 100ms', label: 'Real-time Latency' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresInner}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, marginBottom: '0.75rem' }}>Everything Your Hospital Needs</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: 520, margin: '0 auto' }}>Built for real-world healthcare — secure, scalable, and production-ready.</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={styles.featureCard}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = ''; }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Ready to transform your healthcare workflow?</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2rem', fontSize: '1.0625rem' }}>Join thousands of healthcare professionals on Canon Care HMS.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="teal" size="xl" onClick={() => navigate('/register')}>Start for Free <FiArrowRight /></Button>
            <Button size="xl" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <div style={{ width: 28, height: 28, background: 'var(--color-teal)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><GiMedicalPack color="#fff" size={14} /></div>
          <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Canon Care HMS</span>
        </div>
        <div className={styles.contactList}>
          {[{ icon: <FiPhone size={14} />, text: '+1 (800) HMS-CARE' }, { icon: <FiMail size={14} />, text: 'support@canoncare-hms.com' }, { icon: <FiMapPin size={14} />, text: 'San Francisco, CA' }].map(c => (
            <span key={c.text} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>{c.icon} {c.text}</span>
          ))}
        </div>
        <p>© {new Date().getFullYear()} Canon Care HMS · All rights reserved · Built with ❤️ for better healthcare</p>
      </footer>
    </div>
  );
};

export default LandingPage;
