# 贡献指南

欢迎为本站补充内容，所有同学都可以参与。

---

## 三种贡献方式

### 方式一：开 Issue（最简单，不会 Git 也行）

直接在 GitHub 仓库页面：

1. 点 `Issues` → `New issue`
2. 描述你想补充/修改的内容（贴个链接、写段文字都可以）
3. 维护者会评估后整合到文档中

**适合：** 发现错别字、失效链接、想补充资源但不会用 Git 的同学。

### 方式二：直接在线编辑（推荐）

每个文档页面右上角都有 **"Edit this page on GitHub"** 链接。点进去：

1. GitHub 会让你 fork 仓库（首次操作会提示）
2. 在线编辑 `.mdx` 文件
3. 直接提交 PR

**适合：** 改一两行文字、补充小内容。

### 方式三：本地开发 + PR

```bash
# 1. Fork 仓库到你自己的 GitHub
# 2. clone 到本地
git clone https://github.com/你的用户名/weixian23-handbook.git
cd weixian23-handbook

# 3. 装依赖
pnpm install

# 4. 启动开发服务器
pnpm dev

# 5. 改完之后
git checkout -b feat/补充xxx
git add .
git commit -m "feat(ai-tools): 补充 XX 工具"
git push origin feat/补充xxx

# 6. 在 GitHub 上提 PR
```

**适合：** 大改动、新增模块、视觉调整。

---

## 内容写作规范

### 文件结构

每个 `.mdx` 文件顶部要有 frontmatter：

```mdx
---
title: "页面标题"
description: "一句话简介"
---

正文从这里开始...
```

**重要：** 不要在正文里再写 `# 一级标题`，因为 title 已经会自动渲染。直接从 `## 二级标题` 开始。

### 表格 / 链接 / 代码块

- 表格用标准 Markdown 表格
- 站内链接用相对路径：`[Python 环境配置](/docs/coding/python)`
- 外部链接：`[DeepSeek](https://chat.deepseek.com)`
- 代码块**一定要标语言**：

  ````
  ```python
  print("hello")
  ```
  ````

### MDX 注意事项

MDX 把 `<...>` 当成 JSX 标签解析，所以正文里用到 `<` 的地方要小心：

- ✅ 在代码块里：` `<20 页` `
- ❌ 直接写在文字里：`<20 页`（会报错）
- ✅ 转义：`&lt;20 页`
- ✅ 带空格：`< 20 页`（注意 `<` 后必须有空格才不会被当 JSX）

### 数学公式

支持 KaTeX：

- 行内：`$E = mc^2$`
- 行间：`$$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$`

---

## 添加新工具/资源时的格式

至少包含：

```markdown
| 工具 | 解决什么问题 | 费用 | 链接 |
| --- | --- | --- | --- |
| **工具名** | 一句话说明用途 | 免费 / ¥X/月 | [官网](https://example.com) |
```

或者列表式：

```markdown
- **工具名** — 一句话简介
  - 链接：[官网](https://example.com)
  - 费用：免费 / ¥X/月 / $X/月
  - 适合谁：xxx 场景
```

---

## 不接受的内容

- 个人隐私信息（姓名、学号、联系方式）
- 付费推广 / 商业广告
- 未经验证的传言
- 政治敏感话题
- 违反学术诚信的内容（代写、刷分等）

---

## 提 PR 检查清单

- [ ] 改动的内容我自己验证过（链接能打开、价格是当前的）
- [ ] 没有破坏其他文档的内部链接
- [ ] 跑过 `pnpm build` 通过
- [ ] PR 标题符合 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)（如 `feat(ai-tools): 补充 XX 工具`）

---

## 维护者

- [@xincy22](https://github.com/xincy22) - 主维护者
- 班级 maintainer 团队 - TBD

如果你的 PR 一周没回应，欢迎 @ 维护者提醒。

---

## 致谢

每位贡献者的 GitHub 头像会自动显示在仓库主页。

> **你的一行 PR，可能帮到 100 个后来的同学。**

---

## 关于协议

向本仓库提交内容（PR、Issue 中的内容、Markdown 文件、代码补丁等），即视为你同意：

- **代码补丁**：以 [MIT 协议](./LICENSE) 发布
- **文档内容**（`content/docs/**`）：以 [CC BY-SA 4.0 协议](./content/docs/LICENSE) 发布

这两个协议都允许任何人自由使用、修改、再分发你的贡献，前提是保留署名。
你保留对自己原创内容的著作权，仅授权按上述协议使用。
