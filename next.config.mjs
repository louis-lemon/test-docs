import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // TypeScript 체크 비활성화
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint 체크 비활성화 (선택사항)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 개발 환경에서는 정적 내보내기 비활성화
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
  // GitHub Pages 배포시 저장소 이름이 서브패스가 됩니다
  basePath: process.env.NODE_ENV === 'production' ? '/test-docs' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/test-docs' : '',
};

export default withMDX(config);
