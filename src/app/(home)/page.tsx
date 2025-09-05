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
      className="w-full flex items-center gap-3 p-4 bg-fd-background/95 backdrop-blur-sm border border-fd-border rounded-xl hover:bg-fd-background hover:shadow-lg transition-all duration-200 group cursor-pointer"
    >
      <svg
        className="h-5 w-5 text-fd-muted-foreground group-hover:text-fd-primary transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="flex-1 text-left text-fd-muted-foreground group-hover:text-fd-foreground transition-colors font-medium">
        Search documentation...
      </span>
      <div className="hidden sm:flex items-center gap-1 text-xs text-fd-muted-foreground">
        <kbd className="px-2 py-1 bg-fd-muted rounded border text-xs font-mono">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="px-2 py-1 bg-fd-muted rounded border text-xs font-mono">K</kbd>
      </div>
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
      <section className="relative min-h-screen">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2672&q=80")',
          }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main heading with white text */}
            <div className="space-y-6 mb-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
                Welcome to
                <span className="block text-blue-400 mt-2">EurekaBox</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">
                Transform how you build and document software systems with intelligent automation
              </p>
            </div>

            {/* Floating Search Bar */}
            <div className="max-w-xl mx-auto mb-16">
                <SearchButton />
            </div>

            {/* Feature highlights with white text */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Intelligent Documentation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>GitHub Integration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Static Site Generation</span>
              </div>
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
