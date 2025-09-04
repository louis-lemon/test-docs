#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import yaml from 'js-yaml';
import { fetchDocuments, fetchDocument, fetchCategories, fetchChangedDocuments } from '../src/lib/mock-api';
import type { EurekaDocument, EurekaApiResponse } from '../src/types/eureka';

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
  documents: Map<string, EurekaDocument>;
  parentChildMap: Map<string, EurekaDocument[]>;
  errors: Array<{ docId: string; error: string }>;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');
const CACHE_DIR = path.join(process.cwd(), '.build-cache');
const CACHE_VERSION = '2.0.0';
const BATCH_SIZE = 10;

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
    doc: EurekaDocument,
    slug: string,
    processedContent: string,
    childCount: number = 0
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
    slug
  };
}

async function createMarkdownFile(
    doc: EurekaDocument,
    filePath: string,
    context: ProcessingContext
): Promise<void> {
  const slug = context.slugMap.get(doc.id)!;
  const processedContent = await processContent(doc.readme || '', doc, context);
  const children = context.parentChildMap.get(doc.id) || [];
  const frontmatter = createFrontmatter(doc, slug, processedContent, children.length);

  // yaml 덤프 시 옵션
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
  console.log(`✅ Created: ${path.relative(process.cwd(), filePath)}`);
}

