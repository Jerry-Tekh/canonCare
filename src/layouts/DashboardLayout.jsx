import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import styles from './DashboardLayout.module.css';
import {
  FiGrid, FiCalendar, FiUsers, FiMessageSquare, FiVideo, FiFileText,
  FiSettings, FiBell, FiLogOut, FiMenu, FiActivity, FiShield,
  FiUser, FiClipboard, FiBarChart2, FiChevronLeft, FiChevronRight,
  FiAlertCircle,
} from 'react-icons/fi';
import { GiMedicalPack } from 'react-icons/gi';

const navConfig = {
  admin: [
    { section: 'Overview', items: [
      { label: 'Dashboard',   icon: <FiGrid />,      path: '/admin' },
      { label: 'Analytics',   icon: <FiBarChart2 />, path: '/admin/analytics' },
    ]},
    { section: 'Management', items: [
      { label: 'Users',       icon: <FiUsers />,     path: '/admin/users' },
      { label: 'Appointments',icon: <FiCalendar />,  path: '/admin/appointments' },
      { label: 'Audit Logs',  icon: <FiShield />,    path: '/admin/audit-logs' },
    ]},
    { section: 'System', items: [
      { label: 'Notifications',icon: <FiBell />,     path: '/admin/notifications', badge: 'unread' },
      { label: 'Security',    icon: <FiShield />,    path: '/admin/security' },
      { label: 'Settings',    icon: <FiSettings />,  path: '/admin/settings' },
    ]},
  ],
  doctor: [
    { section: 'Overview', items: [
      { label: 'Dashboard',   icon: <FiGrid />,      path: '/doctor' },
      { label: 'Activity',    icon: <FiActivity />,  path: '/doctor/activity' },
    ]},
    { section: 'Patient Care', items: [
      { label: 'Appointments',icon: <FiCalendar />,  path: '/doctor/appointments' },
      { label: 'Patients',    icon: <FiUsers />,     path: '/doctor/patients' },
      { label: 'Prescriptions',icon: <FiClipboard />,path: '/doctor/prescriptions' },
    ]},
    { section: 'Communication', items: [
      { label: 'Messages',    icon: <FiMessageSquare />, path: '/doctor/messages', badge: 'unread' },
      { label: 'Video Calls', icon: <FiVideo />,     path: '/doctor/video' },
    ]},
    { section: 'Account', items: [
      { label: 'Notifications',icon: <FiBell />,     path: '/doctor/notifications', badge: 'unread' },
      { label: 'Security',    icon: <FiShield />,    path: '/doctor/security' },
      { label: 'Settings',    icon: <FiSettings />,  path: '/doctor/settings' },
    ]},
  ],
  patient: [
    { section: 'Overview', items: [
      { label: 'Dashboard',   icon: <FiGrid />,      path: '/patient' },
      { label: 'Health',      icon: <FiActivity />,  path: '/patient/health' },
    ]},
    { section: 'Appointments', items: [
      { label: 'Book',        icon: <FiCalendar />,  path: '/patient/book' },
      { label: 'My Appointments',icon: <FiCalendar />,path: '/patient/appointments' },
    ]},
    { section: 'Medical', items: [
      { label: 'Prescriptions',icon: <FiFileText />, path: '/patient/prescriptions' },
      { label: 'Documents',   icon: <FiClipboard />, path: '/patient/documents' },
    ]},
    { section: 'Communication', items: [
      { label: 'Messages',    icon: <FiMessageSquare />, path: '/patient/messages', badge: 'unread' },
      { label: 'Video Calls', icon: <FiVideo />,     path: '/patient/video' },
    ]},
    { section: 'Account', items: [
      { label: 'Notifications',icon: <FiBell />,     path: '/patient/notifications', badge: 'unread' },
      { label: 'Profile',     icon: <FiUser />,      path: '/patient/profile' },
      { label: 'Security',    icon: <FiShield />,    path: '/patient/security' },
      { label: 'Settings',    icon: <FiSettings />,  path: '/patient/settings' },
    ]},
  ],
};

const pageTitle = {
  '/admin': 'Dashboard', '/admin/analytics': 'Analytics', '/admin/users': 'User Management',
  '/admin/appointments': 'All Appointments', '/admin/audit-logs': 'Audit Logs',
  '/admin/notifications': 'Notifications', '/admin/settings': 'Settings',
  '/doctor': 'Dashboard', '/doctor/activity': 'Activity',
  '/doctor/appointments': 'Appointments', '/doctor/patients': 'My Patients',
  '/doctor/prescriptions': 'Prescriptions', '/doctor/messages': 'Messages',
  '/doctor/video': 'Video Calls', '/doctor/notifications': 'Notifications', '/doctor/settings': 'Settings',
  '/patient': 'Dashboard', '/patient/health': 'Health Overview',
  '/patient/book': 'Book Appointment', '/patient/appointments': 'My Appointments',
  '/patient/prescriptions': 'Prescriptions', '/patient/documents': 'Medical Documents',
  '/patient/messages': 'Messages', '/patient/video': 'Video Calls',
  '/patient/notifications': 'Notifications', '/patient/profile': 'Profile', '/patient/security': 'Security', '/patient/settings': 'Settings',
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications() || { unreadCount: 0 };
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = navConfig[user?.role] || [];
  const title = pageTitle[location.pathname] || '';

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button type="button" className={styles.overlay} aria-label="Close navigation menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        aria-label="Dashboard navigation"
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
        initial={false}
        animate={{ width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {/* Logo */}
        <Link to={`/${user?.role}`} className={styles.sidebarLogo} aria-label="Canon Care dashboard">
          <div className={styles.logoIcon}><GiMedicalPack style={{ color: '#fff', fontSize: '1.25rem' }} /></div>
          {!collapsed && (
            <div>
              <div className={styles.logoText}>Canon Care</div>
              <div className={styles.logoSub}>HMS Platform</div>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Main">
          {navItems.map(section => (
            <div className={styles.navSection} key={section.section}>
              {!collapsed && <div className={styles.navSectionTitle}>{section.section}</div>}
              {section.items.map(item => (
                <NavLink key={item.path} to={item.path} end={item.path.split('/').length <= 2}
                  className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  {!collapsed && item.badge === 'unread' && unreadCount > 0 && (
                    <span className={styles.navBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button className={styles.collapseBtn} type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(c => !c)}>
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>

        {/* User footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              {user?.avatar_url ? <img src={user.avatar_url} alt={user.name} /> : initials}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.userName + ' truncate'}>{user?.name}</div>
                <div className={styles.userRole}>{user?.role}</div>
              </div>
            )}
            <button type="button" className={styles.logoutBtn} onClick={handleLogout} aria-label="Sign out" title="Sign out">
              <FiLogOut />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className={`${styles.main} ${collapsed ? styles.collapsed : ''}`}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button className={styles.topbarBtn} type="button" onClick={() => setMobileOpen(o => !o)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>
            <FiMenu />
          </button>
          {title && <h1 className={styles.topbarTitle}>{title}</h1>}
          <div className={styles.topbarRight}>
            <button className={styles.topbarBtn} type="button" onClick={() => navigate(`/${user?.role}/notifications`)} aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}>
              <FiBell />
              {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            <button className={styles.topbarBtn} type="button" onClick={() => navigate(`/${user?.role}/settings`)} aria-label="Settings">
              <FiSettings />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
