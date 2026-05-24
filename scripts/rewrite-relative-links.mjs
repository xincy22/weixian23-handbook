// 把 content/docs/**/*.mdx 里所有 [xxx](./yyy.mdx) / (../yyy.mdx) 形式的相对链接
// 改写成绝对路径 [xxx](/docs/<resolved>)
//
// 原因：
//   - fumadocs `createRelativeLink` 只在 RSC 渲染时改写原生 <a>，
//     dev 模式下 next.js 的 prefetch 会拿到原始 ./xxx.mdx 字面 href，
//     在 output:'export' 配置下命中 catch-all 后 generateStaticParams
//     里没有对应 slug，500。
//   - 自定义组件（如 ModuleCard）拿到的是 raw href，根本不走 createRelativeLink。
//
// 用法：node scripts/rewrite-relative-links.mjs

import { readFile, writeFile, glob } from 'node:fs/promises';
import path from 'node:path';

const ROOT = 'content/docs';

// 匹配 [text](./xxx) 或 [text](../xxx)
// 支持锚点 #section、查询 ?foo
// text 内允许嵌套 [..]
const LINK_RE = /\]\((\.{1,2}\/[^)\s]+?)\)/g;

let totalFiles = 0;
let totalLinks = 0;

for await (const file of glob(`${ROOT}/**/*.mdx`)) {
  const text = await readFile(file, 'utf8');
  // 文件相对 content/docs 的目录（用 / 分隔，跟 docs 路由对齐）
  const fileDir = path
    .relative(ROOT, path.dirname(file))
    .split(path.sep)
    .join('/');

  let changed = 0;
  const next = text.replace(LINK_RE, (whole, href) => {
    // 拆 hash / query
    const hashIdx = ['#', '?']
      .map((c) => href.indexOf(c))
      .filter((i) => i !== -1)
      .reduce((a, b) => Math.min(a, b), Infinity);
    const pure = hashIdx === Infinity ? href : href.slice(0, hashIdx);
    const tail = hashIdx === Infinity ? '' : href.slice(hashIdx);

    // 只处理 .mdx / .md 后缀以及结尾斜杠（指向目录 index）
    const isMdx = /\.(mdx|md)$/i.test(pure);
    const isDir = pure.endsWith('/');
    if (!isMdx && !isDir) return whole;

    // 解析为 docs 根的相对路径（去掉扩展名）
    let rel = path.posix.normalize(path.posix.join(fileDir, pure));
    rel = rel.replace(/\.(mdx|md)$/i, '');
    // 目录链接 -> 去掉末尾的 index 段，目录本身就是路由
    if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length);
    // 结尾仍以 / 收尾的目录链接
    if (rel.endsWith('/')) rel = rel.slice(0, -1);

    const absHref = `/docs/${rel}${tail}`;
    changed++;
    return `](${absHref})`;
  });

  if (changed > 0) {
    await writeFile(file, next, 'utf8');
    totalFiles++;
    totalLinks += changed;
    console.log(`  ${path.relative('.', file)}: ${changed} link(s)`);
  }
}

console.log(
  `\nDone. ${totalLinks} relative link(s) rewritten across ${totalFiles} file(s).`,
);
