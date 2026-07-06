import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export const Input = forwardRef(({ label, icon, error, hint, required, className = '', ...props }, ref) => (
  <div className={styles.group}>
    {label && <label className={styles.label}>{label}{required && <span className={styles.required}>*</span>}</label>}
    <div className={styles.wrapper}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input ref={ref} className={`${styles.input} ${icon ? styles.hasIcon : ''} ${error ? styles.error : ''} ${className}`} {...props} />
    </div>
    {error && <span className={styles.errorMsg}>{error}</span>}
    {hint && !error && <span className={styles.hint}>{hint}</span>}
  </div>
));

export const Select = forwardRef(({ label, error, required, children, className = '', ...props }, ref) => (
  <div className={styles.group}>
    {label && <label className={styles.label}>{label}{required && <span className={styles.required}>*</span>}</label>}
    <select ref={ref} className={`${styles.input} ${styles.select} ${error ? styles.error : ''} ${className}`} {...props}>
      {children}
    </select>
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
));

export const Textarea = forwardRef(({ label, error, hint, required, rows = 4, className = '', ...props }, ref) => (
  <div className={styles.group}>
    {label && <label className={styles.label}>{label}{required && <span className={styles.required}>*</span>}</label>}
    <textarea ref={ref} rows={rows} className={`${styles.input} ${error ? styles.error : ''} ${className}`} {...props} />
    {error && <span className={styles.errorMsg}>{error}</span>}
    {hint && !error && <span className={styles.hint}>{hint}</span>}
  </div>
));

export default Input;
