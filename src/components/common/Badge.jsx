import React from 'react';

const colors = {
  pending:     { bg: '#fef3c7', text: '#92400e' },
  accepted:    { bg: '#d1fae5', text: '#065f46' },
  rejected:    { bg: '#fee2e2', text: '#991b1b' },
  completed:   { bg: '#dbeafe', text: '#1e40af' },
  cancelled:   { bg: '#f3f4f6', text: '#374151' },
  rescheduled: { bg: '#ede9fe', text: '#5b21b6' },
  no_show:     { bg: '#fef9c3', text: '#854d0e' },
  available:   { bg: '#d1fae5', text: '#065f46' },
  busy:        { bg: '#fef3c7', text: '#92400e' },
  off_duty:    { bg: '#f3f4f6', text: '#374151' },
  on_leave:    { bg: '#ede9fe', text: '#5b21b6' },
  admin:       { bg: '#fee2e2', text: '#991b1b' },
  doctor:      { bg: '#dbeafe', text: '#1e40af' },
  patient:     { bg: '#d1fae5', text: '#065f46' },
  active:      { bg: '#d1fae5', text: '#065f46' },
  inactive:    { bg: '#fee2e2', text: '#991b1b' },
  default:     { bg: '#f1f5f9', text: '#475569' },
};

const Badge = ({ label, variant, style: extraStyle }) => {
  const c = colors[variant] || colors[label?.toLowerCase()] || colors.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.75rem', fontWeight: 600,
      background: c.bg, color: c.text,
      ...extraStyle,
    }}>
      {label}
    </span>
  );
};

export default Badge;
