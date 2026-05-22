'use client';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertCircle,
  Cog,
  Loader2,
  MessageCircleIcon,
  RefreshCw,
  SearchIcon,
  Send,
  X,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { buttonVariants } from '../ui/button';
import { Markdown } from '../markdown';
import { Presence } from '@radix-ui/react-presence';
import { isAIConfigured, useAIConfig } from './config-store';
import { AISettingsDialog } from './settings';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { create } from '@orama/orama';
import { createTokenizer } from '@orama/tokenizers/mandarin';
import { streamChat, type ChatMessage } from './openai-stream';
import { appName } from '@/lib/shared';

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** 检索阶段（仅 user 之后的 assistant 消息有） */
  searchMeta?: {
    query: string;
    count: number;
  };
}

interface ChatState {
  messages: UIMessage[];
  status: 'idle' | 'searching' | 'streaming' | 'error';
  error?: Error;
  send: (text: string, location: string) => Promise<void>;
  stop: () => void;
  clear: () => void;
  /** 重新生成上一条 assistant 回复 */
  regenerate: () => Promise<void>;
}

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: ChatState;
} | null>(null);

const SYSTEM_PROMPT = `你是「${appName}」的 AI 助手，帮助用户快速找到这个文档站里的内容。

工作方式：
1. 用户提问后，会先在站内检索，然后把命中的文档内容连同问题交给你
2. 基于这些站内文档回答，回答中用 markdown 链接引用相关页面（如 [文档标题](url)）
3. 如果检索结果与问题无关，直接说"我没有在站点中找到相关内容"，并建议更精确的搜索关键词
4. 使用简体中文回答，技术术语保留英文

约束：
- 只基于检索到的站内文档回答，不编造站内不存在的内容
- 不回答与本站内容无关的问题（编程、AI、科研学习等话题除外，因为本站就是这些主题的文档）
- 引用 URL 时使用相对路径（站点内部链接）
- 答案简明扼要，不啰嗦`;

/** 客户端中文 Orama 实例工厂（必须和服务端构建索引时的 tokenizer 一致） */
function initOramaCN() {
  return create({
    schema: { _: 'string' },
    components: {
      tokenizer: createTokenizer(),
    },
  });
}

/** 极简调用 fumadocs 静态搜索 client，外部使用 */
async function searchDocs(query: string): Promise<
  Array<{ url: string; title: string; description?: string; content?: string }>
