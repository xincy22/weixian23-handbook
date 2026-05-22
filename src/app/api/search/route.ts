import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';
import { createTokenizer } from '@orama/tokenizers/mandarin';

// 静态搜索：构建时把全部文档索引导出为 JSON，浏览器加载后本地搜索
// https://www.fumadocs.dev/docs/headless/search/orama#static-mode
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source, {
  // 中文分词支持（站点全是中文）
  components: {
    tokenizer: createTokenizer(),
  },
  search: {
    threshold: 0,
    tolerance: 0,
  },
});
