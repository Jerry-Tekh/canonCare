import React from 'react';
import styles from './LoadingSpinner.module.css';

// Kept under its existing export name so current route and data-loading flows
// continue to work while showing a content-shaped placeholder instead.
const LoadingSpinner = ({ fullScreen }) => {
  const skeleton = (
    <div className={styles.skeleton} role="status" aria-label="Loading">
      <span className={styles.srOnly}>Loading</span>
      <div className={styles.heading}>
        <i className={styles.eyebrow} />
        <i className={styles.title} />
        <i className={styles.subtitle} />
      </div>
      <div className={styles.metrics}>
        {[0, 1, 2, 3].map((item) => (
          <div className={styles.metric} key={item}>
            <i className={styles.icon} />
            <span><i className={styles.value} /><i className={styles.label} /></span>
          </div>
        ))}
      </div>
      <div className={styles.panels}>
        {[0, 1].map((item) => (
          <div className={styles.panel} key={item}>
            <i className={styles.panelTitle} />
            <i className={styles.panelLine} />
            <i className={styles.chart} />
          </div>
        ))}
      </div>
    </div>
  );

  if (fullScreen) return <div className={styles.fullScreen}>{skeleton}</div>;
  return skeleton;
};

export default LoadingSpinner;