> {
  // 直接调静态导出的 search index，避免引入额外依赖
  // 这里复用浏览器全局的 fetch 而不是 fumadocs hook，方便在非组件 context 用
  // 静态搜索的接口实现见 fumadocs-core，我们用 hook 中相同的 client 单独实例化
  const { oramaStaticClient } = await import(
    'fumadocs-core/search/client/orama-static'
  );
  const client = oramaStaticClient({ from: '/api/search', initOrama: initOramaCN });
  const results = await client.search(query);

  // 把结果按 url 去重（fumadocs 把每个 heading 也作为单独条目返回）
  const byUrl = new Map<string, { url: string; title: string; content: string }>();
  for (const r of results) {
    if (r.type === 'page') {
      byUrl.set(r.url, {
        url: r.url,
        title: r.content,
        content: '',
      });
    } else {
      // text/heading 片段，挂到对应页面下作为内容
      const pageUrl = r.url.split('#')[0];
      const existing = byUrl.get(pageUrl);
      if (existing) {
        existing.content += `\n${r.content}`;
      } else {
        byUrl.set(pageUrl, {
          url: pageUrl,
          title: r.content.slice(0, 40),
          content: r.content,
        });
      }
    }
  }

  return Array.from(byUrl.values()).slice(0, 8);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function useChat(): ChatState {
  const config = useAIConfig();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<ChatState['status']>('idle');
  const [error, setError] = useState<Error | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setError(undefined);
    setStatus('idle');
  }, []);

  const runTurn = useCallback(
    async (history: UIMessage[], userText: string, location: string) => {
      if (!isAIConfigured(config)) return;

      setError(undefined);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      // 1. 站内检索
      setStatus('searching');
      let docs: Awaited<ReturnType<typeof searchDocs>> = [];
      try {
        docs = await searchDocs(userText);
      } catch (e) {
        // 检索失败也继续走（让 AI 兜底回答），但记一下
        console.warn('docs search failed', e);
      }

      // 在 assistant 占位消息里附上检索元信息，UI 会显示
      const assistantId = makeId();
      const placeholder: UIMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        searchMeta: { query: userText, count: docs.length },
      };
      setMessages((prev) => [...prev, placeholder]);

      // 2. 组装 system + 检索上下文 + 历史
      const docsContext = docs
        .map(
          (d, i) =>
            `[${i + 1}] ${d.title} (${d.url})\n${(d.content ?? '').slice(0, 800)}`,
        )
        .join('\n\n');

      const messagesForAI: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'system',
          content: `当前页面：${location}\n\n以下是站内检索结果（基于用户问题"${userText}"）：\n\n${docsContext || '（无相关结果）'}`,
        },
        ...history.map<ChatMessage>((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userText },
      ];

      // 3. 流式调用
      setStatus('streaming');
      try {
        await streamChat({
          baseURL: config.baseURL,
          apiKey: config.apiKey,
          model: config.model,
          messages: messagesForAI,
          signal: ctrl.signal,
          onDelta: (delta) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + delta } : m,
              ),
            );
          },
        });
        setStatus('idle');
      } catch (e) {
        if ((e as Error).name === 'AbortError') {
          setStatus('idle');
          return;
        }
        setError(e as Error);
        setStatus('error');
      } finally {
        abortRef.current = null;
      }
    },
    [config],
  );

  const send = useCallback(
    async (text: string, location: string) => {
      const message: UIMessage = {
        id: makeId(),
        role: 'user',
        content: text,
      };
      setMessages((prev) => [...prev, message]);
      // 注意：runTurn 接收的是「不包含本次 user 消息」的历史
      const historySnapshot = messages;
      await runTurn(historySnapshot, text, location);
    },
    [messages, runTurn],
  );

  const regenerate = useCallback(async () => {
    // 删掉最后一条 assistant，用最后一条 user 重跑
    const lastUserIdx = [...messages]
      .reverse()
      .findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;
    const idxFromStart = messages.length - 1 - lastUserIdx;
    const before = messages.slice(0, idxFromStart);
    const lastUser = messages[idxFromStart];
    setMessages(before.concat(lastUser));
    await runTurn(before, lastUser.content, location.href);
  }, [messages, runTurn]);

  return useMemo(
    () => ({ messages, status, error, send, stop, clear, regenerate }),
    [messages, status, error, send, stop, clear, regenerate],
  );
}

export function AISearchPanelHeader({ className, ...props }: ComponentProps<'div'>) {
  const { setOpen } = useAISearchContext();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div
      className={cn(
        'sticky top-0 flex items-center gap-2 border rounded-xl bg-fd-secondary text-fd-secondary-foreground shadow-sm px-3 py-2',
        className,
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">问 AI</p>
        <p className="text-xs text-fd-muted-foreground mt-0.5 truncate">
          AI 回答可能不准确，关键内容请以站内文档为准
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="AI 设置"
          title="AI 设置"
          className={cn(
            buttonVariants({
              size: 'icon-sm',
              color: 'ghost',
              className: 'text-fd-muted-foreground rounded-full',
            }),
          )}
        >
          <Cog className="size-4" />
        </button>
        <button
          aria-label="关闭"
          tabIndex={-1}
          className={cn(
            buttonVariants({
              size: 'icon-sm',
              color: 'ghost',
              className: 'text-fd-muted-foreground rounded-full',
            }),
          )}
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
      </div>

      {settingsOpen && (
        <AISettingsDialog onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}

export function AISearchInputActions() {
  const { messages, status, clear, regenerate } = useChatContext();
  const isLoading = status === 'streaming' || status === 'searching';

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              size: 'sm',
              className: 'rounded-full gap-1.5',
            }),
          )}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          重试
        </button>
      )}
      <button
        type="button"
        className={cn(
          buttonVariants({
            color: 'secondary',
            size: 'sm',
            className: 'rounded-full',
          }),
        )}
        onClick={clear}
      >
        清空对话
      </button>
    </>
  );
}

