import Link from 'next/link';
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
import { SearchButton } from "@/components/search-button";
import { QuickStartCard, TopicCard } from "@/components/card";

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
                Welcome to <span className="text-orange-400">LemonCloud</span>
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
