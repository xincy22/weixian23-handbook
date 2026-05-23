'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Giscus comments embed for "discussion-style" pages (e.g. /docs/inbox).
 *
 * - Uses GitHub Discussions of `xincy22/weixian23-handbook` (category: Inbox).
 * - Mapping = `pathname`, so each docs page gets its own discussion thread
 *   when this component is enabled there.
 * - Theme follows the site's light/dark preference.
 *
 * To enable comments on a docs page, drop `<Comments />` in the .mdx file
 * (after MDX components are wired up via `getMDXComponents`).
 */
export function Comments() {
  const { resolvedTheme } = useTheme();
  // Avoid theme flash before next-themes hydrates.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // `preferred_color_scheme` is a safe pre-hydration default; we'll switch
  // to an explicit theme once we know the resolved one.
  const giscusTheme = !mounted
    ? 'preferred_color_scheme'
    : resolvedTheme === 'dark'
      ? 'dark'
      : 'light';

  return (
    <div className="mt-12 pt-8 border-t">
      <Giscus
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
