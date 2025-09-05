#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import yaml from 'js-yaml';
import { fetchDocuments } from '../src/lib/mock-api';
import type { EurekaDocument } from '../src/types/eureka';

// i18n 설정
const I18N_CONFIG = {
  defaultLocale: 'ko',
  locales: ['ko', 'en'],
};

interface EurekaDocumentWithLocales extends EurekaDocument {
  locales?: string[];
}

interface MDFrontmatter {
  title: string;
  description: string;
  id: string;
  no: number;
  order: number;
  category?: string | null;
  subCategory?: string | null;
  tags?: string[];
  created: string;
  updated: string;
  published?: string | null;
  featured: boolean;
  draft: boolean;
  hasChildren: boolean;
  elementCount?: number;
  childCount?: number;
  slug: string;
  locale: string; // 언어 정보 추가
}

interface BuildCache {
  version: string;
  lastBuild: number;
  slugMapping: Record<string, string>;
  documentHashes: Record<string, string>;
  categoryStructure: Record<string, string[]>;
}

interface ProcessingContext {
  slugMap: Map<string, string>;
  documents: Map<string, EurekaDocumentWithLocales>;
  parentChildMap: Map<string, EurekaDocumentWithLocales[]>;
  errors: Array<{ docId: string; error: string }>;
  locale: string; // 현재 처리중인 언어
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');
const CACHE_DIR = path.join(process.cwd(), '.build-cache');
const CACHE_VERSION = '3.0.0'; // 버전 업데이트
const BATCH_SIZE = 10;

// 문서가 특정 locale을 지원하는지 확인
function supportsLocale(doc: EurekaDocumentWithLocales, locale: string): boolean {
  // locales 필드가 없으면 모든 언어 지원
  if (!doc.locales || doc.locales.length === 0) {
    return true;
  }
  return doc.locales.includes(locale);
}

// Slug generation
function generateSlug(doc: EurekaDocument): string {
  if (doc.slug) return doc.slug;

  if (doc.title) {
    return doc.title
            .toLowerCase()
            .replace(/\[.*?\]/g, '')
            .replace(/[^\w\s가-힣-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 60)
        || `doc-${doc.id.toLowerCase()}`;
  }

  return `doc-${doc.id.toLowerCase()}`;
}

function ensureUniqueSlug(slug: string, existingSlugs: Set<string>): string {
  let uniqueSlug = slug;
  let counter = 1;

  while (existingSlugs.has(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  existingSlugs.add(uniqueSlug);
  return uniqueSlug;
}

// Cache management
async function loadOrCreateCache(): Promise<BuildCache> {
  const cachePath = path.join(CACHE_DIR, 'build-cache.json');

  if (fs.existsSync(cachePath)) {
    try {
      const cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      if (cache.version === CACHE_VERSION) {
        return cache;
      }
    } catch (error) {
      console.warn('⚠️  Cache file corrupted, creating new cache');
    }
  }

  return {
    version: CACHE_VERSION,
    lastBuild: 0,
    slugMapping: {},
    documentHashes: {},
    categoryStructure: {}
  };
}

function computeDocumentHash(doc: EurekaDocument): string {
  return crypto
      .createHash('md5')
      .update(JSON.stringify({
        title: doc.title,
        readme: doc.readme,
        category: doc.category,
        subCategory: doc.subCategory,
        keywords: doc.keywords,
        updatedAt: doc.updatedAt
      }))
      .digest('hex');
}

function shouldRebuildDocument(doc: EurekaDocument, cache: BuildCache): boolean {
  return cache.documentHashes[doc.id] !== computeDocumentHash(doc);
}

// Content processing
function extractDescription(content: string, maxLength: number = 160): string {
  const plainText = content
      .replace(/^#{1,6}\s+.*$/gm, '')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
      .replace(/[*_~`]/g, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/\n{2,}/g, ' ')
      .trim();

  const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [];
  let description = '';

  for (const sentence of sentences) {
    const cleaned = sentence.trim();
    if ((description + cleaned).length <= maxLength) {
      description += cleaned + ' ';
    } else if (description.length === 0) {
      // 첫 문장이 너무 길면 잘라서 사용
      description = plainText.substring(0, maxLength - 3) + '...';
      break;
    } else {
      break;
    }
  }

  return description.trim() || plainText.substring(0, maxLength).trim() + '...';
}

function buildDocumentPath(fromDoc: EurekaDocument, toDoc: EurekaDocument, toSlug: string): string {
  const fromCategory = fromDoc.category || 'uncategorized';
  const fromSubCategory = fromDoc.subCategory || 'general';
  const toCategory = toDoc.category || 'uncategorized';
  const toSubCategory = toDoc.subCategory || 'general';

  // 같은 카테고리/서브카테고리
  if (fromCategory === toCategory && fromSubCategory === toSubCategory) {
    return `./${toSlug}`;
  }

  // 같은 카테고리, 다른 서브카테고리
  if (fromCategory === toCategory) {
    return `../${toSubCategory}/${toSlug}`;
  }

  // 다른 카테고리 - 절대 경로 사용
  return `/docs/${toCategory}/${toSubCategory}/${toSlug}`;
}

async function processContent(
    content: string,
    doc: EurekaDocument,
    context: ProcessingContext
): Promise<string> {
  if (!content) return '';

  let processed = content;

  // 내부 링크 변환 - C123 형식을 slug 기반 경로로
  processed = processed.replace(
      /\[([^\]]+)\]\((?:https?:\/\/box\.eureka\.codes\/)?(C\d+)\)/g,
      (match, text, docId) => {
        const targetSlug = context.slugMap.get(docId);
        const targetDoc = context.documents.get(docId);

        if (targetSlug && targetDoc) {
          const path = buildDocumentPath(doc, targetDoc, targetSlug);
          return `[${text}](${path})`;
        }
        return match;
      }
  );

  // 이미지 alt text 개선
  processed = processed.replace(
      /!\[(file|image|그림|사진|)?\]\((https?:\/\/[^)]+)\)/gi,
      (match, alt, url) => {
        if (!alt || alt === 'file' || alt === 'image') {
          try {
            const urlObj = new URL(url);
            const pathSegments = urlObj.pathname.split('/').filter(Boolean);
            const lastSegment = pathSegments[pathSegments.length - 1] || '';

            // UUID 패턴이면 문서 제목 사용
            if (/^[a-f0-9-]{36}$/i.test(lastSegment)) {
              alt = `${doc.title || 'Document'} image`;
            } else {
              alt = lastSegment
                  .replace(/\.[^.]+$/, '')
                  .replace(/[-_]/g, ' ')
                  .trim() || 'image';
            }
          } catch {
            alt = 'image';
          }
        }
        return `![${alt}](${url})`;
      }
  );

  // 중복 H1 제거 (frontmatter title과 중복 방지)
  const lines = processed.split('\n');
  const firstH1Index = lines.findIndex(line => /^#\s+/.test(line));
  if (firstH1Index !== -1 && doc.title) {
    const h1Title = lines[firstH1Index].replace(/^#\s+/, '').trim();
    if (h1Title === doc.title || h1Title.toLowerCase() === doc.title.toLowerCase()) {
      lines.splice(firstH1Index, 1);
      processed = lines.join('\n');
    }
  }

  // 코드 블록 언어 힌트 추가
  processed = processed.replace(
      /```(\s*\n)/g,
      (match, newline, offset) => {
        const nextLine = processed.substring(offset + match.length).split('\n')[0];
        const firstWord = nextLine.trim().split(/\s+/)[0]?.toLowerCase() || '';

        const langMap: Record<string, string> = {
          'import': 'javascript',
          'export': 'javascript',
          'const': 'javascript',
          'let': 'javascript',
          'var': 'javascript',
          'function': 'javascript',
          'class': 'javascript',
          'interface': 'typescript',
          'type': 'typescript',
          'enum': 'typescript',
          'select': 'sql',
          'create': 'sql',
          'insert': 'sql',
          'update': 'sql',
          'delete': 'sql',
          'from': 'python',
          'def': 'python',
          'npm': 'bash',
          'yarn': 'bash',
          'pnpm': 'bash'
        };

        const lang = langMap[firstWord] || 'text';
        return '```' + lang + newline;
      }
  );

  // 특수 문자 정리
  processed = processed
      .replace(/\u00A0/g, ' ')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2014/g, '—')
      .replace(/\u2013/g, '–')
      .replace(/\u2026/g, '...');

  return processed.trim();
}

// 파일 생성
function createFrontmatter(
    doc: EurekaDocumentWithLocales,
    slug: string,
    processedContent: string,
    childCount: number,
    locale: string
): MDFrontmatter {
  const description = doc.description || extractDescription(processedContent);

  return {
    title: doc.title || `Document ${doc.no}`,
    description,
    id: doc.id,
    no: doc.no,
    order: doc.order || doc.no,
    category: doc.category || null,
    subCategory: doc.subCategory || null,
    tags: doc.keywords || [],
    created: new Date(doc.createdAt).toISOString(),
    updated: new Date(doc.updatedAt).toISOString(),
    published: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : null,
    featured: (doc.markCount || 0) > 0,
    draft: !doc.publishedAt,
    hasChildren: childCount > 0,
    elementCount: doc.noOfElement,
    childCount,
    slug,
    locale // 언어 정보 추가
  };
}

async function createMarkdownFile(
    doc: EurekaDocumentWithLocales,
    filePath: string,
    context: ProcessingContext
): Promise<void> {
  const slug = context.slugMap.get(doc.id)!;
  const processedContent = await processContent(doc.readme || '', doc, context);
  const children = context.parentChildMap.get(doc.id) || [];
  const frontmatter = createFrontmatter(doc, slug, processedContent, children.length, context.locale);

  const frontmatterYaml = yaml.dump(frontmatter, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
    noRefs: true,
    sortKeys: false
  });

  const mdContent = `---
${frontmatterYaml.trim()}
---

${processedContent}
`;

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, mdContent, 'utf-8');
  console.log(`✅ [${context.locale}] Created: ${path.relative(process.cwd(), filePath)}`);
}


// 언어별 문서 처리
async function processDocumentsForLocale(
    documents: EurekaDocumentWithLocales[],
    locale: string,
    context: ProcessingContext
): Promise<void> {
  // 현재 언어를 지원하는 문서만 필터링
  const localeDocs = documents.filter(doc => supportsLocale(doc, locale));

  console.log(`\n🌐 Processing ${locale} locale: ${localeDocs.length} documents`);

  for (const doc of localeDocs) {
    try {
      const slug = context.slugMap.get(doc.id)!;
      const parentDoc = doc.parentId ? context.documents.get(doc.parentId) : undefined;

      // 부모 문서도 현재 언어를 지원하는지 확인
      if (parentDoc && !supportsLocale(parentDoc, locale)) {
        console.log(`⚠️  Skipping ${doc.id} - parent doesn't support ${locale}`);
        continue;
      }

      const filePath = getDocumentPath(doc, slug, locale, parentDoc);
      await createMarkdownFile(doc, filePath, context);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      context.errors.push({
        docId: `${doc.id}[${locale}]`,
        error: errorMsg
      });
      console.error(`❌ Failed: ${doc.id}[${locale}] - ${errorMsg}`);
    }
  }
}


// 언어별 카테고리 구조 생성
function generateCategoryStructureForLocale(
    documents: EurekaDocumentWithLocales[],
    locale: string,
    context: ProcessingContext
): void {
  const localePath = path.join(CONTENT_DIR, locale);
  const structure = new Map<string, Map<string, EurekaDocumentWithLocales[]>>();

  // 현재 언어를 지원하는 문서만 처리
  documents
      .filter(doc => supportsLocale(doc, locale))
      .forEach(doc => {
        if (doc.parentId) return;

        const category = doc.category || 'uncategorized';
        const subCategory = doc.subCategory || 'general';

        if (!structure.has(category)) {
          structure.set(category, new Map());
        }

        const categoryMap = structure.get(category)!;
        if (!categoryMap.has(subCategory)) {
          categoryMap.set(subCategory, []);
        }

        categoryMap.get(subCategory)!.push(doc);
      });

  // 카테고리별 _meta.json 생성
  structure.forEach((subCategories, category) => {
    const categoryDir = path.join(localePath, sanitizePath(category));

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const subCategoryMetas: Array<{ slug: string; title: string; order: number }> = [];

    subCategories.forEach((docs, subCategory) => {
      const sanitizedSubCategory = sanitizePath(subCategory);
      const subCategoryDir = path.join(categoryDir, sanitizedSubCategory);

      if (!fs.existsSync(subCategoryDir)) {
        fs.mkdirSync(subCategoryDir, { recursive: true });
      }

      const items = docs
          .filter(doc => !doc.parentId)
          .map(doc => {
            const hasChildren = context.parentChildMap.has(doc.id) &&
                context.parentChildMap.get(doc.id)!.some(child => supportsLocale(child, locale));
            return {
              slug: doc.id,
              title: doc.title || `Document ${doc.no}`,
              order: doc.order || doc.no,
              type: hasChildren ? 'folder' : undefined
            };
          });

      // 부모-자식 구조 처리
      docs.forEach(async doc => {
        const children = context.parentChildMap.get(doc.id);
        if (children) {
          const localeChildren = children.filter(child => supportsLocale(child, locale));
          if (localeChildren.length > 0) {
            const parentDir = path.join(subCategoryDir, doc.id);

            if (!fs.existsSync(parentDir)) {
              fs.mkdirSync(parentDir, { recursive: true });
            }

            // index.md 생성
            const indexPath = path.join(parentDir, 'index.md');
            const indexContext = { ...context, locale };
            await createMarkdownFile(doc, indexPath, indexContext);

            // 자식 문서들
            for (const child of localeChildren) {
              const childPath = path.join(parentDir, `${child.id}.md`);
              await createMarkdownFile(child, childPath, indexContext);
            }

            // _meta.json
            const childItems = localeChildren.map(child => ({
              slug: child.id,
              title: child.title || `Document ${child.no}`,
              order: child.order || child.no
            }));

            createMetaJson(parentDir, childItems);
          }
        }
      });

      if (items.length > 0) {
        createMetaJson(subCategoryDir, items);
        subCategoryMetas.push({
          slug: sanitizedSubCategory,
          title: subCategory,
          order: 0
        });
      }
    });

    if (subCategoryMetas.length > 0) {
      createMetaJson(categoryDir, subCategoryMetas);
    }
  });

  // 루트 _meta.json
  const rootCategories = Array.from(structure.keys()).map(cat => ({
    slug: sanitizePath(cat),
    title: cat,
    order: 0
  }));

  if (rootCategories.length > 0) {
    createMetaJson(localePath, rootCategories);
  }
}


function getDocumentPath(
    doc: EurekaDocumentWithLocales,
    slug: string,
    locale: string,
    parentDoc?: EurekaDocumentWithLocales
): string {
  const fileName = `${doc.id}.md`;
  const localePath = path.join(CONTENT_DIR, locale); // docs/{locale}

  if (parentDoc) {
    const parentCategory = sanitizePath(parentDoc.category || 'uncategorized');
    const parentSubCategory = sanitizePath(parentDoc.subCategory || 'general');
    return path.join(localePath, parentCategory, parentSubCategory, parentDoc.id, fileName);
  }

  const category = sanitizePath(doc.category || 'uncategorized');
  const subCategory = sanitizePath(doc.subCategory || 'general');
  return path.join(localePath, category, subCategory, fileName);
}

function sanitizePath(str: string): string {
  const clean = str
      .toLowerCase()
      .replace(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g, '') // 한글 제거
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');

  if (!clean) {
    return 'cat-' + crypto.createHash('md5').update(str).digest('hex').substring(0, 6);
  }

  return clean;
}

// Meta 파일 생성
function createMetaJson(
    dirPath: string,
    items: Array<{ slug: string; title: string; order?: number; type?: string }>
): void {
  const meta = {
    pages: items
        .sort((a, b) => (a.order || 999) - (b.order || 999))
        .map(item => ({
          name: item.slug,
          title: item.title,
          ...(item.type && { type: item.type })
        }))
  };

  fs.writeFileSync(
      path.join(dirPath, '_meta.json'),
      JSON.stringify(meta, null, 2),
      'utf-8'
  );
}

// 배치 처리
async function processBatch(
    documents: EurekaDocument[],
    context: ProcessingContext
): Promise<void> {
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);

    await Promise.all(
        batch.map(async (doc) => {
          try {
            const slug = context.slugMap.get(doc.id)!;
            const parentDoc = doc.parentId ? context.documents.get(doc.parentId) : undefined;
            const parentSlug = parentDoc ? context.slugMap.get(parentDoc.id) : undefined;
            const filePath = getDocumentPath(doc, slug, parentDoc, parentSlug);

            await createMarkdownFile(doc, filePath, context);
          } catch (error) {
            context.errors.push({
              docId: doc.id,
              error: error instanceof Error ? error.message : String(error)
            });
            console.error(`❌ Failed: ${doc.id} - ${error}`);
          }
        })
    );

    const progress = Math.min(i + BATCH_SIZE, documents.length);
    console.log(`📦 Processed ${progress}/${documents.length} documents`);
  }
}

// 카테고리 구조 생성
function generateCategoryStructure(
    documents: EurekaDocument[],
    context: ProcessingContext
): Map<string, Map<string, EurekaDocument[]>> {
  const structure = new Map<string, Map<string, EurekaDocument[]>>();

  documents.forEach(doc => {
    if (doc.parentId) return; // 자식 문서는 스킵

    const category = doc.category || 'uncategorized';
    const subCategory = doc.subCategory || 'general';

    if (!structure.has(category)) {
      structure.set(category, new Map());
    }

    const categoryMap = structure.get(category)!;
    if (!categoryMap.has(subCategory)) {
      categoryMap.set(subCategory, []);
    }

    categoryMap.get(subCategory)!.push(doc);
  });

  return structure;
}

async function generateMarkdown(): Promise<void> {
  console.log('🚀 Starting Multi-locale Markdown generation...\n');

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  // 기존 content 백업 및 재생성
  const indexMdPath = path.join(CONTENT_DIR, 'index.md');
  let indexMdContent: string | null = null;
  if (fs.existsSync(indexMdPath)) {
    indexMdContent = fs.readFileSync(indexMdPath, 'utf-8');
  }

  if (fs.existsSync(CONTENT_DIR)) {
    fs.rmSync(CONTENT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  if (indexMdContent) {
    fs.writeFileSync(indexMdPath, indexMdContent, 'utf-8');
  }

  const cache = await loadOrCreateCache();
  const response = await fetchDocuments(true);
  const documents = response.list as EurekaDocumentWithLocales[];

  console.log(`📚 Fetched ${documents.length} documents`);

  // 각 언어별로 처리
  for (const locale of I18N_CONFIG.locales) {
    const context: ProcessingContext = {
      slugMap: new Map(Object.entries(cache.slugMapping)),
      documents: new Map(documents.map(d => [d.id, d])),
      parentChildMap: new Map(),
      errors: [],
      locale
    };

    // 부모-자식 관계 구축
    documents.forEach(doc => {
      if (doc.parentId) {
        if (!context.parentChildMap.has(doc.parentId)) {
          context.parentChildMap.set(doc.parentId, []);
        }
        context.parentChildMap.get(doc.parentId)!.push(doc);
      }
    });

    // slug 생성
    const existingSlugs = new Set(context.slugMap.values());
    documents.forEach(doc => {
      if (!context.slugMap.has(doc.id)) {
        const slug = ensureUniqueSlug(generateSlug(doc), existingSlugs);
        context.slugMap.set(doc.id, slug);
      }
    });

    // 언어별 문서 처리
    await processDocumentsForLocale(documents, locale, context);

    // 언어별 카테고리 구조 생성
    generateCategoryStructureForLocale(documents, locale, context);

    if (context.errors.length > 0) {
      console.error(`⚠️  ${context.errors.length} errors in ${locale}`);
    }
  }

  console.log('\n✨ Multi-locale Markdown generation completed!');
}

// 에러 핸들링
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// 실행
generateMarkdown().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
