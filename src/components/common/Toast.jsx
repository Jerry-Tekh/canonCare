import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

const icons = { success: <FiCheckCircle />, error: <FiAlertCircle />, info: <FiInfo />, warning: <FiAlertCircle /> };
const colors = {
  success: { bg: '#d1fae5', border: '#059669', text: '#065f46' },
  error:   { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
  info:    { bg: '#dbeafe', border: '#2563eb', text: '#1e40af' },
  warning: { bg: '#fef3c7', border: '#d97706', text: '#92400e' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 360 }}>
        <AnimatePresence>
          {toasts.map(t => {
            const c = colors[t.type] || colors.info;
            return (
              <motion.div key={t.id} initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem 1rem', background: c.bg, border: `1px solid ${c.border}`, borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-lg)', color: c.text }}>
                <span style={{ fontSize: '1.125rem', flexShrink: 0, marginTop: '0.1rem' }}>{icons[t.type]}</span>
                <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 500, lineHeight: 1.5 }}>{t.message}</span>
                <button onClick={() => dismiss(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, fontSize: '1rem', flexShrink: 0, opacity: 0.7 }}><FiX /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastContext;
