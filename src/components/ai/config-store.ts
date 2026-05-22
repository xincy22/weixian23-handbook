'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

export interface AIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

const STORAGE_KEY = 'weixian23.ai-config';

const EMPTY_CONFIG: AIConfig = {
  baseURL: '',
  apiKey: '',
  model: '',
};

// === pub/sub for cross-component sync ===
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getServerSnapshot(): AIConfig {
  return EMPTY_CONFIG;
}

function getSnapshot(): AIConfig {
  if (typeof window === 'undefined') return EMPTY_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      baseURL: typeof parsed.baseURL === 'string' ? parsed.baseURL : '',
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' ? parsed.model : '',
    };
  } catch {
    return EMPTY_CONFIG;
  }
}

// 监听 storage 事件（多标签页同步）
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) emit();
  });
}

export function useAIConfig() {
  // 用一个简单的 cache 解决 useSyncExternalStore 的 snapshot 必须稳定的要求
  const [cache, setCache] = useState<AIConfig>(EMPTY_CONFIG);

  useEffect(() => {
    setCache(getSnapshot());
    return subscribe(() => setCache(getSnapshot()));
  }, []);

  return cache;
}

export function saveAIConfig(config: AIConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save AI config:', err);
  }
  emit();
}

export function clearAIConfig() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  emit();
}

export function isAIConfigured(config: AIConfig) {
  return Boolean(config.baseURL && config.apiKey && config.model);
}

/** 推荐的预设（点击一键填入） */
export const PRESETS: Array<{
  name: string;
  baseURL: string;
  models: string[];
  hint?: string;
}> = [
  {
    name: 'DeepSeek 官方',
    baseURL: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    hint: '最便宜，¥0.14/M token，需在 platform.deepseek.com 注册',
  },
  {
    name: 'OpenAI 官方',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-5'],
    hint: '需要美区信用卡',
  },
  {
    name: '阿里云百炼',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo'],
    hint: '国内直连，注册即送免费额度',
  },
];
