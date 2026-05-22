'use client';

/**
 * 极简的浏览器端 OpenAI 兼容流式客户端。
 *
 * 设计取舍：
 * - 完全在浏览器运行，不需要服务端中转。用户的 API Key 仅存于 localStorage，
 *   每次请求时随请求头发到 *用户自己配置的* Base URL，本站不知道也不存储 Key。
 * - 只实现最常用的 chat completions（流式 SSE），不引入 ai-sdk 等库以保持轻量。
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChatOptions {
  baseURL: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
  /** 收到一个增量文本时回调 */
  onDelta: (delta: string) => void;
}

/** 把 baseURL 和 path 拼起来，避免 // 或缺斜杠 */
function joinURL(base: string, path: string): string {
  const trimmed = base.replace(/\/+$/, '');
  const suffix = path.replace(/^\/+/, '');
  return `${trimmed}/${suffix}`;
}

/**
 * 调用 OpenAI 兼容的 /chat/completions，流式返回。
 * 出错时抛异常（包含 HTTP 状态信息）。
 */
export async function streamChat(opts: StreamChatOptions): Promise<void> {
  const { baseURL, apiKey, model, messages, signal, onDelta } = opts;

  const url = joinURL(baseURL, 'chat/completions');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages,
    }),
    signal,
  });

  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      // ignore
    }
    throw new Error(
      `请求失败 ${res.status} ${res.statusText}${detail ? `\n${detail}` : ''}`,
    );
  }

  if (!res.body) {
    throw new Error('响应没有 body，可能 Base URL 不支持流式');
  }

  // SSE 解析：按行读，data: 开头的是 JSON 数据
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // 按 \n\n 分隔事件
    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const event = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      for (const line of event.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') return;

        try {
          const json = JSON.parse(payload);
          const delta = json?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta.length > 0) {
            onDelta(delta);
          }
        } catch {
          // 忽略解析失败的事件（有些供应商心跳、ping 等）
        }
      }
    }
  }
}
