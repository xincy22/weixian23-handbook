import { ImageResponse } from 'next/og';
import { appLogo } from '@/lib/shared';

// 站点 favicon：构建时把 🪐 emoji 渲染为 32x32 PNG
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
export const dynamic = 'force-static';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          background: 'transparent',
        }}
      >
        {appLogo}
      </div>
    ),
    { ...size },
  );
}
