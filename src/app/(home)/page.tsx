'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Search button component that integrates with Fumadocs search
function SearchButton() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const handleSearchClick = () => {
    // Trigger the same keyboard shortcut that Fumadocs uses
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleSearchClick}
      className="flex w-full max-w-2xl items-center text-sm leading-6 rounded-lg py-1.5 pl-2.5 pr-3 shadow-sm text-gray-400 dark:text-white/50 bg-fd-background dark:bg-fd-background hover:ring-gray-600/25 dark:hover:ring-gray-500/30 ring-1 ring-gray-400/20 dark:ring-gray-600/30 transition-all cursor-pointer"
    >
      <svg
        className="h-4 w-4 ml-1.5 mr-3 flex-none bg-gray-500 hover:bg-gray-600 dark:bg-white/50 dark:hover:bg-white/70"
        style={{
          maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke-width=\'1.5\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z\' /%3E%3C/svg%3E")',
          maskRepeat: 'no-repeat',
          maskPosition: 'center'
        }}
      />
      <span>Search or ask anything</span>
    </button>
  );
}

// Card components for quick start and topics
function QuickStartCard({ title, description, href, icon }: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group p-8 bg-fd-card rounded-2xl border border-fd-border hover:border-fd-primary/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-fd-foreground group-hover:text-fd-primary transition-colors">{title}</h3>
      <p className="text-fd-muted-foreground text-base leading-relaxed">{description}</p>
    </Link>
  );
}

function TopicCard({ title, description, href, icon }: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group p-6 bg-fd-card rounded-xl border border-fd-border hover:border-fd-primary/50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="text-2xl mb-4">{icon}</div>
      <h3 className="font-bold mb-3 text-fd-foreground group-hover:text-fd-primary transition-colors">{title}</h3>
      <p className="text-fd-muted-foreground text-sm leading-relaxed">{description}</p>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section with Background Image */}
      <section className="relative" style={{ height: '24rem' }}>
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2672&q=80")',
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
          <div className="text-center">
            {/* Main heading with white text */}
            <h1 className="text-white font-semibold" style={{ fontSize: '28px', margin: 0 }}>
              Welcome to <span className="text-blue-400">EurekaBox</span>
            </h1>
            <p className="text-white font-normal mt-4 max-w-2xl mx-auto" style={{ fontSize: '16px' }}>
              Transform how you build and document software systems with intelligent automation
            </p>

            {/* Floating Search Bar */}
            <div className="max-w-xl mx-auto mt-8">
                <SearchButton />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-fd-foreground">Get started in 5 minutes</h2>
          <p className="text-fd-muted-foreground text-xl max-w-2xl mx-auto">
            Choose your preferred way to explore EurekaBox documentation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <QuickStartCard
            title="Web Interface"
            description="Get up and running with EurekaBox's web documentation interface in 5 minutes"
            href="/docs"
            icon="🌐"
          />
          <QuickStartCard
            title="AWS Integration"
            description="Learn how to integrate EurekaBox with AWS services and infrastructure"
            href="/docs/aws"
            icon="☁️"
          />
          <QuickStartCard
            title="Development Guide"
            description="Start developing with EurekaBox using our comprehensive development documentation"
            href="/docs/development"
            icon="🛠️"
          />
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full bg-fd-muted/20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-fd-foreground">Choose a topic below or get started in 5 minutes</h2>
          <p className="text-fd-muted-foreground text-xl max-w-3xl mx-auto">
            Explore comprehensive guides and tutorials for every aspect of EurekaBox
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TopicCard
            title="Managing Context"
            description="Learn how to bring together and manage context from across your documentation system"
            href="/docs"
            icon="📚"
          />
          <TopicCard
            title="EurekaBox CMS"
            description="Specialized content management system designed for technical documentation"
            href="/docs"
            icon="🤖"
          />
          <TopicCard
            title="GitHub Integration"
            description="Master EurekaBox's seamless integration with GitHub Actions and workflows"
            href="/docs"
            icon="⚡"
          />
          <TopicCard
            title="Use Cases"
            description="Explore real-world applications and examples of EurekaBox implementations"
            href="/docs"
            icon="💡"
          />
          <TopicCard
            title="Static Site Generation"
            description="Allow EurekaBox to automatically generate static documentation sites"
            href="/docs"
            icon="🔍"
          />
          <TopicCard
            title="Deployment Guide"
            description="Leverage GitHub Pages and automated deployment for your documentation"
            href="/docs"
            icon="🧭"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="text-fd-muted-foreground space-y-4">
          <p className="text-2xl font-semibold mb-8 text-fd-foreground">Key Features</p>
          <div className="flex flex-wrap justify-center gap-8 text-lg">
            <span className="flex items-center gap-3">
              <span className="text-green-500 text-xl">✨</span>
              자동 MDX 생성
            </span>
            <span className="flex items-center gap-3">
              <span className="text-blue-500 text-xl">🎨</span>
              카테고리별 구조화
            </span>
            <span className="flex items-center gap-3">
              <span className="text-purple-500 text-xl">🚀</span>
              GitHub Pages 배포
            </span>
            <span className="flex items-center gap-3">
              <span className="text-orange-500 text-xl">📱</span>
              반응형 디자인
            </span>
            <span className="flex items-center gap-3">
              <span className="text-indigo-500 text-xl">🔍</span>
              전문 검색
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