const StorageKeyInput = '__ai_search_input';
export function AISearchInput(props: ComponentProps<'form'>) {
  const { status, send, stop } = useChatContext();
  const config = useAIConfig();
  const configured = isAIConfigured(config);

  const [input, setInput] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(StorageKeyInput) ?? '';
  });
  const isLoading = status === 'streaming' || status === 'searching';
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    if (!configured) return;
    const message = input.trim();
    if (message.length === 0) return;
    void send(message, location.href);
    setInput('');
    localStorage.removeItem(StorageKeyInput);
  };

  useEffect(() => {
    if (isLoading) document.getElementById('nd-ai-input')?.focus();
  }, [isLoading]);

  const placeholder = !configured
    ? '请先点上方齿轮图标配置 AI 后开始使用'
    : status === 'searching'
      ? '正在检索站内文档...'
      : status === 'streaming'
        ? 'AI 正在回答...'
        : '问点什么...（按 Enter 发送，Shift+Enter 换行）';

  return (
    <form {...props} className={cn('flex items-start pe-2', props.className)} onSubmit={onStart}>
      <Input
        value={input}
        placeholder={placeholder}
        autoFocus
        className="p-3"
        disabled={!configured || isLoading}
        onChange={(e) => {
          setInput(e.target.value);
          localStorage.setItem(StorageKeyInput, e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === 'Enter') {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              className: 'transition-all rounded-full mt-2 gap-2',
            }),
          )}
          onClick={stop}
        >
          <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          停止
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          className={cn(
            buttonVariants({
              color: 'primary',
              className: 'transition-all rounded-full mt-2',
            }),
          )}
          disabled={!configured || input.length === 0}
          title={!configured ? '请先配置 AI' : '发送'}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: Omit<ComponentProps<'div'>, 'dir'>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'instant',
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn('fd-scroll-container overflow-y-auto min-w-0 flex flex-col', props.className)}
    >
      {props.children}
    </div>
  );
}

function Input(props: ComponentProps<'textarea'>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn('col-start-1 row-start-1', props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn(
          'resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed',
          shared,
        )}
      />
      <div ref={ref} className={cn(shared, 'break-all invisible')}>
        {`${props.value?.toString() ?? ''}\n`}
      </div>
    </div>
  );
}

const roleName: Record<string, string> = {
  user: '我',
  assistant: 'AI',
};

function Message({ message, ...props }: { message: UIMessage } & ComponentProps<'div'>) {
  return (
    <div onClick={(e) => e.stopPropagation()} {...props}>
      <p
        className={cn(
          'mb-1 text-sm font-medium text-fd-muted-foreground',
          message.role === 'assistant' && 'text-fd-primary',
        )}
      >
        {roleName[message.role] ?? '未知'}
      </p>
      <div className="prose text-sm">
        <Markdown text={message.content} />
      </div>

      {message.searchMeta && (
        <div className="flex flex-row gap-2 items-center mt-3 rounded-lg border bg-fd-secondary text-fd-muted-foreground text-xs p-2">
          <SearchIcon className="size-4" />
          <p>检索到 {message.searchMeta.count} 条相关文档</p>
        </div>
      )}
    </div>
  );
}

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat();

  return (
    <Context value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}>
      {children}
    </Context>
  );
}

