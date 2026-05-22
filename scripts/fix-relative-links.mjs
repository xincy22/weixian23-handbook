// 批量给所有 mdx 里的相对链接 (./xxx)、(../xxx) 加上 .mdx 后缀
// 规则：
//   - 已经带扩展名的（.md/.mdx/.png/.svg/.jpg 等）跳过
//   - 形如 ./prompts/  这种结尾斜杠的，改为 ./prompts/index.mdx
//   - 锚点 (./xxx#section) 也支持
//   - 同时处理 ./ 和 ../ 多级
import { readFile, writeFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import path from 'node:path';

const EXT_RE = /\.(mdx|md|png|jpg|jpeg|svg|gif|webp|pdf|json|txt|html?)(\?|#|$)/i;

// markdown 链接：[text](href)
// 排除带 ! 前缀（图片，但图片我们也要保留处理）
// 这里只匹配 [..](./...) 或 [..](../...) 形式
const MD_LINK_RE = /\]\((\.{1,2}\/[^)\s]*?)\)/g;

let totalFiles = 0;
let totalReplacements = 0;

for await (const file of glob('content/docs/**/*.mdx')) {
  const text = await readFile(file, 'utf8');
  let changed = 0;
  const next = text.replace(MD_LINK_RE, (whole, href) => {
    // 去掉 hash/query 后判断
    const hashIdx = Math.min(
      ...['#', '?'].map((c) => {
        const i = href.indexOf(c);
        return i === -1 ? Infinity : i;
      }),
    );
    const pure = hashIdx === Infinity ? href : href.slice(0, hashIdx);
    const tail = hashIdx === Infinity ? '' : href.slice(hashIdx);

    // 已带扩展名 -> 不动
    if (EXT_RE.test(pure)) return whole;

    // 以 / 结尾 -> 当作目录，指向 index.mdx
    let fixed;
    if (pure.endsWith('/')) {
      fixed = `${pure}index.mdx`;
    } else {
      fixed = `${pure}.mdx`;
    }

    changed++;
    return `](${fixed}${tail})`;
  });

  if (changed > 0) {
    await writeFile(file, next, 'utf8');
    totalFiles++;
    totalReplacements += changed;
    console.log(`  ${path.relative('.', file)}: ${changed} fix(es)`);
  }
}

console.log(`\nDone. ${totalReplacements} relative link(s) fixed across ${totalFiles} file(s).`);
