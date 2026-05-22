'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Trash2, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buttonVariants } from '../ui/button';
import {
  type AIConfig,
  clearAIConfig,
  isAIConfigured,
  PRESETS,
  saveAIConfig,
  useAIConfig,
} from './config-store';

/**
 * AI 设置对话框（弹窗形态）
 * 由调用方控制 open 状态，便于嵌入到任何位置（如 AI 面板的头部）
 */
export function AISettingsDialog({ onClose }: { onClose: () => void }) {
  const config = useAIConfig();
  const [draft, setDraft] = useState<AIConfig>(config);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  // ESC 关闭
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = () => {
    saveAIConfig(draft);
    onClose();
  };

  const handleClear = () => {
    if (!confirm('确定清除 AI 配置吗？')) return;
    clearAIConfig();
    setDraft({ baseURL: '', apiKey: '', model: '' });
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setDraft({
      baseURL: preset.baseURL,
      apiKey: draft.apiKey, // 保留已填的 key
      model: draft.model || preset.models[0],
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* 对话框 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-settings-title"
        className="relative w-full max-w-lg rounded-2xl border border-fd-border bg-fd-popover p-6 text-fd-popover-foreground shadow-2xl"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 id="ai-settings-title" className="text-lg font-semibold">
            AI 问答配置
          </h2>
          <button
            onClick={onClose}
            className="text-fd-muted-foreground hover:text-fd-foreground"
            aria-label="关闭"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mb-4 flex items-start gap-1.5 text-xs text-fd-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
          <span>
            你的 Key 仅保存在你自己的浏览器（localStorage）。本站和服务器
            <strong className="font-medium">从不存储</strong>你的 Key。
            每次问答时 Key 仅在你的请求中转发到你填的 Base URL。
          </span>
        </p>

        {/* 预设快捷选择 */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-fd-muted-foreground">
            快速填入预设
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                title={p.hint}
                className="rounded-full border border-fd-border bg-fd-secondary px-3 py-1 text-xs text-fd-secondary-foreground hover:border-fd-primary/50 hover:bg-fd-accent"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* 表单 */}
        <div className="space-y-3">
          <Field
            label="Base URL"
            value={draft.baseURL}
            onChange={(v) => setDraft({ ...draft, baseURL: v })}
            placeholder="https://api.deepseek.com/v1"
            description="OpenAI 兼容的 API 端点，必须包含 /v1"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={draft.apiKey}
                onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 pr-10 text-sm font-mono outline-none focus:border-fd-primary focus:ring-2 focus:ring-fd-primary/20"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
                title={showKey ? '隐藏' : '显示'}
                aria-label={showKey ? '隐藏 Key' : '显示 Key'}
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Field
            label="Model"
            value={draft.model}
            onChange={(v) => setDraft({ ...draft, model: v })}
            placeholder="deepseek-chat"
            description="模型名称，按你选的服务商支持的填"
          />
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {isAIConfigured(config) ? (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 text-xs text-fd-muted-foreground hover:text-red-500"
            >
              <Trash2 className="size-3.5" />
              清除配置
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                buttonVariants({ color: 'secondary', size: 'sm' }),
                'rounded-full',
              )}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.baseURL || !draft.apiKey || !draft.model}
              className={cn(
                buttonVariants({ color: 'primary', size: 'sm' }),
                'rounded-full disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  description,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  description?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-sm outline-none focus:border-fd-primary focus:ring-2 focus:ring-fd-primary/20"
        autoComplete="off"
        spellCheck={false}
      />
      {description && (
        <p className="mt-1 text-xs text-fd-muted-foreground">{description}</p>
      )}
    </div>
  );
}
