import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from 'ai';
import { z } from 'zod';
import { source } from '@/lib/source';
import { Document, type DocumentData } from 'flexsearch';
import { appName } from '@/lib/shared';

interface CustomDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;

const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: 'url',
      index: ['title', 'description', 'content'],
      store: ['title', 'description', 'url', 'content'],
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!('getText' in page.data)) return null;

      return {
        title: page.data.title,
        description: page.data.description ?? '',
        url: page.url,
        content: await page.data.getText('processed'),
      } as CustomDocument;
    }),
  );

  for (const doc of docs) {
    if (doc) search.add(doc);
  }

  return search;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}

/** System prompt（中文），让 AI 基于本站内容回答 */
const systemPrompt = `你是「${appName}」的助手，帮助用户快速找到这个文档站里的内容。

工作方式：
1. 先调用 search 工具检索相关文档（用户问什么主题，先搜什么）
2. 基于搜索结果回答，回答中用 markdown 链接引用相关页面（如 [文档标题](url)）
3. 如果搜索没结果，直接说"我没有在站点中找到相关内容"，并建议更精确的搜索关键词
4. 使用简体中文回答，技术术语保留英文

约束：
- 不编造站点中不存在的内容
- 不回答与本站内容无关的问题（编程、AI、科研学习等话题除外，因为本站就是这些主题的文档）
- 引用 URL 时使用相对路径（站点内部链接）
- 答案简明扼要，不啰嗦
`;

const searchTool = tool({
  description: '在本站文档中搜索相关内容，返回 JSON 结果',
  inputSchema: z.object({
    query: z.string().describe('搜索关键词，可以中英文混合'),
    limit: z.number().int().min(1).max(20).default(8),
  }),
  async execute({ query, limit }) {
    const search = await searchServer;
    const results = await search.searchAsync(query, {
      limit,
      merge: true,
      enrich: true,
    });
    // 限制每条 content 长度，避免上下文爆炸
    return results.map((r: any) => ({
      ...r,
      doc: r.doc
        ? {
            ...r.doc,
            content:
              typeof r.doc.content === 'string'
                ? r.doc.content.slice(0, 1500)
                : r.doc.content,
          }
        : r.doc,
    }));
  },
});

export type SearchTool = typeof searchTool;

export async function POST(req: Request) {
  // 从请求头读取用户配置（前端从 localStorage 读出来塞进 header）
  const baseURL = req.headers.get('x-ai-base-url')?.trim();
  const apiKey = req.headers.get('x-ai-api-key')?.trim();
  const model = req.headers.get('x-ai-model')?.trim();

  if (!baseURL || !apiKey || !model) {
    return new Response(
      JSON.stringify({
        error: 'AI 未配置',
        message: '请先在右上角设置面板填入 Base URL、API Key 和 Model',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  // 简单的 Base URL 校验，避免被乱填
  try {
    const u = new URL(baseURL);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Base URL 不合法',
        message: 'Base URL 必须是 http(s):// 开头的完整 URL',
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  const reqJson = await req.json();

  // 创建一个临时的 provider，仅用于本次请求
  const provider = createOpenAICompatible({
    name: 'user-provided',
    baseURL,
    apiKey,
  });

  try {
    const result = streamText({
      model: provider.chatModel(model),
      stopWhen: stepCountIs(5),
      tools: { search: searchTool },
      messages: [
        { role: 'system', content: systemPrompt },
        ...(await convertToModelMessages<ChatUIMessage>(reqJson.messages ?? [], {
          convertDataPart(part) {
            if (part.type === 'data-client')
              return {
                type: 'text',
                text: `[当前页面: ${JSON.stringify(part.data)}]`,
              };
          },
        })),
      ],
      toolChoice: 'auto',
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'AI 调用失败',
        message: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
}
