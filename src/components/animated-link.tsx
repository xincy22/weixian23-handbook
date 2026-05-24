'use client';

import Link from 'fumadocs-core/link';
import { useState, type ComponentProps } from 'react';

/**
 * 文档正文链接：hover 时轻微放大 + 颜色变深
 *
 * 用 inline style 实现，避开 Fumadocs typography 的 .prose a 优先级问题。
 */

export function AnimatedLink({
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ComponentProps<typeof Link>) {
  const [hover, setHover] = useState(false);

  // 标题锚点链接保持原样
  if ('data-card' in props) {
    return <Link {...props} style={style} />;
  }

  return (
    <Link
      {...props}
      onMouseEnter={(e) => {
        setHover(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHover(false);
        onMouseLeave?.(e);
      }}
      style={{
        display: 'inline-block',
        color: hover ? 'var(--color-fd-primary)' : undefined,
        transform: hover ? 'scale(1.02)' : 'scale(1)',
        transformOrigin: 'center',
        transition: 'transform 0.2s ease, color 0.2s ease',
        willChange: 'transform',
        ...style,
      }}
    />
  );
}
