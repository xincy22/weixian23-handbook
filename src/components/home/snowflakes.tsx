'use client';

import { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  symbol: string;
}

const SYMBOLS = ['❅', '❆', '❄', '✦', '✧', '⋆'];

export function Snowflakes({ count = 24 }: { count?: number }) {
  const [flakes, setFlakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const next = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 12 + 8,
      duration: Math.random() * 12 + 12,
      delay: Math.random() * 10,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    }));
    setFlakes(next);
  }, [count]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {flakes.map((f) => (
        <span
          key={f.id}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}px`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          {f.symbol}
        </span>
      ))}
    </div>
  );
}
