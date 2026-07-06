import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ icon, title = 'Nothing here', message, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1rem', textAlign: 'center' }}>
    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-muted)' }}>
      {icon || <FiInbox />}
    </div>
    <div>
      <p style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{title}</p>
      {message && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{message}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default EmptyState;
