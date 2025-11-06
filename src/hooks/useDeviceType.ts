import { useState, useEffect } from 'react';

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // 综合判断：屏幕宽度 + 触摸支持 + UserAgent
      const width = window.innerWidth;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

      // 宽度<768px 或 (有触摸且是移动设备UA)
      setIsMobile(width < 768 || (hasTouch && mobileUA));
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile };
}
