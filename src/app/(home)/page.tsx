'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Globe,
  Cloud,
  Wrench,
  BookOpen,
  Bot,
  Zap,
  Lightbulb,
  Search,
  Compass
} from 'lucide-react';
import ShaderBackground from "@/components/shader-background";

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
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card block font-normal group relative my-2 rounded-2xl bg-white dark:bg-fd-card border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 overflow-hidden w-full cursor-pointer transition-all"
    >
      <div className="px-6 py-5 relative">
        <div className="absolute text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M7 7h10v10"></path>
            <path d="M7 17 17 7"></path>
          </svg>
        </div>
        <div className="h-6 w-6 mb-4 text-gray-700 dark:text-gray-300">
          {icon}
        </div>
        <div>
          <h2 className="not-prose font-semibold text-base text-gray-800 dark:text-white mt-4">
            {title}
          </h2>
          <div className="mt-1 font-normal text-sm leading-6 text-gray-600 dark:text-gray-400">
            <span>{description}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function TopicCard({ title, description, href, icon }: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card block font-normal group relative my-2 rounded-2xl bg-white dark:bg-fd-card border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 overflow-hidden w-full cursor-pointer transition-all"
    >
      <div className="px-6 py-5 relative">
        <div className="absolute text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M7 7h10v10"></path>
            <path d="M7 17 17 7"></path>
          </svg>
        </div>
        <div className="h-6 w-6 mb-4 text-gray-700 dark:text-gray-300">
          {icon}
        </div>
        <div>
          <h2 className="not-prose font-semibold text-base text-gray-800 dark:text-white mt-4">
            {title}
          </h2>
          <div className="mt-1 font-normal text-sm leading-6 text-gray-600 dark:text-gray-400">
            <span>{description}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero Section with Background Image */}
      <section className="relative" style={{ height: '24rem' }}>
        <ShaderBackground>
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
        </ShaderBackground>
      </section>

      {/* Origin Section */}
      {/*<section className="relative" style={{ height: '24rem' }}>*/}
      {/*  /!* Background Image *!/*/}
      {/*  <div*/}
      {/*    className="absolute inset-0 bg-cover bg-center bg-no-repeat"*/}
      {/*    style={{*/}
      {/*      backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2672&q=80")',*/}
      {/*    }}*/}
      {/*  />*/}
      {/*  /!* Dark Overlay *!/*/}
      {/*  <div className="absolute inset-0 bg-black/60" />*/}
      {/*  /!* Content *!/*/}
      {/*  <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">*/}
      {/*    <div className="text-center">*/}
      {/*      /!* Main heading with white text *!/*/}
      {/*      <h1 className="text-white font-semibold" style={{ fontSize: '28px', margin: 0 }}>*/}
      {/*        Welcome to <span className="text-blue-400">EurekaBox</span>*/}
      {/*      </h1>*/}
      {/*      <p className="text-white font-normal mt-4 max-w-2xl mx-auto" style={{ fontSize: '16px' }}>*/}
      {/*        Transform how you build and document software systems with intelligent automation*/}
      {/*      </p>*/}
      {/*      /!* Floating Search Bar *!/*/}
      {/*      <div className="max-w-xl mx-auto mt-8">*/}
      {/*          <SearchButton />*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}

      {/* Quick Start Section */}
      <section className="my-12 mx-auto max-w-6xl px-5">
        <p className="text-gray-900 dark:text-gray-200 text-left mt-4 text-2xl mb-4 font-semibold">
          Get started in 5 minutes
        </p>

        <div>
          <div className="not-prose grid gap-x-4 sm:grid-cols-3">
            <QuickStartCard
              title="Web Interface"
              description="Get up and running with EurekaBox's web documentation interface in 5 minutes"
              href="/docs"
              icon={<Globe className="w-6 h-6" />}
            />
            <QuickStartCard
              title="AWS Integration"
              description="Learn how to integrate EurekaBox with AWS services and infrastructure"
              href="/docs/aws"
              icon={<Cloud className="w-6 h-6" />}
            />
            <QuickStartCard
              title="Development Guide"
              description="Start developing with EurekaBox using our comprehensive development documentation"
              href="/docs/development"
              icon={<Wrench className="w-6 h-6" />}
            />
          </div>
        </div>

        {/* Topics Section */}
        <p className="text-gray-900 dark:text-gray-200 text-left mt-10 text-2xl mb-4 font-semibold">
          Choose a topic below or <Link href="/docs" className="text-primary dark:text-primary-light">get started in 5 minutes</Link>
        </p>

        <div className="not-prose grid gap-x-4 sm:grid-cols-3">
          <TopicCard
            title="Managing Context"
            description="Learn how to bring together and manage context from across your documentation system"
            href="/docs"
            icon={<BookOpen className="w-6 h-6" />}
          />
          <TopicCard
            title="EurekaBox CMS"
            description="Specialized content management system designed for technical documentation"
            href="/docs"
            icon={<Bot className="w-6 h-6" />}
          />
          <TopicCard
            title="GitHub Integration"
            description="Master EurekaBox's seamless integration with GitHub Actions and workflows"
            href="/docs"
            icon={<Zap className="w-6 h-6" />}
          />
          <TopicCard
            title="Use Cases"
            description="Explore real-world applications and examples of EurekaBox implementations"
            href="/docs"
            icon={<Lightbulb className="w-6 h-6" />}
          />
          <TopicCard
            title="Static Site Generation"
            description="Allow EurekaBox to automatically generate static documentation sites"
            href="/docs"
            icon={<Search className="w-6 h-6" />}
          />
          <TopicCard
            title="Deployment Guide"
            description="Leverage GitHub Pages and automated deployment for your documentation"
            href="/docs"
            icon={<Compass className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* TODO: add some Section */}
      <section className="py-10 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="text-fd-muted-foreground space-y-4">
        </div>
      </section>
    </main>
  );
}
