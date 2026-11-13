import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiActivity, FiArrowRight, FiCalendar, FiChevronRight, FiHeart,
  FiMenu, FiShield, FiUsers, FiVideo, FiX,
} from 'react-icons/fi';
import { GiMedicalPack } from 'react-icons/gi';
import patientDashboard from '../../assets/Dashboard/PatientDashboard.png';
import doctorDashboard from '../../assets/Dashboard/docDashboard.png';
import styles from './LandingPage.module.css';

const SERVICES = [
  { icon: <FiCalendar />, title: 'Request an appointment', text: 'Choose an available doctor, a date and time, and an appointment type: in person, phone, or video.' },
  { icon: <FiActivity />, title: 'Follow its status', text: 'See appointment requests and their current status from your patient dashboard.' },
  { icon: <FiVideo />, title: 'Stay in touch', text: 'Use your account to message your doctor or join a video call when one is part of your care.' },
  { icon: <FiHeart />, title: 'Keep care details together', text: 'Return to appointments, prescriptions, documents, and health information in one place.' },
];

const LandingPage = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);

  return <div className={styles.page}>
    <div className={styles.topbar}><div className={styles.topbarInner}>
      <span><FiShield /> Your care, organized in one secure account</span>
      <Link to="/login"><FiUsers /> Already a patient? Sign in</Link>
    </div></div>
    <header className={styles.nav}><div className={styles.navInner}>
      <Link to="/" className={styles.logo} aria-label="Canon Care home"><span className={styles.logoMark}><GiMedicalPack /></span><span><strong>Canon Care</strong><small>HEALTH &amp; WELLNESS</small></span></Link>
      <nav id="primary-navigation" className={`${styles.navLinks} ${mobileNavOpen ? styles.navLinksOpen : ''}`} aria-label="Main navigation">
        <a href="#home" onClick={closeMobileNav}>Home</a><a href="#services" onClick={closeMobileNav}>What you can do</a><a href="#about" onClick={closeMobileNav}>Your dashboards</a><a href="#contact" onClick={closeMobileNav}>Get started</a>
      </nav>
      <div className={styles.navActions}><Link to="/login" className={styles.signIn}>Sign in</Link><Link to="/register?role=patient" className={styles.navCta}>Book an appointment <FiChevronRight /></Link></div>
      <button type="button" className={styles.mobileMenu} aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileNavOpen} aria-controls="primary-navigation" onClick={() => setMobileNavOpen(open => !open)}>{mobileNavOpen ? <FiX /> : <FiMenu />}</button>
    </div></header>

    <main>
      <section className={styles.hero} id="home">
        <div className={styles.heroImage} role="img" aria-label="Healthcare professional ready to care for a patient" /><div className={styles.heroShade} />
        <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <span className={styles.eyebrow}>CARE THAT PUTS YOU FIRST</span>
          <h1>Appointments and care details, <em>together.</em></h1>
          <p>Request a visit with a doctor, choose in-person, phone, or video care, then follow appointment updates and keep your care information close at hand.</p>
          <div className={styles.heroActions}><Link to="/register?role=patient" className={styles.primaryButton}>Create a patient account <FiArrowRight /></Link><a href="#services" className={styles.textButton}>Explore the care portal <FiChevronRight /></a></div>
          <div className={styles.heroNote}><FiShield /> Sign in to see appointments, prescriptions, documents, and messages.</div>
        </motion.div>
        <div className={styles.heroCard}><div className={styles.cardIcon}><FiCalendar /></div><div><strong>Choose how to meet</strong><span>In person · phone · video</span></div><Link to="/register?role=patient" aria-label="Create a patient account"><FiArrowRight /></Link></div>
      </section>

      <section className={styles.quickInfo} aria-label="Canon Care portal features">
        <div className={styles.quickItem}><span className={styles.quickIcon}><FiCalendar /></span><div><small>APPOINTMENTS</small><strong>Choose a doctor and time</strong></div></div>
        <div className={styles.quickItem}><span className={styles.quickIcon}><FiVideo /></span><div><small>APPOINTMENT TYPES</small><strong>In person, phone, or video</strong></div></div>
        <div className={styles.quickItem}><span className={styles.quickIcon}><FiHeart /></span><div><small>PATIENT DASHBOARD</small><strong>Appointments and care details</strong></div></div>
        <div className={styles.quickAction}><a href="#how-it-works">See how it works <FiArrowRight /></a></div>
      </section>

      <section className={styles.section} id="services">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>WHAT YOU CAN DO WITH CANON CARE</span><h2>From appointment request to follow-up.</h2><p>Canon Care brings the practical steps of managing care into one account. Here is what the platform currently supports.</p></div>
        <div className={styles.serviceGrid}>{SERVICES.map((service, index) => <motion.article className={styles.serviceCard} key={service.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.07 }}><span className={styles.serviceIcon}>{service.icon}</span><h3>{service.title}</h3><p>{service.text}</p><Link to="/register?role=patient">Get started <FiArrowRight /></Link></motion.article>)}</div>
      </section>

      <section className={`${styles.section} ${styles.workflow}`} id="how-it-works">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>A CLEARER WAY TO MANAGE A VISIT</span><h2>Know what happens after you book.</h2><p>The portal keeps the steps visible so patients and clinicians can act on the same appointment record.</p></div>
        <div className={styles.workflowGrid}>
          <article><span>01</span><h3>Choose a doctor and visit time</h3><p>In your patient account, select a doctor, enter a date and time, and choose in-person, phone, or video as the appointment type.</p></article>
          <article><span>02</span><h3>Track the appointment</h3><p>Review requests and status updates from My Appointments. The clinician workspace includes a queue for reviewing and managing appointments.</p></article>
          <article><span>03</span><h3>Continue the conversation</h3><p>Use the portal’s messages and video call features to stay connected, and return to prescriptions and documents from your dashboard.</p></article>
        </div>
      </section>

      <section className={styles.portalSection} id="about">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>TWO WORKSPACES, ONE CARE JOURNEY</span><h2>Patients see their care. Clinicians manage the next step.</h2><p>These screenshots are from Canon Care’s current dashboards, showing the information each role uses day to day.</p></div>
        <div className={styles.portalGrid}>
          <article className={styles.portalCard}><div className={styles.portalCopy}><span className={styles.portalLabel}>PATIENT PORTAL</span><h3>Your appointments and care details at a glance.</h3><p>Review upcoming appointments, prescriptions, visit history, and the doctors connected to your care.</p></div><div className={styles.portalImage}><img src={patientDashboard} alt="Canon Care patient dashboard showing appointment, visit, prescription, and doctor summaries" loading="lazy" /></div></article>
          <article className={styles.portalCard}><div className={styles.portalCopy}><span className={styles.portalLabel}>DOCTOR WORKSPACE</span><h3>A working view of the day’s patient care.</h3><p>Review appointment activity, upcoming patient visits, and recent care activity from the clinician dashboard.</p></div><div className={styles.portalImage}><img src={doctorDashboard} alt="Canon Care doctor dashboard showing appointment statistics, activity charts, and recent appointments" loading="lazy" /></div></article>
        </div>
      </section>

      <section className={styles.emergency}><div className={styles.emergencyIcon}><FiShield /></div><div><span>FOR YOUR SAFETY</span><h2>Need urgent or emergency care?</h2><p>Canon Care’s online portal supports appointment and care communication workflows. For an immediate emergency, contact your local emergency service.</p></div><Link to="/login" className={styles.lightButton}>Open patient portal <FiArrowRight /></Link></section>

      <section className={styles.contactSection} id="contact"><div><span className={styles.eyebrow}>GET STARTED</span><h2>Your care account starts with a sign in.</h2><p>Patients can create an account to request appointments and manage care details. Clinicians can sign in to their workspace.</p></div><div className={styles.contactCards}><Link to="/register?role=patient"><FiCalendar /><span><small>NEW TO CANON CARE?</small><strong>Create a patient account</strong></span><FiArrowRight /></Link><Link to="/login"><FiUsers /><span><small>ALREADY HAVE AN ACCOUNT?</small><strong>Sign in to your workspace</strong></span><FiArrowRight /></Link></div></section>
    </main>

    <footer className={styles.footer}><div className={styles.footerMain}>
      <div className={styles.footerBrand}><Link to="/" className={styles.logo}><span className={styles.logoMark}><GiMedicalPack /></span><span><strong>Canon Care</strong><small>HEALTH &amp; WELLNESS</small></span></Link><p>Appointments, messages, prescriptions, and care documents in one connected portal.</p></div>
      <div className={styles.footerColumn}><h2>Explore</h2><div className={styles.footerLinks}><a href="#services">What you can do</a><a href="#how-it-works">How appointments work</a><a href="#about">Your dashboards</a></div></div>
      <div className={styles.footerColumn}><h2>Patient support</h2><div className={styles.footerLinks}><Link to="/login">Sign in</Link><Link to="/register?role=patient">Create a patient account</Link></div></div>
    </div><div className={styles.footerBottom}><span>© {new Date().getFullYear()} Canon Care. All rights reserved.</span><span>For emergencies, contact your local emergency services.</span></div></footer>
  </div>;
};

export default LandingPage;
