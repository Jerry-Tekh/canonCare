import React from 'react';
import styles from './Card.module.css';

export const Card = ({ children, variant = '', hoverable, flat, className = '', ...props }) => {
  const cls = [
    styles.card,
    variant && styles[variant],
    hoverable && styles.hoverable,
    flat && styles.flat,
    className,
  ].filter(Boolean).join(' ');
  return <div className={cls} {...props}>{children}</div>;
};

export const CardHeader = ({ title, action, children, className = '' }) => (
  <div className={`${styles.header} ${className}`}>
    {title && <span className={styles.title}>{title}</span>}
    {children}
    {action && <div>{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`${styles.body} ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`${styles.footer} ${className}`}>{children}</div>
);

export const StatCard = ({ icon, value, label, change, changeType = 'up', color = '#e8edf5', iconColor = '#2563b0' }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: color }}>
      <span style={{ color: iconColor }}>{icon}</span>
    </div>
    <div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {change && <div className={`${styles.statChange} ${styles[changeType]}`}>{change}</div>}
    </div>
  </div>
);

export default Card;
