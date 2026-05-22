# 为先 23 共享资源站

> 班级共建的学习资源手册 · AI 时代的工科学习指南

基于 [Fumadocs](https://fumadocs.dev) + Next.js 16 构建。访问地址：
[https://weixian23.xylt-space.top](https://weixian23.xylt-space.top)

---

## 特性

- 🎨 **清华紫主题** + 粒子背景 + 雪花特效 + 流光动效
- 🌓 暗色 / 亮色一键切换
- 🔍 **全站搜索**（基于 Orama，按 `Ctrl+K` 唤出）
- 🤖 **AI 问答**（用户自带 API Key，配置仅存浏览器本地）
- 📐 **数学公式渲染**（KaTeX）
- 📱 完全响应式
- ⚡ 静态生成 + 增量构建

---

## 本地开发

需要 Node.js 22+ 和 pnpm。

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:3000）
pnpm dev

# 类型检查
pnpm types:check

# 生产构建
pnpm build

# 本地预览生产构建
pnpm start
```

---

## 项目结构

```
weixian23-handbook/
├── content/docs/             # 所有文档内容（.mdx 文件 + meta.json）
│   ├── meta.json             # 顶层模块顺序
│   ├── ai-tools/             # AI 工具与 API
│   ├── literature/           # 文献检索与论文阅读
│   ├── writing/              # 科研写作与排版
│   ├── coding/               # 编程与数据分析工具
│   ├── majors/               # 专业方向资源导航
│   ├── career/               # 就业实习与行业认知
│   └── inbox/                # 待整理资源池
├── src/
│   ├── app/
│   │   ├── (home)/           # 首页（带 Hero、卡片、统计、特效）
│   │   ├── docs/             # 文档路由
│   │   ├── api/
│   │   │   ├── chat/         # AI 问答接口（透传用户配置到 OpenAI 兼容 endpoint）
│   │   │   └── search/       # 全站搜索接口
│   │   └── layout.tsx        # 根 layout（站点元数据）
│   ├── components/
│   │   ├── home/             # 首页特效组件（粒子、雪花、统计计数）
│   │   ├── ai/               # AI 问答相关
│   │   │   ├── search.tsx        # 主聊天面板
│   │   │   ├── settings.tsx      # AI 配置面板
│   │   │   └── config-store.ts   # localStorage 配置存储
│   │   └── ui/               # 通用 UI 组件
│   └── lib/
│       ├── shared.ts         # 站点统一配置（标题、Logo、GitHub）
│       ├── source.ts         # Fumadocs 文档源
│       └── layout.shared.tsx # 共用 layout 配置
├── source.config.ts          # Fumadocs MDX 配置（math、shiki 等）
├── next.config.mjs           # Next.js 配置
└── package.json
```

---

## 写文档

### 添加一个新页面

1. 在对应的模块文件夹（如 `content/docs/ai-tools/`）下新建 `xxx.mdx` 文件
2. 文件顶部加 frontmatter：

   ```mdx
   ---
   title: "页面标题"
   description: "一句话简介，会显示在搜索和 OG 图里"
   ---

   正文内容...
   ```

3. 在该文件夹的 `meta.json` 的 `pages` 数组里加入文件名（不带 `.mdx`），控制侧边栏顺序。
4. **不要在正文里写 `# 一级标题`**——title 已经由 frontmatter 自动渲染。

### 添加一个新模块

1. 在 `content/docs/` 下新建文件夹（用英文 slug 作为名字）
2. 文件夹内放 `index.mdx` 作为模块首页 + `meta.json`：

   ```json
   {
     "title": "模块名",
     "description": "一句话简介",
     "icon": "Bot",
     "pages": ["index", "page1", "page2"]
   }
   ```

3. 在 `content/docs/meta.json` 的 `pages` 数组里加入新模块的 slug
4. 如果想在首页卡片区也展示，去 `src/app/(home)/page.tsx` 里 `modules` 数组添加配置

### MDX 兼容性注意事项

- **不要**在正文里直接用 `<` 后接数字或字母（MDX 会当成 JSX 标签）。需要时用 `&lt;` 或代码块包起来。
- **数学公式**用 `$...$`（行内）和 `$$...$$`（行间）。
- **代码块**最好标注语言（`````python`），shiki 不认识的语言会降级为纯文本。

---

## AI 问答怎么工作

```
用户浏览器                  Next.js 服务端           用户配置的 AI 服务
─────────                  ──────────────           ──────────────────
1. 在设置面板填配置                                       
   存到 localStorage                                       
                                                          
2. 点 Ask AI 提问                                         
                                                          
3. 把 baseURL/key/model                                  
   塞进请求头发到 /api/chat                                 
                       ─────→  4. 读请求头里的配置          
                                                          
                              5. 用 source 检索相关文档片段
                                                          
                              6. 用 OpenAI Compatible      
                                 provider 转发请求         
                                                          ─────→  7. 调用 AI
                                                                  返回流式回复
                              8. 流式 SSE 转回给浏览器  ←─
   9. 实时渲染回答  ←─                                    
```

**安全保证：**

- 用户的 API Key 仅存在 **localStorage**（浏览器本地）
- 服务器**从不存储**任何 Key
- 每次请求 Key 仅经服务器透传到用户填的 endpoint，不持久化
- 中间人攻击防护：只接受 `https://` 的 baseURL（或 localhost）

---

## 部署到 Cloudflare Pages

### 一次性配置

1. **GitHub**：把这个仓库 push 到一个 GitHub 仓库（建议 `xincy22/weixian23-handbook`）
2. **Cloudflare Dashboard**：
   - 进入 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
   - 选择刚才创建的 GitHub 仓库
   - 构建配置：
     - Framework preset：**Next.js**
     - Build command：`pnpm build`
     - Build output directory：`.next`
     - Node version：`22`（在环境变量里加 `NODE_VERSION=22`）
3. **自定义域名**：
   - 部署成功后，在 Pages 项目的 **Custom domains** 添加 `weixian23.xylt-space.top`
   - Cloudflare 会自动加 CNAME 记录（因为你的域名也托管在 Cloudflare）

### 后续更新

每次 `git push origin main`，Cloudflare 会自动构建并部署。

---

## 协议

本仓库采用**双协议**：

| 内容 | 协议 |
|---|---|
| 代码（`src/`、配置文件等） | [MIT](./LICENSE) |
| 文档内容（`content/docs/**`） | [CC BY-SA 4.0](./content/docs/LICENSE) |

**使用本站内容时请保留署名**：

> "为先 23 共享资源站" by 为先 23 同学
> 原文：https://github.com/xincy22/weixian23-handbook
> 协议：CC BY-SA 4.0

向本站提交贡献即视为同意以上述协议发布。

---

## 维护

- 主仓库：[github.com/xincy22/weixian23-handbook](https://github.com/xincy22/weixian23-handbook)
- 维护者：为先 23 同学
- 同学贡献：开 Issue 或提 PR，详见 [CONTRIBUTING.md](./CONTRIBUTING.md)
