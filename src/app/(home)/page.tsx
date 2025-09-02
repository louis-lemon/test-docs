import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold">EurekaBox Documentation</h1>
      <p className="text-fd-muted-foreground mb-8 max-w-2xl mx-auto">
        EurekaBox CMS의 문서를 Fumadocs 기반 정적 사이트로 자동 변환하는 시스템입니다.
        GitHub Actions를 통해 자동으로 빌드되고 배포됩니다.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/docs"
          className="px-6 py-3 bg-fd-primary text-fd-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          문서 보기
        </Link>
        <Link
          href="/docs/aws"
          className="px-6 py-3 border border-fd-border rounded-lg font-semibold hover:bg-fd-accent transition-colors"
        >
          AWS 문서
        </Link>
        <Link
          href="/docs/development"
          className="px-6 py-3 border border-fd-border rounded-lg font-semibold hover:bg-fd-accent transition-colors"
        >
          개발 문서
        </Link>
      </div>
      <div className="mt-12 text-sm text-fd-muted-foreground">
        <p>✨ 자동 MDX 생성 | 🎨 카테고리별 구조화 | 🚀 GitHub Pages 배포</p>
      </div>
    </main>
  );
}
