'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Giscus comments embed.
 *
 * Globally rendered at the bottom of every docs page (see the docs
 * page renderer). One discussion thread per pathname.
 *
 * Theme is synced with the site's light/dark preference. Re-mounts
 * on pathname change to ensure the iframe re-loads the right thread
 * during client-side navigation.
 */
export function Comments() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  // Avoid theme flash before next-themes hydrates.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const giscusTheme = !mounted
    ? 'preferred_color_scheme'
    : resolvedTheme === 'dark'
      ? 'dark'
      : 'light';

  return (
    <div className="mt-12 pt-8 border-t">
      <Giscus
        key={pathname}
        id="comments"
        repo="xincy22/weixian23-handbook"
        repoId="R_kgDOSknbpg"
        category="Inbox"
        categoryId="DIC_kwDOSknbps4C9quy"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme={giscusTheme}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
