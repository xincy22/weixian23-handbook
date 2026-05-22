import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Briefcase,
  Code2,
  Compass,
  Inbox,
  PenLine,
  Sparkles,
} from 'lucide-react';
import { ParticleBackground } from '@/components/home/particles';
import { Snowflakes } from '@/components/home/snowflakes';
import { StatCounter } from '@/components/home/stat-counter';
import { GitHubIcon } from '@/components/github-icon';
import {
  appDescription,
  appName,
  appShortName,
  gitConfig,
} from '@/lib/shared';

const modules = [
  {
    slug: 'ai-tools',
    title: 'AI 工具与 API',
    icon: Bot,
    description: 'AI 工具大全、API 配置、Prompt 模板，覆盖国内外主流模型与中转方案',
    accent: 'from-fuchsia-500 to-purple-600',
  },
  {
    slug: 'literature',
    title: '文献检索与论文阅读',
    icon: BookOpen,
    description: '检索入口、关键词构造、筛选标准、阅读模板和 Zotero 文献管理',
    accent: 'from-purple-500 to-indigo-600',
  },
  {
    slug: 'writing',
    title: '科研写作与排版',
    icon: PenLine,
    description: 'LaTeX、Word 公式、AI 学术绘图、AI 辅助写作的边界',
    accent: 'from-indigo-500 to-blue-600',
  },
  {
    slug: 'coding',
    title: '编程与数据分析工具',
    icon: Code2,
    description: 'Python、MATLAB、Git、Linux、CMake、CUDA 入门',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    slug: 'majors',
    title: '专业方向资源导航',
    icon: Compass,
    description: '集成电路、计算机、AI、生物医学、精密仪器、材料科学六大方向',
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    slug: 'career',
    title: '就业实习与行业认知',
    icon: Briefcase,
    description: '行业方向概览、实习信息入口、简历与面试准备',
    accent: 'from-purple-600 to-pink-500',
  },
];

const stats = [
  { label: '收录工具', value: 80, suffix: '+' },
  { label: '内容章节', value: 40, suffix: '+' },
  { label: 'Prompt 模板', value: 7, suffix: ' 大类' },
  { label: '专业方向', value: 6, suffix: '' },
];

