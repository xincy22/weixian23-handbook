import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appLogo, appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="text-xl">
            {appLogo}
          </span>
          <span>{appName}</span>
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    links: [
      {
        text: '资源站',
        url: '/docs',
        active: 'nested-url',
      },
    ],
  };
}
