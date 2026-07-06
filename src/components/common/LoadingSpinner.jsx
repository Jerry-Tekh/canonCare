import React from 'react';

const LoadingSpinner = ({ size = 40, color = '#2563b0', fullScreen }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <svg width={size} height={size} viewBox="0 0 50 50" style={{ animation: 'spin 0.8s linear infinite' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="25" cy="25" r="20" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray="80 30" />
      </svg>
    </div>
  );
  if (fullScreen) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.85)', zIndex: 9999 }}>
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default LoadingSpinner;
