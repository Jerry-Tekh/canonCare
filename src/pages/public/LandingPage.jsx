import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiCalendar, FiChevronRight, FiMenu,
  FiMessageCircle, FiShield, FiUsers, FiX,
} from 'react-icons/fi';
import { GiMedicalPack } from 'react-icons/gi';
import patientDashboard from '../../assets/Dashboard/PatientDashboard.png';
import doctorDashboard from '../../assets/Dashboard/docDashboard.png';
import styles from './LandingPage.module.css';

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
      <span>Canon Care patient and clinician portal</span>
      <Link to="/login">Patient sign in <FiArrowRight /></Link>
    </div></div>
    <header className={styles.nav}><div className={styles.navInner}>
      <Link to="/" className={styles.logo} aria-label="Canon Care home">
        <span className={styles.logoMark}><GiMedicalPack /></span>
        <span><strong>Canon Care</strong><small>HEALTH &amp; WELLNESS</small></span>
      </Link>
      <nav id="primary-navigation" className={`${styles.navLinks} ${mobileNavOpen ? styles.navLinksOpen : ''}`} aria-label="Main navigation">
        <a href="#home" onClick={closeMobileNav}>Home</a>
        <a href="#appointments" onClick={closeMobileNav}>Appointments</a>
        <a href="#portal" onClick={closeMobileNav}>Patient portal</a>
        <a href="#contact" onClick={closeMobileNav}>Contact</a>
        <a href="#faq" onClick={closeMobileNav}>FAQ</a>
      </nav>
      <div className={styles.navActions}>
        <Link to="/login" className={styles.signIn}>Sign in</Link>
        <Link to="/register?role=patient" className={styles.navCta}>Request an appointment <FiChevronRight /></Link>
      </div>
      <button type="button" className={styles.mobileMenu} aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileNavOpen} aria-controls="primary-navigation" onClick={() => setMobileNavOpen(open => !open)}>
        {mobileNavOpen ? <FiX /> : <FiMenu />}
      </button>
    </div></header>

    <main>
      <section className={styles.hero} id="home">
        <div className={styles.heroImage} role="img" aria-label="Healthcare professional in a clinical setting" />
        <div className={styles.heroShade} />
        <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span className={styles.eyebrow}>APPOINTMENT OPTIONS</span>
          <h1>Request a visit with a doctor.</h1>
          <p>Choose a doctor, date, time, and visit type. Then check your request status and care messages in your patient account.</p>
          <div className={styles.heroActions}>
            <Link to="/register?role=patient" className={styles.primaryButton}>Create a patient account <FiArrowRight /></Link>
            <a href="#appointments" className={styles.textButton}>How appointments work <FiChevronRight /></a>
          </div>
          <div className={styles.visitTypes}><span>In person</span><span>Phone</span><span>Video</span></div>
        </motion.div>
      </section>

      <section className={styles.appointmentSection} id="appointments">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>APPOINTMENTS</span>
          <h2>From request to response.</h2>
          <p>Here is how appointment requests move through Canon Care today.</p>
        </div>
        <ol className={styles.appointmentSteps}>
          <li><span className={styles.stepNumber}>01</span><div><h3>Choose a doctor</h3><p>After creating an account, open Book to view doctors marked available in the appointment directory.</p></div></li>
          <li><span className={styles.stepNumber}>02</span><div><h3>Send your request</h3><p>Select a date and time, choose in-person, phone, or video, and submit the appointment request.</p></div></li>
          <li><span className={styles.stepNumber}>03</span><div><h3>Check the status</h3><p>Return to My Appointments for updates. Sign in to message your doctor about non-urgent care.</p></div></li>
        </ol>
        <Link to="/register?role=patient" className={styles.inlineLink}>Start an appointment request <FiArrowRight /></Link>
      </section>

      <section className={styles.portalSection} id="portal">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>THE CANON CARE PORTAL</span>
          <h2>Tools for patients and clinicians.</h2>
          <p>These screenshots show the current patient and doctor dashboards.</p>
        </div>
        <div className={styles.portalGrid}>
          <figure className={styles.portalCard}>
            <figcaption className={styles.portalCopy}><span className={styles.portalLabel}>PATIENT VIEW</span><strong>Appointments, prescriptions, and care documents.</strong></figcaption>
            <div className={styles.portalImage}><img src={patientDashboard} alt="Patient dashboard with appointment, visit, prescription, and doctor summaries" loading="lazy" /></div>
          </figure>
          <figure className={styles.portalCard}>
            <figcaption className={styles.portalCopy}><span className={styles.portalLabel}>CLINICIAN VIEW</span><strong>Appointment activity and patient care overview.</strong></figcaption>
            <div className={styles.portalImage}><img src={doctorDashboard} alt="Doctor dashboard with appointment statistics, activity charts, and recent appointments" loading="lazy" /></div>
          </figure>
        </div>
      </section>

      <aside className={styles.emergency} aria-label="Emergency information">
        <FiShield aria-hidden="true" />
        <p><strong>For emergencies, don’t use appointment booking or portal messages.</strong> Contact your local emergency service for immediate help.</p>
      </aside>

      <section className={styles.contactSection} id="contact">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>CONTACT</span>
          <h2>Send a general enquiry.</h2>
          <p>For appointment requests or non-urgent medical questions, sign in to the patient portal.</p>
        </div>
        <div className={styles.contactLayout}>
          <aside className={styles.contactDetails}>
            <h3>Other ways to reach us</h3>
            <a className={styles.contactEmail} href={`mailto:${CONTACT_EMAIL}`}><FiMessageCircle /><span><small>GENERAL ENQUIRIES</small><strong>{CONTACT_EMAIL}</strong></span><FiArrowRight /></a>
            <Link className={styles.contactPortal} to="/register?role=patient"><FiCalendar /><span><small>NEW PATIENT</small><strong>Request an appointment</strong></span><FiArrowRight /></Link>
            <Link className={styles.contactPortal} to="/login"><FiUsers /><span><small>EXISTING PATIENT</small><strong>Sign in to message your doctor</strong></span><FiArrowRight /></Link>
            <p className={styles.contactNote}>Clinic phone, address, and office hours are not listed in the portal. Confirm in-person visit details with your care team before travelling.</p>
          </aside>
          <form className={styles.contactForm} onSubmit={handleContactSubmit}>
            <h3>Write to Canon Care</h3>
            <p>Continue to your email app to send this enquiry.</p>
            <div className={styles.formRow}>
              <label>Your name<input name="name" autoComplete="name" required /></label>
              <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
            </div>
            <label>Enquiry type<select name="topic" defaultValue="General question"><option>General question</option><option>Appointment booking</option><option>Patient account</option><option>Website feedback</option></select></label>
            <label>Subject<input name="subject" required maxLength="120" /></label>
            <label>Message<textarea name="message" rows="5" required maxLength="2000" /></label>
            <p className={styles.formPrivacy}>Do not include passwords, payment details, or private medical information. This message is not submitted or stored by Canon Care.</p>
            <button type="submit" className={styles.primaryButton}>Continue to email <FiArrowRight /></button>
          </form>
        </div>
      </section>

      <section className={styles.faqSection} id="faq">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>PATIENT QUESTIONS</span>
          <h2>Before you request a visit.</h2>
        </div>
        <div className={styles.faqLayout}>
          <div className={styles.faqAside}><p>Answers about appointment requests, portal messages, and what to do if you need immediate help.</p><Link to="/login">Patient sign in <FiArrowRight /></Link></div>
          <div className={styles.faqList}>
            <details><summary>Do I need an account to request an appointment?</summary><p>Yes. Create a patient account, then open Book to see the doctors available for appointment requests.</p></details>
            <details><summary>Does submitting a request mean it is confirmed?</summary><p>Check My Appointments for the current status. The doctor’s dashboard is used to review and manage requests.</p></details>
            <details><summary>Which visit types can I request?</summary><p>The appointment form offers in-person, phone, and video visit types. Confirm arrival or joining instructions with your care team.</p></details>
            <details><summary>Where can I find the clinic address and hours?</summary><p>Those details are not listed in the portal. Confirm the location and arrival information with your care team before travelling.</p></details>
            <details><summary>What if I can’t sign in?</summary><p>Use “Forgot password” on the sign-in page and check that you entered the email address associated with your account.</p></details>
          </div>
        </div>
      </section>
    </main>

    <footer className={styles.footer}><div className={styles.footerMain}>
      <div className={styles.footerBrand}><Link to="/" className={styles.logo}><span className={styles.logoMark}><GiMedicalPack /></span><span><strong>Canon Care</strong><small>HEALTH &amp; WELLNESS</small></span></Link><p>Patient appointments and clinician tools from one care portal.</p></div>
      <div className={styles.footerColumn}><h2>Patient resources</h2><div className={styles.footerLinks}><a href="#appointments">Appointments</a><a href="#portal">Patient portal</a><a href="#faq">Common questions</a></div></div>
      <div className={styles.footerColumn}><h2>Account</h2><div className={styles.footerLinks}><Link to="/login">Sign in</Link><Link to="/register?role=patient">Create patient account</Link><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div></div>
    </div><div className={styles.footerBottom}><span>© {new Date().getFullYear()} Canon Care. All rights reserved.</span><span>For emergencies, contact your local emergency service.</span></div></footer>
  </div>;
};

export default LandingPage;
