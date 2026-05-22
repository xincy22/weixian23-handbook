import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
};

export default withMDX(config);

// 让本地 `next dev` 可以访问 Cloudflare bindings（如 ASSETS）
// 参考: https://opennext.js.org/cloudflare/get-started
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
