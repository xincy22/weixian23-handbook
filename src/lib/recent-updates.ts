// 在 build 时跑 `git log` 抽出最近改过的文档页。
// 仅 server-side 使用——这个模块依赖 Node 的 `child_process` 和 `fs`。

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

export interface RecentUpdate {
  /** docs 路径（如 `/docs/ai-tools/engineering/harness`） */
  href: string;
  /** 文档展示标题（取自 .mdx frontmatter，缺失时降级用 slug） */
  title: string;
  /** 所在模块（如 `ai-tools`） */
  module: string;
  /** 该次改动的 commit 时间（ISO 8601） */
  date: string;
}

/**
 * 跑 git log，按文件拿到最近一次的改动时间。
 * 失败时（例如不在 git 仓库里、本地文档没 commit）返回空数组。
 */
export function getRecentUpdates(limit = 6): RecentUpdate[] {
  // 仅在 build 时调用，repoRoot 用 process.cwd() 取仓库根。
  // Turbopack 会因此发出一个 NFT 警告，但 `/` 是 fully static 路由，这段代码
  // 不会出现在运行时 trace 中——警告可以忽略。
  const repoRoot = process.cwd();

  let output: string;
  try {
    output = execFileSync(
      'git',
      [
        'log',
        '--name-only',
        '--pretty=format:__COMMIT__%H|%cI',
        '--no-merges',
        '--',
        'content/docs',
      ],
      { encoding: 'utf-8', cwd: repoRoot, maxBuffer: 8 * 1024 * 1024 },
    );
  } catch {
    return [];
  }

  // 输出是一段段 commit 块，每个块开头一行 __COMMIT__hash|date，下面跟改动文件
  const seen = new Map<string, string>(); // path -> ISO date
  let currentDate: string | undefined;

  for (const rawLine of output.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('__COMMIT__')) {
      const parts = line.slice('__COMMIT__'.length).split('|');
      currentDate = parts[1];
      continue;
    }
    if (!currentDate) continue;

    // 只关心 .mdx 文件，且必须仍然存在（被删/挪走的不算）
    if (!line.endsWith('.mdx')) continue;
    if (!line.startsWith('content/docs/')) continue;

    // 跳过模板文件（约定下划线开头不展示）
    const basename = path.basename(line);
    if (basename.startsWith('_')) continue;

    if (!seen.has(line)) {
      seen.set(line, currentDate);
    }
  }

  const updates: RecentUpdate[] = [];
  for (const [file, date] of seen) {
    const abs = path.join(repoRoot, file);
    if (!existsSync(abs)) continue;

    const title = readDocTitle(abs) ?? deriveFallback(file);
    const href = filePathToDocsRoute(file);
    const moduleName = file.split('/')[2] ?? '';

    updates.push({ href, title, module: moduleName, date });
  }

  return updates
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

/** content/docs/foo/bar.mdx → /docs/foo/bar；index.mdx 退化成目录路径 */
function filePathToDocsRoute(file: string): string {
  const stripped = file.replace(/^content\/docs\//, '').replace(/\.mdx$/, '');
  const segments = stripped.split('/');
  if (segments[segments.length - 1] === 'index') {
    segments.pop();
  }
  return `/docs/${segments.join('/')}`.replace(/\/$/, '') || '/docs';
}

/**
 * 极简 frontmatter 解析，只取 title。
 * 不引第三方库；Fumadocs 自己也用类似的同步读取。
 */
function readDocTitle(absPath: string): string | undefined {
  try {
    const buf = readFileSync(absPath, 'utf-8');
    if (!buf.startsWith('---')) return undefined;
    const end = buf.indexOf('\n---', 3);
    if (end < 0) return undefined;
    const fm = buf.slice(3, end);
    const titleLine = fm.split('\n').find((l) => /^title:\s*/i.test(l));
    if (!titleLine) return undefined;
    const value = titleLine.replace(/^title:\s*/i, '').trim();
    const unquoted = value.replace(/^["']|["']$/g, '');
    return unquoted || undefined;
  } catch {
    return undefined;
  }
}

function deriveFallback(filePath: string): string {
  return path.basename(filePath, '.mdx');
}

/** 模块 slug → 中文显示名（和首页 modules 数组保持一致） */
export const MODULE_LABELS: Record<string, string> = {
  'ai-tools': 'AI 工具',
  literature: '文献',
  writing: '写作',
  coding: '编程',
  majors: '专业方向',
  career: '就业',
  inbox: '资源池',
};
