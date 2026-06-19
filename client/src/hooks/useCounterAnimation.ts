import { useState, useEffect, useRef } from 'react';

export function useCounterAnimation(targetValue: number, durationMs = 800): number {
  const [displayed, setDisplayed] = useState(targetValue);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (displayed === targetValue) return;

    const startValue = displayed;
    const delta = targetValue - startValue;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      setDisplayed(Math.round(startValue + delta * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetValue, durationMs, displayed]);

  return displayed;
}