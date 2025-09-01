import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // GitHub Pages 배포시 저장소 이름이 서브패스가 됩니다
  basePath: process.env.NODE_ENV === 'production' ? '/test-docs' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/test-docs' : '',
};

export default withMDX(config);
