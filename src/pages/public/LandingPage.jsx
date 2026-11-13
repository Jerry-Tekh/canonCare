import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiActivity, FiArrowRight, FiCalendar, FiChevronRight, FiHeart,
  FiMenu, FiShield, FiUsers, FiVideo, FiX, FiMessageCircle,
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
const CONTACT_EMAIL = 'contact@canoncare.com';

const LandingPage = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = () => setMobileNavOpen(false);
  const handleContactSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const subject = formData.get('subject') || 'Canon Care enquiry';
    const body = [
      `Name: ${formData.get('name')}`,
      `Reply email: ${formData.get('email')}`,
      `Topic: ${formData.get('topic')}`,
      '',
      formData.get('message'),
    ].join('\n');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return <div className={styles.page}>
    <div className={styles.topbar}><div className={styles.topbarInner}>
      <span><FiShield /> Your care, organized in one secure account</span>
      <Link to="/login"><FiUsers /> Already a patient? Sign in</Link>
    </div></div>
    <header className={styles.nav}><div className={styles.navInner}>
      <Link to="/" className={styles.logo} aria-label="Canon Care home"><span className={styles.logoMark}><GiMedicalPack /></span><span><strong>Canon Care</strong><small>HEALTH &amp; WELLNESS</small></span></Link>
      <nav id="primary-navigation" className={`${styles.navLinks} ${mobileNavOpen ? styles.navLinksOpen : ''}`} aria-label="Main navigation">
        <a href="#home" onClick={closeMobileNav}>Home</a><a href="#services" onClick={closeMobileNav}>What you can do</a><a href="#about" onClick={closeMobileNav}>Your dashboards</a><a href="#faq" onClick={closeMobileNav}>FAQ</a><a href="#contact" onClick={closeMobileNav}>Contact</a>
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
          <p>From finding a doctor to following up after a visit, Canon Care keeps your appointments and care details together.</p>
          <div className={styles.heroActions}><Link to="/register?role=patient" className={styles.primaryButton}>Create a patient account <FiArrowRight /></Link><a href="#services" className={styles.textButton}>Explore the care portal <FiChevronRight /></a></div>
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

      <section className={styles.contactSection} id="contact">
        <div className={styles.contactHeading}><span className={styles.eyebrow}>CONTACT &amp; NEXT STEPS</span><h2>How can we help you?</h2><p>Send a general question to Canon Care or sign in to discuss non-urgent care with your doctor.</p></div>
        <div className={styles.contactLayout}>
          <aside className={styles.contactDetails}>
            <h3>Contact Canon Care</h3>
            <p>For general questions about the portal, email our contact address. Appointment requests are handled through your patient account.</p>
            <a className={styles.contactEmail} href={`mailto:${CONTACT_EMAIL}`}><FiMessageCircle /><span><small>GENERAL ENQUIRIES</small><strong>{CONTACT_EMAIL}</strong></span><FiArrowRight /></a>
            <Link className={styles.contactPortal} to="/register?role=patient"><FiCalendar /><span><small>APPOINTMENTS</small><strong>Request a visit online</strong></span><FiArrowRight /></Link>
            <Link className={styles.contactPortal} to="/login"><FiUsers /><span><small>EXISTING PATIENT</small><strong>Sign in to message your doctor</strong></span><FiArrowRight /></Link>
            <p className={styles.contactNote}>Clinic phone, address, and office hours are not listed in the portal. Confirm in-person visit details with your care team. For emergencies, contact your local emergency service.</p>
          </aside>
          <form className={styles.contactForm} onSubmit={handleContactSubmit}>
            <h3>Send us a message</h3>
            <p>Your email app will open with your message addressed to Canon Care.</p>
            <div className={styles.formRow}><label>Your name<input name="name" autoComplete="name" required /></label><label>Email address<input name="email" type="email" autoComplete="email" required /></label></div>
            <label>What is this about?<select name="topic" defaultValue="General question"><option>General question</option><option>Appointment booking</option><option>Patient account</option><option>Website feedback</option></select></label>
            <label>Subject<input name="subject" required maxLength="120" /></label>
            <label>Message<textarea name="message" rows="5" required maxLength="2000" /></label>
            <p className={styles.formPrivacy}>Please don’t include passwords, payment details, or private medical information. This form opens your email app and does not submit or store messages in Canon Care.</p>
            <button type="submit" className={styles.primaryButton}>Continue to email <FiArrowRight /></button>
          </form>
        </div>
      </section>

      <section className={styles.faqSection} id="faq">
        <div className={styles.sectionHeading}><span className={styles.eyebrow}>PATIENT FAQ</span><h2>Questions before your first visit?</h2><p>Quick answers about appointments and using the Canon Care portal.</p></div>
        <div className={styles.faqList}>
          <details><summary>How do I request an appointment?</summary><p>Create a patient account, open Book, choose an available doctor, and enter your preferred date, time, and appointment type. Your request will appear in My Appointments.</p></details>
          <details><summary>Which appointment types can I choose?</summary><p>The booking form offers in-person, phone, and video appointment types. Confirm any joining or arrival instructions with your care team.</p></details>
          <details><summary>Where can I check whether my appointment is confirmed?</summary><p>Sign in and open My Appointments to review your requests and their latest status.</p></details>
          <details><summary>Can I message my doctor through Canon Care?</summary><p>Yes. Sign in to your patient account and use Messages to continue a non-urgent conversation with your doctor.</p></details>
          <details><summary>What should I prepare for a video visit?</summary><p>Use a device with a working camera and microphone, a stable internet connection, and a private place where you can speak comfortably. Follow any instructions from your care team.</p></details>
          <details><summary>Can I use appointment booking for an emergency?</summary><p>No. Appointment requests and portal messages are for routine care and are not monitored as emergency channels. Contact your local emergency service for immediate help.</p></details>
          <details><summary>Where do I find the clinic address and opening hours?</summary><p>Those public details are not currently listed in Canon Care. Please confirm the location, arrival instructions, and hours with your care team before an in-person visit.</p></details>
          <details><summary>I can’t sign in. What can I do?</summary><p>Use “Forgot password” on the sign-in page to start account recovery. Check that you entered the email address associated with your account and look in your spam folder for the reset message.</p></details>
        </div>
      </section>
    </main>

    <footer className={styles.footer}><div className={styles.footerMain}>
      <div className={styles.footerBrand}><Link to="/" className={styles.logo}><span className={styles.logoMark}><GiMedicalPack /></span><span><strong>Canon Care</strong><small>HEALTH &amp; WELLNESS</small></span></Link><p>Appointments, messages, prescriptions, and care documents in one connected portal.</p></div>
      <div className={styles.footerColumn}><h2>Explore</h2><div className={styles.footerLinks}><a href="#services">What you can do</a><a href="#how-it-works">How appointments work</a><a href="#about">Your dashboards</a><a href="#faq">Patient FAQ</a></div></div>
      <div className={styles.footerColumn}><h2>Patient support</h2><div className={styles.footerLinks}><Link to="/login">Sign in</Link><Link to="/register?role=patient">Create a patient account</Link></div></div>
    </div><div className={styles.footerBottom}><span>© {new Date().getFullYear()} Canon Care. All rights reserved.</span><span>For emergencies, contact your local emergency services.</span></div></footer>
  </div>;
};

export default LandingPage;
