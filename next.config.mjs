import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // 静态导出：所有页面构建时预渲染为 HTML，部署到任意 CDN
  // https://nextjs.org/docs/app/guides/static-exports
  output: 'export',
  // 静态导出下 next/image 不能动态优化，禁用即可（我们站点几乎不用 next/image）
  images: { unoptimized: true },
};

export default withMDX(config);
