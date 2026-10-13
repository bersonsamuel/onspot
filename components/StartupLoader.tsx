/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';

export default function StartupLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div id="startup-loader" className="startup-loader">
      <div className="startup-logo-container">
        <img src="/assets/onspot-logo-transparent.png" alt="OnSpot Logo" className="startup-logo-img" loading="eager" />
        <div className="startup-glow"></div>
      </div>
    </div>
  );
}
