# 为先 23 共享资源站

> 班级共建的学习资源手册 · AI 时代的工科学习指南

清华大学为先书院 23 级同学共建的学习资源站，覆盖从科研入门到就业实习的工科学习全流程。
基于 [Fumadocs](https://fumadocs.dev) + Next.js 16 静态导出，部署在 Cloudflare。

🌐 在线访问：[https://weixian23.xylt-space.top](https://weixian23.xylt-space.top)

---

## 七大模块

| 模块 | 路径 | 内容 |
| --- | --- | --- |
| 🤖 AI 工具与 API | `/docs/ai-tools` | AI 工具大全、API Key 配置、Prompt 模板与工程化（MCP、Skills、Harness） |
| 📚 文献检索与论文阅读 | `/docs/literature` | 检索入口、关键词构造、筛选标准、阅读流程、Zotero 文献管理 |
| ✍️ 科研写作与排版 | `/docs/writing` | LaTeX、Word + UnicodeMath、AI 学术绘图、AI 辅助写作的边界 |
| 💻 编程与数据分析工具 | `/docs/coding` | Python、MATLAB、Git、GitHub、Linux、远程开发 |
| 🧭 专业方向资源导航 | `/docs/majors` | IC、CS、AI、仪器、生物医学、材料 6 个方向的入门路线 |
| 💼 就业实习与行业认知 | `/docs/career` | 行业概览、实习信息、简历与面试准备 |
| 📥 待整理资源池 | `/docs/inbox` | 同学补充但暂未归类的内容，欢迎提 PR 整理 |

---

## 站点特性

- 🎨 **清华紫主题** —— 自定义 OKLCH 色彩，亮/暗模式自动切换
- ✨ **首页特效** —— Canvas 粒子背景（鼠标吸引）、雪花飘落、彩虹流光、滚动数字计数
- 🔍 **全站搜索** —— Orama 静态索引 + 中文分词，按 `Ctrl+K` 唤出
- 🤖 **Ask AI** —— 用户自带 API Key，浏览器直连，零服务端中转
- 💬 **评论区** —— Giscus（基于 GitHub Discussions），主题跟随站点
- 📐 **数学公式** —— KaTeX 渲染，行内 `$...$`，行间 `$$...$$`
- 📄 **LLM 友好直链** —— 每页都有 `/llms.mdx/...content.md`，复制喂给 ChatGPT/Claude
- 🕒 **最近更新** —— 首页基于 `git log` 自动列出最近改动的文档
- 🔗 **死链巡检** —— GitHub Actions + lychee 每周扫描，自动开 Issue 报告
- 📱 完全响应式 · ⚡ 静态生成 · 🚀 部署在 Cloudflare 边缘

---

## 本地开发

需要 **Node.js 22+** 和 **pnpm**。

```bash
# 装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:3000）
pnpm dev

# 类型检查（fumadocs-mdx + next typegen + tsc --noEmit）
pnpm types:check

# Lint
pnpm lint

# 生产构建（产物在 out/，可直接部署到任意静态 CDN）
pnpm build

# 本地预览生产构建（启 Wrangler dev server 模拟 Cloudflare 环境）
pnpm preview

# 部署到 Cloudflare（需先 wrangler login）
pnpm deploy
```

---

## 项目结构

```
weixian23-handbook/
├── content/docs/             # 所有文档内容（.mdx + meta.json）
│   ├── meta.json             # 顶层模块顺序
│   ├── LICENSE               # 文档专用 CC BY-SA 4.0
│   ├── ai-tools/             # 含 engineering/、prompts/ 子模块
│   ├── literature/           # 文献检索 6 篇
│   ├── writing/              # 科研写作 7 篇
│   ├── coding/               # 编程工具 8 篇
│   ├── majors/               # 6 大专业方向
│   ├── career/               # 就业实习 4 篇
│   └── inbox/                # 待整理资源池
│
├── src/
│   ├── app/
│   │   ├── (home)/                  # 首页（Hero + 模块卡片 + 最近更新 + 统计）
│   │   ├── docs/[[...slug]]/        # 文档动态路由 + Ask AI 浮动按钮
│   │   ├── api/search/              # Orama 静态搜索索引
│   │   ├── llms.txt/                # 给 LLM 的全站文档索引
│   │   ├── llms-full.txt/           # 全站文档拼接成单文件
│   │   ├── llms.mdx/docs/[[...slug]]/  # 单页 markdown 直链
│   │   ├── og/docs/[...slug]/       # 每页自动生成 1200×630 OG 图
│   │   ├── icon.tsx                 # favicon（emoji 渲染成 PNG）
│   │   ├── apple-icon.tsx           # iOS 主屏图标
│   │   ├── layout.tsx               # 根 layout（站点元数据）
│   │   └── global.css               # 主题色、特效动画、KaTeX 样式
│   │
│   ├── components/
│   │   ├── home/                    # 首页特效（粒子、雪花、统计计数）
│   │   ├── ai/
│   │   │   ├── search.tsx           # Ask AI 主面板（含浮动按钮、对话列表）
│   │   │   ├── settings.tsx         # AI 配置弹窗（含预设服务商）
│   │   │   ├── config-store.ts      # localStorage 配置存储 + pub/sub
│   │   │   └── openai-stream.ts     # 浏览器端 OpenAI 兼容 SSE 客户端
│   │   ├── ui/button.tsx            # 通用按钮（cva variants）
│   │   ├── search-dialog.tsx        # Ctrl+K 搜索弹窗
│   │   ├── markdown.tsx             # 流式 markdown 渲染（带逐字 fade-in）
│   │   ├── mdx.tsx                  # MDX 组件注入
│   │   ├── comments.tsx             # Giscus 评论
│   │   ├── providers.tsx            # 根 Provider
│   │   └── github-icon.tsx          # 自带 GitHub Octocat 图标
│   │
│   └── lib/
│       ├── shared.ts                # 站点元信息（appName、appLogo、gitConfig）
│       ├── source.ts                # Fumadocs source 加载器
│       ├── layout.shared.tsx        # Home/Docs 共用导航配置
│       ├── recent-updates.ts        # 构建期 git log 抽最近更新
│       └── cn.ts                    # tailwind-merge 别名
│
├── scripts/fix-relative-links.mjs   # 一次性：给 mdx 相对链接补 .mdx 后缀
├── public/_headers                  # Cloudflare 静态资源响应头（缓存、Content-Type）
├── .github/workflows/link-check.yml # 死链巡检（lychee）
├── .lycheerc / .lycheeignore        # 死链检查配置
├── source.config.ts                 # Fumadocs MDX 配置（math、shiki）
├── next.config.mjs                  # output: 'export'
├── wrangler.toml                    # Cloudflare Workers Static Assets
└── package.json
```

---

## 写文档

📖 完整的内容写作规范、PR 流程、MDX 注意事项请看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

**速查：**

- 添加新页面 → 在对应模块文件夹建 `xxx.mdx` + 加到 `meta.json` 的 `pages` 里
- 添加新模块 → 建文件夹 + 写 `index.mdx` 和 `meta.json`，并在 `content/docs/meta.json` 里登记
- frontmatter 必须有 `title` 和 `description`，**不要在正文写一级标题**（自动渲染）
- 站内链接用 `/docs/xxx` 路径式，不要写 `.mdx` 后缀
- MDX 里 `<` 加字母数字会被当 JSX 标签，写成 `&lt;` 或包进代码块

---

## Ask AI 怎么工作

不同于一般的 AI 文档站，本站的 AI 问答**完全在浏览器跑，零服务端**：

```
浏览器                                       用户配置的 AI 服务
─────────                                    ──────────────────
1. 在设置面板填 baseURL / apiKey / model
   存到 localStorage（仅本机可见）

2. 点 Ask AI 提问

3. 并发拉两个上下文：
   • 当前页 markdown 全文
     /llms.mdx/docs/.../content.md（≤8KB）
   • 站内全站搜索结果
     /api/search.json（Orama 索引）

4. 组装 system + 上下文 + 历史 + 问题，
   直接 fetch 用户填的 baseURL/chat/completions
                                ──────→  5. 流式返回 SSE
                                          OpenAI 兼容协议
6. SSE 增量解析 + Markdown 流式渲染   ←──
```

**安全保证：**

- API Key 仅存于 **localStorage**，本站和服务器**完全不知情**
- 每次请求 Key 直接从浏览器发到用户填的 endpoint，**没有任何中转**
- 这意味着即使本站被攻击，你的 Key 也安全

**预设服务商**（点击一键填入 baseURL）：

| 服务商 | 说明 |
| --- | --- |
| DeepSeek | 最便宜，注册地址 [platform.deepseek.com](https://platform.deepseek.com) |
| OpenAI | 需要美区信用卡 |
| 阿里云百炼 | 国内直连，注册即送免费额度 |

也可以填任何 OpenAI 兼容 endpoint（兼容 `/v1/chat/completions` SSE 协议即可），如 SiliconFlow、火山引擎、自部署的 Ollama 等。

---

## 部署到 Cloudflare

### 一次性配置

本仓库走 `output: 'export'` 静态导出 + Cloudflare Workers Static Assets 路线（`wrangler.toml` 已配好）。

**方式一：Cloudflare Pages（接 Git，自动部署）**

1. **GitHub**：把仓库 push 到 GitHub
2. **Cloudflare Dashboard** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 选择仓库，构建配置：
   - Framework preset：**Next.js (Static HTML Export)**
   - Build command：`pnpm build`
   - Build output directory：`out`
   - 环境变量：`NODE_VERSION=22`
4. **自定义域名**：在 Pages 项目的 **Custom domains** 添加你的域名

每次 `git push origin main` 自动构建部署。

**方式二：Wrangler 命令行**

```bash
pnpm deploy   # 等价于 next build && wrangler deploy
```

`wrangler.toml` 关键配置：

```toml
[assets]
directory = "./out"
not_found_handling = "404-page"   # 走 Next.js 自带 404 页
```

### 缓存与响应头

`public/_headers` 已配好：

- `/_next/static/*` → 一年长缓存（文件名带哈希）
- `/llms.txt` `/llms-full.txt` → `text/plain; charset=utf-8`
- `/llms.mdx/*` → `text/markdown; charset=utf-8`（方便 LLM 直接读）

---

## 自动化与 CI

| 工作流 | 文件 | 作用 |
| --- | --- | --- |
| 死链检查 | [.github/workflows/link-check.yml](./.github/workflows/link-check.yml) | 每周一 + PR 触发，用 lychee 扫描所有外链。失败会自动开/更新 GitHub Issue 报告 |

死链检查的过滤规则在 [.lycheerc](./.lycheerc) 里维护（已排除清华内网、微信公众号、微博等已知会误报的站）。临时禁用某条 URL 写到 [.lycheeignore](./.lycheeignore)。

---

## 协议

本仓库采用**双协议**：

| 内容 | 协议 |
| --- | --- |
| 代码（`src/`、配置文件等） | [MIT](./LICENSE) |
| 文档内容（`content/docs/**`） | [CC BY-SA 4.0](./content/docs/LICENSE) |

**使用本站内容时请保留署名：**

> "为先 23 共享资源站" by 为先 23 同学
> 原文：https://github.com/xincy22/weixian23-handbook
> 协议：CC BY-SA 4.0

向本站提交贡献即视为同意以上述协议发布，详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

## 维护

- 主仓库：[github.com/xincy22/weixian23-handbook](https://github.com/xincy22/weixian23-handbook)
- 维护者：[@xincy22](https://github.com/xincy22) + 班级 maintainer 团队
- 同学贡献：开 Issue 或提 PR，详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 贡献者

感谢所有为这个站点提交内容、修复问题、补充资源的同学。

<a href="https://github.com/xincy22/weixian23-handbook/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=xincy22/weixian23-handbook" alt="贡献者" />
</a>

由 [contrib.rocks](https://contrib.rocks) 自动生成。
