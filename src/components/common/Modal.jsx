import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import styles from './Modal.module.css';

const Modal = ({ open, onClose, title, children, size = 'md', footer }) => (
  <AnimatePresence>
    {open && (
      <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose?.()}>
        <motion.div className={`${styles.modal} ${styles[size]}`}
          initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
          {(title || onClose) && (
            <div className={styles.header}>
              {title && <span className={styles.title}>{title}</span>}
              {onClose && <button className={styles.close} onClick={onClose}><FiX /></button>}
            </div>
          )}
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Modal;
