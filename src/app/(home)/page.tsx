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
      className="w-full max-w-lg mx-auto flex items-center gap-3 p-4 bg-fd-card/80 backdrop-blur border border-fd-border rounded-xl shadow-lg hover:shadow-xl hover:border-fd-primary/50 transition-all duration-300 group cursor-pointer"
    >
      <svg 
        className="h-5 w-5 text-fd-muted-foreground group-hover:text-fd-primary transition-colors" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="flex-1 text-left text-fd-muted-foreground group-hover:text-fd-foreground transition-colors">
        Search documentation...
      </span>
      <div className="hidden sm:flex items-center gap-1 text-xs text-fd-muted-foreground">
        <kbd className="px-2 py-1 bg-fd-muted/50 rounded border text-xs font-mono">
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="px-2 py-1 bg-fd-muted/50 rounded border text-xs font-mono">K</kbd>
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
      className="group p-6 bg-fd-card text-fd-card-foreground rounded-lg border border-fd-border hover:border-fd-primary/50 hover:bg-fd-accent/50 transition-all duration-200"
    >
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-fd-primary transition-colors">{title}</h3>
      <p className="text-fd-muted-foreground text-sm leading-relaxed">{description}</p>
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
      className="group p-5 bg-fd-card text-fd-card-foreground rounded-lg border border-fd-border hover:border-fd-primary/50 hover:bg-fd-accent/50 transition-all duration-200"
    >
      <div className="text-xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2 group-hover:text-fd-primary transition-colors">{title}</h3>
      <p className="text-fd-muted-foreground text-xs leading-relaxed">{description}</p>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient with subtle pattern - theme-aware */}
        <div className="absolute inset-0 bg-gradient-to-br from-fd-primary/5 via-fd-background to-fd-accent/10" />
        <div className="absolute inset-0 opacity-20 dark:opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(var(--fd-foreground),0.1)_1px,transparent_0)] bg-[length:24px_24px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-fd-foreground to-fd-muted-foreground bg-clip-text text-transparent">
            Welcome to EurekaBox
          </h1>
          <p className="text-xl md:text-2xl text-fd-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Learn more about EurekaBox to transform how you build and document software systems
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <SearchButton />
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Get started in 5 minutes</h2>
          <p className="text-fd-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your preferred way to explore EurekaBox documentation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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
      <section className="py-16 px-6 max-w-7xl mx-auto w-full bg-fd-accent/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose a topic below or get started in 5 minutes</h2>
          <p className="text-fd-muted-foreground text-lg max-w-3xl mx-auto">
            Explore comprehensive guides and tutorials for every aspect of EurekaBox
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <section className="py-16 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="text-sm text-fd-muted-foreground space-y-2">
          <p className="text-lg font-medium mb-4">Key Features</p>
          <div className="flex flex-wrap justify-center gap-6 text-base">
            <span className="flex items-center gap-2">
              <span className="text-green-500">✨</span>
              자동 MDX 생성
            </span>
            <span className="flex items-center gap-2">
              <span className="text-blue-500">🎨</span>
              카테고리별 구조화
            </span>
            <span className="flex items-center gap-2">
              <span className="text-purple-500">🚀</span>
              GitHub Pages 배포
            </span>
            <span className="flex items-center gap-2">
              <span className="text-orange-500">📱</span>
              반응형 디자인
            </span>
            <span className="flex items-center gap-2">
              <span className="text-indigo-500">🔍</span>
              전문 검색
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
