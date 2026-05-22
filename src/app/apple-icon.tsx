import { ImageResponse } from 'next/og';
import { appLogo } from '@/lib/shared';

// iOS 主屏图标：180x180 PNG，配清华紫底色让 emoji 更显眼
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons
export const dynamic = 'force-static';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 140,
          background: '#660874',
        }}
      >
        {appLogo}
      </div>
    ),
    { ...size },
  );
}
