# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Package Manager**: This project uses Yarn (v1.22.22)

- `yarn dev` - Start development server with Turbo mode
- `yarn build` - Build production application  
- `yarn start` - Start production server
- `yarn deploy` - Build for GitHub Pages deployment
- `yarn postinstall` - Run Fumadocs MDX processing (runs automatically after install)

**Development Server**: Runs on http://localhost:3000

## Architecture Overview

This is a **Fumadocs** documentation site built on **Next.js 15** with **React 19**. Fumadocs is a modern documentation framework that combines MDX content with a polished UI.

### Core Architecture

**Content System**:
- Documentation content lives in `/content/docs/` as MDX files
- Content is processed by Fumadocs MDX system via `source.config.ts`
- The `source.ts` file creates a loader that provides the content source API to the app

**App Structure**:
- `/app/(home)/` - Landing page route group
- `/app/docs/` - Documentation pages with dynamic routing via `[[...slug]]`

**Key Files**:
- `src/lib/source.ts` - Content source adapter using Fumadocs loader with `/docs` base URL
- `src/lib/layout.shared.tsx` - Shared layout configuration including navigation and branding
- `src/components/provider.tsx` - Custom provider with static search configuration
- `src/app/api/search/route.ts` - Static search API using `staticGET` from Fumadocs
- `source.config.ts` - MDX processing configuration with schema definitions

### Content Management

**MDX Processing**: The postinstall script runs `fumadocs-mdx` to process MDX files and generate the content source at `/.source/index.ts` (referenced via TypeScript path mapping).

**Frontmatter Schema**: Customizable via `source.config.ts` using Zod schemas for both frontmatter and `meta.json` files.

### Styling & UI

- **Fumadocs UI**: Pre-built components for documentation UX
- **Tailwind CSS 4.x**: Latest version for styling
- **PostCSS**: Configuration in `postcss.config.mjs`

### TypeScript Configuration

Uses path mapping with `@/*` pointing to `./src/*` and `@/.source` pointing to the generated content source.

## GitHub Pages Deployment

This site is configured for automatic deployment to GitHub Pages using gh-pages branch:

**Configuration**:
- `next.config.mjs` - Configured for static export with SEO optimizations:
  - `output: 'export'` for static site generation
  - `basePath` and `assetPrefix` for GitHub Pages subdirectory support
  - Unoptimized images for static hosting
- `.github/workflows/deploy.yml` - Uses `peaceiris/actions-gh-pages` for gh-pages deployment
- `.nojekyll` - Prevents Jekyll processing for GitHub Pages

**SEO Features**:
- `src/app/layout.tsx` - Comprehensive metadata including OpenGraph and Twitter cards
- `src/app/sitemap.ts` - Automatic sitemap generation from Fumadocs content (with `dynamic = 'force-static'`)
- `src/app/robots.ts` - SEO-friendly robots.txt configuration (with `dynamic = 'force-static'`)
- Structured data and meta tags for better search engine indexing

**Static Export Considerations**:
- API routes require `export const dynamic = 'force-static'` for static export compatibility
- Search functionality uses static search with `staticGET` instead of regular API routes
- Client-side search configured with `type: 'static'` in the Provider
- `@orama/orama` package required for static search functionality

**Deployment Process**:
1. Push to `main` branch triggers GitHub Actions
2. Site is built and deployed to `gh-pages` branch
3. GitHub Pages serves from gh-pages branch
4. Site is available at `https://louis-lemon.github.io/test-docs`

**Setup Requirements**:
- Repository Settings → Pages → Source: "Deploy from a branch"
- Select "gh-pages" branch and "/ (root)" folder