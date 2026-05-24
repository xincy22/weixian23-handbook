import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * 文档站模块卡片：复刻首页 (home)/page.tsx 那种带渐变光晕的视觉
 *
 * 用在两类地方：
 *  1. 根 docs/index.mdx —— 模块入口（七大板块）
 *  2. 各模块 index.mdx —— 模块内子页面入口
 *
 * MDX 写法：
 *   import { Bot } from 'lucide-react';
 *
 *   <ModuleCards>
 *     <ModuleCard
 *       icon={<Bot />}
 *       title="..."
 *       description="..."
 *       href="..."
 *       accent="from-fuchsia-500 to-purple-600"
 *     />
 *   </ModuleCards>
 *
 * 不传 accent 时使用默认紫色渐变，不传 icon 时不显示图标块。
 */

const DEFAULT_ACCENT = 'from-fuchsia-500 to-purple-600';

export interface ModuleCardProps {
  title: string;
  description?: string;
  href: string;
  icon?: ReactNode;
  /** Tailwind 渐变类，例如 `from-fuchsia-500 to-purple-600` */
  accent?: string;
  /** 卡片右下角的 CTA 文字，默认"进入" */
  cta?: string;
}

export function ModuleCard({
  title,
  description,
  href,
  icon,
  accent = DEFAULT_ACCENT,
  cta = '进入',
}: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="group relative no-underline! overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:-translate-y-1 hover:border-fd-primary/40 hover:shadow-xl hover:shadow-fd-primary/10"
    >
      {/* 角落渐变光晕 */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-25',
          accent,
        )}
      />

      {icon ? (
        <div
          className={cn(
            'mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md [&>svg]:size-6',
            accent,
          )}
        >
          {icon}
        </div>
      ) : null}

      <h3 className="mb-2 text-lg font-semibold text-fd-foreground">{title}</h3>
      {description ? (
        <p className="text-sm text-fd-muted-foreground leading-relaxed">
          {description}
        </p>
      ) : null}

      <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary">
        {cta}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

/**
 * 卡片网格容器：响应式 1/2/3 列
 */
export function ModuleCards({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}
