'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 数字动态滚动到目标值（进入视口时触发）
 */
export function StatCounter({
  target,
  duration = 1500,
  suffix = '',
  prefix = '',
}: {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !triggered.current) {
          triggered.current = true;
          const start = performance.now();
          let raf = 0;
          const animate = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.floor(target * eased));
            if (t < 1) raf = requestAnimationFrame(animate);
          };
          raf = requestAnimationFrame(animate);
          return () => cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
