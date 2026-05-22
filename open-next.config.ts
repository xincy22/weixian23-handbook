import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// 首次部署不开启 R2 增量缓存
// 后续如需 ISR/On-Demand Revalidation 提速，参考：
// https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
