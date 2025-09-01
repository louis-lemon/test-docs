import { MetadataRoute } from 'next';

// Static export를 위한 설정
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://louis-lemon.github.io/test-docs';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/_next/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}