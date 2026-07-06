import React from 'react';
import styles from './Button.module.css';

const Button = ({
  children, variant = 'primary', size, fullWidth, rounded, loading, disabled,
  onClick, type = 'button', className = '', ...props
}) => {
  const cls = [
    styles.btn,
    styles[variant],
    size && styles[size],
    fullWidth && styles.fullWidth,
    rounded && styles.rounded,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} disabled={disabled || loading} onClick={onClick} {...props}>
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
};

export default Button;