export function AISearchTrigger({
  position = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float' }) {
  const { open, setOpen } = useAISearchContext();

  return (
    <button
      data-state={open ? 'open' : 'closed'}
      className={cn(
        position === 'float' && [
          'fixed bottom-4 gap-3 inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] shadow-lg z-20 transition-[translate,opacity]',
          open && 'translate-y-10 opacity-0',
        ],
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = useAISearchContext();
  const config = useAIConfig();
  const configured = isAIConfigured(config);
  useHotKey();

  return (
    <>
      <style>
        {`
        @keyframes ask-ai-open {
          from {
            translate: 100% 0;
          }
          to {
            translate: 0 0;
          }
        }
        @keyframes ask-ai-close {
          from {
            width: var(--ai-chat-width);
          }
          to {
            width: 0px;
          }
        }`}
      </style>
      <Presence present={open}>
        <div
          className={cn(
            'fixed inset-0 z-30 backdrop-blur-xs bg-fd-overlay lg:hidden',
            open ? 'animate-fd-fade-in' : 'animate-fd-fade-out',
          )}
          onClick={() => setOpen(false)}
        />
      </Presence>
      <Presence present={open}>
        <div
          className={cn(
            'overflow-hidden z-30 bg-fd-card text-fd-card-foreground [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]',
            'max-lg:fixed max-lg:inset-x-2 max-lg:inset-y-4 max-lg:border max-lg:rounded-2xl max-lg:shadow-xl',
            'lg:sticky lg:top-0 lg:h-dvh lg:border-s lg:ms-auto lg:in-[#nd-docs-layout]:[grid-area:toc] lg:in-[#nd-notebook-layout]:row-span-full lg:in-[#nd-notebook-layout]:col-start-5',
            open
              ? 'animate-fd-dialog-in lg:animate-[ask-ai-open_200ms]'
              : 'animate-fd-dialog-out lg:animate-[ask-ai-close_200ms]',
          )}
        >
          <div className="flex flex-col size-full p-2 lg:p-3 lg:w-(--ai-chat-width)">
            <AISearchPanelHeader />
            <AISearchPanelList className="flex-1" />
            {!configured && (
              <div className="mb-2 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>
                  请先点击上方齿轮图标进入配置面板，
                  填入你自己的 AI 服务的 Base URL、API Key 和 Model 后开始使用。
                  你的 Key 仅保存在浏览器本地。
                </span>
              </div>
            )}
            <div className="rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm has-focus-visible:shadow-md">
              <AISearchInput />
              <div className="flex items-center gap-1.5 p-1 empty:hidden">
                <AISearchInputActions />
              </div>
            </div>
          </div>
        </div>
      </Presence>
    </>
  );
}

export function AISearchPanelList({ className, style, ...props }: ComponentProps<'div'>) {
  const chat = useChatContext();

  return (
    <List
      className={cn('py-4 overscroll-contain', className)}
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
        ...style,
      }}
      {...props}
    >
      {chat.messages.length === 0 ? (
        <div className="text-sm text-fd-muted-foreground/80 size-full flex flex-col items-center justify-center text-center gap-2">
          <MessageCircleIcon fill="currentColor" stroke="none" />
          <p onClick={(e) => e.stopPropagation()}>开始一段对话吧</p>
        </div>
      ) : (
        <div className="flex flex-col px-3 gap-4">
          {chat.error && (
            <div className="p-2 bg-fd-secondary text-fd-secondary-foreground border border-red-500/30 rounded-lg">
              <p className="text-xs text-fd-muted-foreground mb-1">
                请求失败：{chat.error.name}
              </p>
              <p className="text-sm whitespace-pre-wrap">{chat.error.message}</p>
            </div>
          )}
          {chat.messages.map((item) => (
            <Message key={item.id} message={item} />
          ))}
        </div>
      )}
    </List>
  );
}

export function useHotKey() {
  const { open, setOpen } = useAISearchContext();

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, []);
}

export function useAISearchContext() {
  return use(Context)!;
}

function useChatContext() {
  return use(Context)!.chat;
}
