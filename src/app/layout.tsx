import type { Metadata, Viewport } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import { appDescription, appName, appUrl } from '@/lib/shared';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appName,
    template: `%s · ${appName}`,
  },
  description: appDescription,
  keywords: [
    '为先23班',
    '学习资源',
    'AI 工具',
    '科研入门',
    '工科学习',
    'Coding',
  ],
  authors: [{ name: '为先 23 班' }],
  openGraph: {
    type: 'website',
    title: appName,
    description: appDescription,
    siteName: appName,
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description: appDescription,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#660874' },
    { media: '(prefers-color-scheme: dark)', color: '#9b59c0' },
  ],
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
