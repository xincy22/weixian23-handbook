import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ModuleCard, ModuleCards } from './module-card';
import { AnimatedLink } from './animated-link';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // 文档正文链接的磁吸效果
    a: AnimatedLink,
    // 自定义紫色渐变模块卡片，全局可用，无需在每个 mdx 里 import
    ModuleCard,
    ModuleCards,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
