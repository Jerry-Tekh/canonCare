import React from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const typeColors = {
  appointment_booked:      '#dbeafe',
  appointment_accepted:    '#d1fae5',
  appointment_rejected:    '#fee2e2',
  appointment_rescheduled: '#ede9fe',
  appointment_completed:   '#dbeafe',
  new_message:             '#fef3c7',
  new_prescription:        '#d1fae5',
  emergency:               '#fee2e2',
  system_alert:            '#f1f5f9',
  default:                 '#f8f9fc',
};

const Notifications = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications() || {
    notifications: [], unreadCount: 0, markRead: () => {}, markAllRead: () => {},
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 680 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.25rem' }}>Notifications</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <FiCheckCircle /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<FiBell />} title="No notifications" message="You're all caught up! Notifications will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map((n, i) => (
            <motion.div key={n.id}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                padding: '1rem 1.25rem',
                background: n.is_read ? '#fff' : (typeColors[n.type] || typeColors.default),
                border: `1px solid ${n.is_read ? 'var(--border-color)' : 'rgba(0,0,0,0.07)'}`,
                borderRadius: 'var(--border-radius-lg)',
                cursor: n.is_read ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
              onClick={() => !n.is_read && markRead(n.id)}
              onMouseEnter={e => { if (!n.is_read) e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: n.is_read ? 'var(--bg-tertiary)' : 'rgba(255,255,255,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.125rem',
              }}>
                <FiBell color={n.is_read ? 'var(--text-muted)' : 'var(--color-primary-light)'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 'var(--text-sm)', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              {!n.is_read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary-light)', flexShrink: 0, marginTop: '0.375rem' }} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