function getDocumentPath(
    doc: EurekaDocument,
    slug: string,
    parentDoc?: EurekaDocument,
    parentSlug?: string
): string {
  // 파일명은 항상 ID 사용
  const fileName = `${doc.id}.md`;

  if (parentDoc) {
    const parentCategory = sanitizePath(parentDoc.category || 'uncategorized');
    const parentSubCategory = sanitizePath(parentDoc.subCategory || 'general');
    // 부모 폴더도 ID 사용
    return path.join(CONTENT_DIR, parentCategory, parentSubCategory, parentDoc.id, fileName);
  }

  const category = sanitizePath(doc.category || 'uncategorized');
  const subCategory = sanitizePath(doc.subCategory || 'general');
  return path.join(CONTENT_DIR, category, subCategory, fileName);
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
  console.log('🚀 Starting Markdown generation...\n');

  // 디렉토리 초기화
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  // 컨텐츠 디렉토리 정리 또는 생성
  if (fs.existsSync(CONTENT_DIR)) {
    fs.rmSync(CONTENT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(CONTENT_DIR, { recursive: true });

  // 캐시 로드
  const cache = await loadOrCreateCache();

  // 문서 페치
  const response = await fetchDocuments(true);
  const documents = response.list;
  console.log(`📚 Fetched ${documents.length} documents\n`);

  if (documents.length === 0) {
    console.error('❌ No documents fetched!');
    return;
  }

  // 컨텍스트 초기화
  const context: ProcessingContext = {
    slugMap: new Map(Object.entries(cache.slugMapping)),
    documents: new Map(documents.map(d => [d.id, d])),
    parentChildMap: new Map(),
    errors: []
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

  // 새 문서들에 대한 slug 생성
  const existingSlugs = new Set(context.slugMap.values());
  documents.forEach(doc => {
    if (!context.slugMap.has(doc.id)) {
      const slug = ensureUniqueSlug(generateSlug(doc), existingSlugs);
      context.slugMap.set(doc.id, slug);
      console.log(`Generated slug for ${doc.id}: ${slug}`);
    }
  });

  // 리빌드할 문서 필터링 - 캐시 체크를 건너뛰고 모든 문서 처리
  const forceRebuild = process.env.FORCE_REBUILD === 'true' || Object.keys(cache.documentHashes).length === 0;
  const documentsToProcess = forceRebuild ? documents : documents.filter(doc => shouldRebuildDocument(doc, cache));

  console.log(`📊 Total: ${documents.length}, To process: ${documentsToProcess.length}\n`);

  if (documentsToProcess.length === 0) {
    console.log('ℹ️  No documents need rebuilding');
    return;
  }

  // 모든 문서 처리 (배치 처리 대신 직접 처리로 변경하여 디버깅)
  for (const doc of documentsToProcess) {
    try {
      const slug = context.slugMap.get(doc.id)!;
      const parentDoc = doc.parentId ? context.documents.get(doc.parentId) : undefined;
      const parentSlug = parentDoc ? context.slugMap.get(parentDoc.id) : undefined;

      // 파일 경로 생성
      const filePath = getDocumentPath(doc, slug, parentDoc, parentSlug);
      console.log(`Processing ${doc.id} -> ${path.relative(process.cwd(), filePath)}`);

      // 마크다운 파일 생성
      await createMarkdownFile(doc, filePath, context);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      context.errors.push({
        docId: doc.id,
        error: errorMsg
      });
      console.error(`❌ Failed: ${doc.id} - ${errorMsg}`);
    }
  }

  // 카테고리 구조 및 메타 파일 생성
  const categoryStructure = generateCategoryStructure(documents, context);

  // 각 카테고리와 서브카테고리에 대한 _meta.json 생성
// generateMarkdown 함수 내의 카테고리 구조 생성 부분 수정
  categoryStructure.forEach((subCategories, category) => {
    const categoryDir = path.join(CONTENT_DIR, sanitizePath(category));

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

      // 서브카테고리의 문서들 (부모 문서만)
      const items = docs
          .filter(doc => !doc.parentId)
          .map(doc => {
            const hasChildren = context.parentChildMap.has(doc.id);
            return {
              slug: doc.id,
              title: doc.title || `Document ${doc.no}`,
              order: doc.order || doc.no,
              type: hasChildren ? 'folder' : undefined  // folder 타입 명시
            };
          });

      // 부모-자식 구조 처리
      docs.forEach(async doc => {
        const children = context.parentChildMap.get(doc.id);
        if (children && children.length > 0) {
          const parentDir = path.join(subCategoryDir, doc.id);

          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }

          // index.md 파일 생성 (부모 문서 내용)
          const indexPath = path.join(parentDir, 'index.md');
          await createMarkdownFile(doc, indexPath, context);

          // 자식 문서들 생성
          for (const child of children) {
            const childPath = path.join(parentDir, `${child.id}.md`);
            await createMarkdownFile(child, childPath, context);
          }

          // 부모 폴더의 _meta.json - index는 제외
          const childItems = children.map(child => ({
            slug: child.id,
            title: child.title || `Document ${child.no}`,
            order: child.order || child.no
          }));

          createMetaJson(parentDir, childItems);
        }
      });

      // 서브카테고리 _meta.json
      if (items.length > 0) {
        createMetaJson(subCategoryDir, items);
        subCategoryMetas.push({
          slug: sanitizedSubCategory,
          title: subCategory, // 원본 서브카테고리명 표시
          order: 0
        });
      }
    });

    // 카테고리 레벨 _meta.json
    if (subCategoryMetas.length > 0) {
      createMetaJson(categoryDir, subCategoryMetas);
    }
  });

// 루트 메타 파일
  const rootCategories = Array.from(categoryStructure.keys()).map(cat => ({
    slug: sanitizePath(cat),
    title: cat, // 원본 카테고리명 표시
    order: 0
  }));

  if (rootCategories.length > 0) {
    createMetaJson(CONTENT_DIR, rootCategories);
  }

  // 캐시 저장
  const newCache: BuildCache = {
    version: CACHE_VERSION,
    lastBuild: Date.now(),
    slugMapping: Object.fromEntries(context.slugMap),
    documentHashes: Object.fromEntries(
        documents.map(doc => [doc.id, computeDocumentHash(doc)])
    ),
    categoryStructure: Object.fromEntries(
        Array.from(categoryStructure.entries()).map(([cat, subCats]) => [
          cat,
          Array.from(subCats.keys())
        ])
    )
  };

  fs.writeFileSync(
      path.join(CACHE_DIR, 'build-cache.json'),
      JSON.stringify(newCache, null, 2),
      'utf-8'
  );

  // 통계 출력
  const stats = {
    generatedAt: new Date().toISOString(),
    totalDocuments: documents.length,
    processedDocuments: documentsToProcess.length,
    categories: categoryStructure.size,
    errors: context.errors.length
  };

  fs.writeFileSync(
      path.join(CACHE_DIR, 'generation-stats.json'),
      JSON.stringify(stats, null, 2),
      'utf-8'
  );

  if (context.errors.length > 0) {
    console.error(`\n⚠️  ${context.errors.length} errors occurred`);
    fs.writeFileSync(
        path.join(CACHE_DIR, 'build-errors.json'),
        JSON.stringify(context.errors, null, 2),
        'utf-8'
    );
  }

  console.log('\n✨ Markdown generation completed!');
  console.log(`📊 Processed: ${stats.processedDocuments} documents in ${stats.categories} categories`);
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