export default function HomePage() {
  return (
    <main className="relative flex flex-col">
      {/* 雪花特效（全站背景） */}
      <Snowflakes count={20} />

      {/* Hero 区 */}
      <section className="relative isolate overflow-hidden">
        {/* 紫色光晕背景 */}
        <div
          aria-hidden
          className="bg-glow-purple pointer-events-none absolute inset-0 -z-10"
        />
        {/* 粒子背景（限制在 Hero 区域） */}
        <div className="pointer-events-auto absolute inset-0 -z-10">
          <ParticleBackground count={45} />
        </div>

        <div className="container mx-auto flex flex-col items-center px-6 pt-24 pb-32 text-center sm:pt-32 sm:pb-40">
          {/* 顶部小徽章 */}
          <div className="fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-fd-primary/30 bg-fd-card/60 px-4 py-1.5 text-sm text-fd-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-fd-primary" />
            <span>为先 23 班 · 学习资源共建社区</span>
          </div>

          {/* 主标题 */}
          <h1
            className="fade-in-up mb-4 text-5xl font-bold tracking-tight sm:text-7xl"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="block">为先 23 班</span>
            <span className="gradient-text mt-2 block">共享资源站</span>
          </h1>

          {/* 副标题 */}
          <p
            className="fade-in-up mt-6 max-w-2xl text-lg text-fd-muted-foreground sm:text-xl"
            style={{ animationDelay: '0.2s' }}
          >
            {appDescription}
          </p>

          {/* CTA 按钮 */}
          <div
            className="fade-in-up mt-10 flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: '0.3s' }}
          >
            <Link
              href="/docs"
              className="group inline-flex items-center gap-2 rounded-full bg-fd-primary px-7 py-3 font-medium text-fd-primary-foreground transition hover:scale-105 hover:shadow-lg hover:shadow-fd-primary/30"
            >
              开始浏览
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card/60 px-7 py-3 font-medium backdrop-blur transition hover:border-fd-primary/50 hover:bg-fd-card"
            >
              <GitHubIcon className="size-4" />
              GitHub
            </Link>
          </div>

          {/* Hero 底部装饰 */}
          <div
            className="fade-in-up mt-16 flex items-center gap-2 text-xs text-fd-muted-foreground"
            style={{ animationDelay: '0.4s' }}
          >
            <span>↓</span>
            <span>向下滚动看看我们整理了什么</span>
          </div>
        </div>

        {/* 彩虹分割线 */}
        <div className="rainbow-divider w-full" />
      </section>

      {/* 模块卡片区 */}
      <section className="container mx-auto px-6 py-24">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="gradient-text">六大模块</span>，覆盖工科学习全流程
          </h2>
          <p className="mt-4 text-fd-muted-foreground">
            从科研入门到代码实战，从专业方向选择到就业准备
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.slug}
                href={`/docs/${m.slug}`}
                className="group fade-in-up relative overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6 transition-all hover:-translate-y-1 hover:border-fd-primary/40 hover:shadow-xl hover:shadow-fd-primary/10"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* 卡片角落渐变光晕 */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -top-12 -right-12 size-40 rounded-full bg-gradient-to-br ${m.accent} opacity-10 blur-2xl transition-opacity group-hover:opacity-25`}
                />

                <div
                  className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${m.accent} text-white shadow-md`}
                >
                  <Icon className="size-6" />
                </div>

                <h3 className="mb-2 text-lg font-semibold">{m.title}</h3>
                <p className="text-sm text-fd-muted-foreground">
                  {m.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary">
                  进入
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}

          {/* 第七张卡片：待整理资源池 */}
          <Link
            href="/docs/inbox"
            className="group relative overflow-hidden rounded-2xl border border-dashed border-fd-border bg-fd-card/50 p-6 transition-all hover:-translate-y-1 hover:border-fd-primary/40"
          >
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-fd-border bg-fd-secondary text-fd-muted-foreground">
              <Inbox className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">待整理资源池</h3>
            <p className="text-sm text-fd-muted-foreground">
              同学补充但还没归类的资源，欢迎提 PR 整理到对应模块
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-fd-muted-foreground">
              进入
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* 数据统计区 */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="bg-glow-purple pointer-events-none absolute inset-0"
        />
        <div className="container mx-auto px-6 py-24">
          <header className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              我们整理了什么
            </h2>
            <p className="mt-4 text-fd-muted-foreground">
              持续更新中，欢迎补充
            </p>
          </header>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="text-center rounded-2xl border border-fd-border bg-fd-card/60 p-8 backdrop-blur"
              >
                <div className="text-5xl font-bold gradient-text sm:text-6xl">
                  <StatCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-3 text-sm text-fd-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 行动号召 */}
      <section className="container mx-auto px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-fd-primary/30 bg-gradient-to-br from-fd-primary/10 via-fd-card to-fd-card p-10 text-center sm:p-16">
          <div
            aria-hidden
            className="bg-glow-purple pointer-events-none absolute inset-0"
          />
          <div className="relative">
            <Sparkles className="mx-auto mb-6 size-10 text-fd-primary" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              开始你的学习之旅
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-fd-muted-foreground">
              所有内容公开可读，欢迎收藏、分享、共建。<br />
              想用 AI 问答？打开文档站点击右下角「Ask AI」，配置好你自己的 API Key 即可。
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/docs"
                className="group inline-flex items-center gap-2 rounded-full bg-fd-primary px-7 py-3 font-medium text-fd-primary-foreground transition hover:scale-105"
              >
                立即开始
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-fd-border">
        <div className="container mx-auto flex flex-col items-center gap-4 px-6 py-8 text-sm text-fd-muted-foreground sm:flex-row sm:justify-between">
          <div>
            <span className="font-medium">{appShortName}</span>
            <span className="mx-2">·</span>
            <span>由班级共同维护</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fd-foreground"
            >
              GitHub
            </Link>
            <Link
              href="https://xylt-space.top"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-fd-foreground"
            >
              维护者主页
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
