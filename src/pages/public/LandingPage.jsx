import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiActivity, FiArrowRight, FiCalendar, FiChevronRight, FiClock,
  FiHeart, FiMapPin, FiMenu, FiPhone, FiShield, FiUsers, FiVideo,
} from 'react-icons/fi';
import { GiMedicalPack } from 'react-icons/gi';
import styles from './LandingPage.module.css';

const SERVICES = [
  { icon: <FiHeart />, title: 'Primary care', text: 'Everyday care, preventive checkups, and support for your long-term health.' },
  { icon: <FiActivity />, title: 'Specialist care', text: 'Connect with a doctor for focused care and a plan that fits your needs.' },
  { icon: <FiVideo />, title: 'Virtual consultations', text: 'Speak with your care team remotely through a secure video appointment.' },
  { icon: <FiShield />, title: 'Patient support', text: 'Keep appointments, care updates, and health information together in one place.' },
];

const LandingPage = () => (
  <div className={styles.page}>
    <div className={styles.topbar}>
      <div className={styles.topbarInner}>
        <span><FiClock /> Mon–Fri, 8:00 AM–5:00 PM</span>
        <a href="tel:+2348000000000"><FiPhone /> Need help? Call our care team</a>
      </div>
    </div>
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <Link to="/" className={styles.logo} aria-label="Canon Care home">
          <span className={styles.logoMark}><GiMedicalPack /></span>
          <span><strong>Canon Care</strong><small>HEALTH &amp; WELLNESS</small></span>
        </Link>
        <nav className={styles.navLinks} aria-label="Main navigation">
          <a href="#home">Home</a><a href="#services">Our services</a><a href="#about">About us</a><a href="#contact">Contact</a>
        </nav>
        <div className={styles.navActions}>
          <Link to="/login" className={styles.signIn}>Sign in</Link>
          <Link to="/register?role=patient" className={styles.navCta}>Book an appointment <FiChevronRight /></Link>
        </div>
        <a href="#services" className={styles.mobileMenu} aria-label="Go to services"><FiMenu /></a>
      </div>
    </header>

    <main>
      <section className={styles.hero} id="home">
        <div className={styles.heroImage} role="img" aria-label="Doctor ready to care for a patient" />
        <div className={styles.heroShade} />
        <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <span className={styles.eyebrow}><span /> HERE FOR YOUR HEALTH</span>
          <h1>Care that puts <em>you</em> first.</h1>
          <p>From your first appointment to ongoing care, our team is here to help you feel informed, supported, and cared for.</p>
          <div className={styles.heroActions}>
            <Link to="/register?role=patient" className={styles.primaryButton}>Make an appointment <FiArrowRight /></Link>
            <a href="#services" className={styles.textButton}>Explore our services <FiChevronRight /></a>
          </div>
          <div className={styles.heroNote}><FiShield /> Your care and health information are treated with care.</div>
        </motion.div>
        <div className={styles.heroCard}>
          <div className={styles.cardIcon}><FiCalendar /></div>
          <div><strong>Easy appointment booking</strong><span>Choose a time that works for you</span></div>
          <Link to="/register?role=patient" aria-label="Book an appointment"><FiArrowRight /></Link>
        </div>
      </section>

      <section className={styles.quickInfo} aria-label="Patient information">
        <div className={styles.quickItem}><span className={styles.quickIcon}><FiClock /></span><div><small>CLINIC HOURS</small><strong>Weekdays, 8 AM–5 PM</strong></div></div>
        <div className={styles.quickItem}><span className={styles.quickIcon}><FiPhone /></span><div><small>CARE TEAM</small><a href="tel:+2348000000000"><strong>Call for assistance</strong></a></div></div>
        <div className={styles.quickItem}><span className={styles.quickIcon}><FiMapPin /></span><div><small>VISIT CANON CARE</small><a href="#contact"><strong>Get in touch for directions</strong></a></div></div>
        <div className={styles.quickAction}><Link to="/register?role=patient">Request an appointment <FiArrowRight /></Link></div>
      </section>

      <section className={styles.section} id="services">
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>CARE FOR EVERY STAGE</span>
          <h2>Health services centered around you.</h2>
          <p>Find the support you need, with a care team focused on listening and helping you take the next step.</p>
        </div>
        <div className={styles.serviceGrid}>
          {SERVICES.map((service, index) => <motion.article className={styles.serviceCard} key={service.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.07 }}>
            <span className={styles.serviceIcon}>{service.icon}</span><h3>{service.title}</h3><p>{service.text}</p><Link to="/register?role=patient">Learn more <FiArrowRight /></Link>
          </motion.article>)}
        </div>
      </section>

      <section className={styles.careSection} id="about">
        <div className={styles.careVisual}><div className={styles.carePhoto} /><div className={styles.careBadge}><FiHeart /><span><strong>Care, with you</strong><small>At every step</small></span></div></div>
        <div className={styles.careCopy}><span className={styles.eyebrow}>A BETTER CARE EXPERIENCE</span><h2>Good care starts with a conversation.</h2><p>Healthcare can feel complicated. Canon Care helps you stay connected to your care team and keep the details of your health journey close at hand.</p>
          <ul><li><FiUsers /> Connect with your care team</li><li><FiCalendar /> Keep track of your appointments</li><li><FiShield /> Access your health information securely</li></ul>
          <Link to="/register?role=patient" className={styles.primaryButton}>Get started <FiArrowRight /></Link>
        </div>
      </section>

      <section className={styles.emergency}>
        <div className={styles.emergencyIcon}><FiPhone /></div><div><span>WE’RE HERE TO HELP</span><h2>Have a question about your care?</h2><p>Contact our team for appointment and service information.</p></div><a href="tel:+2348000000000" className={styles.lightButton}>Call the care team <FiArrowRight /></a>
      </section>

      <section className={styles.contactSection} id="contact">
        <div><span className={styles.eyebrow}>CONTACT CANON CARE</span><h2>Let’s help you find the care you need.</h2><p>Reach out to our team with questions about appointments, services, or getting started.</p></div>
        <div className={styles.contactCards}><a href="tel:+2348000000000"><FiPhone /><span><small>CALL US</small><strong>Speak with our care team</strong></span><FiArrowRight /></a><Link to="/login"><FiUsers /><span><small>ALREADY A PATIENT?</small><strong>Sign in to your patient account</strong></span><FiArrowRight /></Link></div>
      </section>
    </main>

    <footer className={styles.footer}>
      <div className={styles.footerMain}><Link to="/" className={styles.logo}><span className={styles.logoMark}><GiMedicalPack /></span><span><strong>Canon Care</strong><small>HEALTH &amp; WELLNESS</small></span></Link><p>Compassionate care, connected around you.</p><div className={styles.footerLinks}><a href="#services">Services</a><a href="#about">About</a><a href="#contact">Contact</a><Link to="/login">Patient sign in</Link></div><a href="tel:+2348000000000" className={styles.footerPhone}><FiPhone /> Contact our care team</a></div>
      <div className={styles.footerBottom}><span>© {new Date().getFullYear()} Canon Care. All rights reserved.</span><span>For emergencies, contact your local emergency services.</span></div>
    </footer>
  </div>
);

export default LandingPage;
