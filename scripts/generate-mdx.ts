#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import { 
  EurekaDocument, 
  MDXFrontmatter, 
  CategoryInfo, 
  SubCategoryInfo,
  MetaJson,
  RouteItem
} from '../src/types/eureka';
import { fetchDocuments } from '../src/lib/mock-api';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');
const CACHE_DIR = path.join(process.cwd(), '.build-cache');
const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

// 이미지 다운로드 및 로컬 저장을 위한 설정
const downloadedImages = new Map<string, string>(); // URL -> 로컬 경로 매핑

// 이미지 다운로드 함수
async function downloadImage(url: string): Promise<string | null> {
  try {
    // 이미 다운로드된 이미지인지 확인
    if (downloadedImages.has(url)) {
      return downloadedImages.get(url)!;
    }

    // URL에서 파일 확장자 추출
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    let ext = path.extname(pathname);
    
    // 확장자가 없는 경우 도메인별 기본 확장자 설정
    if (!ext) {
      if (url.includes('image.lemoncloud.io')) {
        ext = '.jpg'; // lemoncloud 이미지는 보통 jpg
      } else {
        ext = '.jpg'; // 기본값
      }
    }
    
    // 파일명 생성 (URL 해시 기반)
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const filename = `${hash}${ext}`;
    const localPath = path.join(PUBLIC_IMAGES_DIR, filename);
    const publicPath = `/images/${filename}`;

    // 이미 파일이 존재하면 건너뛰기
    if (fs.existsSync(localPath)) {
      downloadedImages.set(url, publicPath);
      return publicPath;
    }

    // public/images 디렉토리 생성
    if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
      fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
    }

    // 이미지 다운로드
    const client = url.startsWith('https') ? https : http;
    
    return new Promise((resolve, reject) => {
      const request = client.get(url, (response) => {
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(localPath);
          response.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            downloadedImages.set(url, publicPath);
            console.log(`📸 Downloaded: ${url} -> ${publicPath}`);
            resolve(publicPath);
          });
          
          fileStream.on('error', (err) => {
            fs.unlink(localPath, () => {}); // 실패 시 파일 삭제
            reject(err);
          });
        } else {
          console.warn(`⚠️  Failed to download image (${response.statusCode}): ${url}`);
          resolve(null);
        }
      });
      
      request.on('error', (err) => {
        console.warn(`⚠️  Error downloading image: ${url}`, err.message);
        resolve(null);
      });
      
      // 타임아웃 설정 (10초)
      request.setTimeout(10000, () => {
        request.destroy();
        console.warn(`⚠️  Timeout downloading image: ${url}`);
        resolve(null);
      });
    });
  } catch (error) {
    console.warn(`⚠️  Error processing image URL: ${url}`, error);
    return null;
  }
}

// 컨텐츠에서 이미지 URL 추출 및 다운로드
async function processImages(content: string): Promise<string> {
  // 확장자가 있는 이미지 URL과 image.lemoncloud.io처럼 확장자가 없는 이미지 URL 모두 처리
  const imageUrlRegex = /https?:\/\/(?:[^\s\)]*\.(?:jpg|jpeg|png|gif|webp|svg)|image\.lemoncloud\.io\/[a-zA-Z0-9\-]+)/gi;
  const imageUrls = content.match(imageUrlRegex) || [];
  
  // 모든 이미지를 병렬로 다운로드
  const downloadPromises = imageUrls.map(url => downloadImage(url.trim()));
  const results = await Promise.all(downloadPromises);
  
  // URL을 로컬 경로로 교체
  let processedContent = content;
  imageUrls.forEach((url, index) => {
    const localPath = results[index];
    if (localPath) {
      processedContent = processedContent.replace(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), localPath);
    }
  });
  
  return processedContent;
}

// Slug 생성 함수 - EurekaBox ID 사용 (C123 형식)
function generateSlug(doc: EurekaDocument): string {
  return doc.id; // EurekaBox ID를 그대로 사용 (예: C123)
}

// 카테고리 제목 변환
function formatCategoryTitle(category: string): string {
  const categoryMap: Record<string, string> = {
    'aws': 'AWS',
    'development': 'Development',
    'web-development': 'Web Development',
    'mobile': 'Mobile',
    'business': 'Business',
    'productivity': 'Productivity',
    'documentation': 'Documentation',
    'content': 'Content',
    'design': 'Design',
    'marketing': 'Marketing',
    'ai': 'AI'
  };
  return categoryMap[category] || category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// 서브카테고리 제목 변환
function formatSubCategoryTitle(subCategory: string): string {
  const subCategoryMap: Record<string, string> = {
    'compute': 'Compute',
    'networking': 'Networking',
    'storage': 'Storage',
    'billing': 'Billing',
    'security': 'Security',
    'ai-tools': 'AI Tools',
    'websocket': 'WebSocket',
    'tools': 'Tools',
    'api': 'API',
    'testing': 'Testing'
  };
  return subCategoryMap[subCategory] || subCategory.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// MDX Frontmatter 생성
function createFrontmatter(doc: EurekaDocument, childCount: number = 0): MDXFrontmatter {
  const description = doc.readme 
    ? doc.readme.substring(0, 150).replace(/[#\n]/g, ' ').trim() + '...'
    : `Document ${doc.no}`;
    
  return {
    title: doc.title || `Untitled Document #${doc.no}`,
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
    slug: generateSlug(doc),
    canonical: doc.slug
  };
}

// 컨텐츠 정리 함수 - 이미지와 링크 처리 (동기 버전)
async function cleanupContent(content: string): Promise<string> {
  if (!content) return content;
  
  // 먼저 이미지 URL들을 다운로드하고 로컬 경로로 변경
  const processedContent = await processImages(content);
  
  return processedContent
    // YouTube 링크가 이미지로 잘못 표기된 경우 수정 (![url](url) → [url](url))
    .replace(/!\[(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\]]*)\]\(([^)]+)\)/g, '[$1]($2)')
    
    // 일반 이미지 링크를 마크다운 형식으로 유지 (Fumadocs가 마크다운 이미지를 올바르게 처리)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      // YouTube, Vimeo 등 동영상 링크는 제외
      if (src.match(/(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/i)) {
        return `[${alt || src}](${src})`;
      }
      
      // 일반 이미지는 마크다운 형식으로 유지
      const altText = alt || 'image';
      return `![${altText}](${src})`;
    })
    
    // 단순한 URL만 있는 이미지 표기 처리 (![file](url) 등)
    .replace(/!\[(file|image|그림|사진)\]\(([^)]+)\)/gi, (match, alt, src) => {
      // YouTube, Vimeo 등 동영상 링크는 제외
      if (src.match(/(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/i)) {
        return `[${src}](${src})`;
      }
      
      return `![${alt}](${src})`;
    });
}

// 컨텐츠 정리 함수 - 이미지와 링크 처리 (동기 버전, 이미지는 이미 다운로드 완료)
function cleanupContentSync(content: string): string {
  if (!content) return content;
  
  // 이미 다운로드된 이미지 URL들을 로컬 경로로 교체
  let processedContent = content;
  downloadedImages.forEach((localPath, originalUrl) => {
    const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    processedContent = processedContent.replace(new RegExp(escapedUrl, 'g'), localPath);
  });
  
  return processedContent
    // YouTube 링크가 이미지로 잘못 표기된 경우 수정 (![url](url) → [url](url))
    .replace(/!\[(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^\]]*)\]\(([^)]+)\)/g, '[$1]($2)')
    
    // 일반 이미지 링크를 마크다운 형식으로 유지 (Fumadocs가 마크다운 이미지를 올바르게 처리)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      // YouTube, Vimeo 등 동영상 링크는 제외
      if (src.match(/(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/i)) {
        return `[${alt || src}](${src})`;
      }
      
      // 일반 이미지는 마크다운 형식으로 유지
      const altText = alt || 'image';
      return `![${altText}](${src})`;
    })
    
    // 단순한 URL만 있는 이미지 표기 처리 (![file](url) 등)
    .replace(/!\[(file|image|그림|사진)\]\(([^)]+)\)/gi, (match, alt, src) => {
      // YouTube, Vimeo 등 동영상 링크는 제외
      if (src.match(/(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/i)) {
        return `[${src}](${src})`;
      }
      
      return `![${alt}](${src})`;
    });
}

// MD 파일 생성
function createMDFile(doc: EurekaDocument, frontmatter: MDXFrontmatter, filePath: string): void {
  const frontmatterYaml = Object.entries(frontmatter)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
      }
      if (typeof value === 'string') {
        return `${key}: "${value.replace(/"/g, '\\"')}"`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');
  
  // 컨텐츠 정리 적용 (이미지는 이미 다운로드 완료)
  const cleanedContent = cleanupContentSync(doc.readme || `# ${doc.title || 'Untitled Document'}\n\nContent for document ${doc.no}`);
    
  const mdxContent = `---
${frontmatterYaml}
---

${cleanedContent}
`;
  
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, mdxContent, 'utf-8');
  console.log(`✅ Created: ${filePath}`);
}

// 문서 구조 분석
function analyzeDocumentStructure(documents: EurekaDocument[]) {
  const categories = new Map<string, CategoryInfo>();
  const parentChildMap = new Map<string, EurekaDocument[]>();
  const uncategorized: EurekaDocument[] = [];
  
  // 부모-자식 관계 매핑
  documents.forEach(doc => {
    if (doc.parentId) {
      if (!parentChildMap.has(doc.parentId)) {
        parentChildMap.set(doc.parentId, []);
      }
      parentChildMap.get(doc.parentId)!.push(doc);
    }
  });
  
  // 카테고리별 분류
  documents.forEach(doc => {
    if (!doc.category) {
      uncategorized.push(doc);
      return;
    }
    
    if (!categories.has(doc.category)) {
      categories.set(doc.category, {
        name: doc.category,
        title: formatCategoryTitle(doc.category),
        count: 0,
        subCategories: new Map()
      });
    }
    
    const categoryInfo = categories.get(doc.category)!;
    categoryInfo.count++;
    
    const subCategoryName = doc.subCategory || 'general';
    if (!categoryInfo.subCategories.has(subCategoryName)) {
      categoryInfo.subCategories.set(subCategoryName, {
        name: subCategoryName,
        title: formatSubCategoryTitle(subCategoryName),
        count: 0,
        documents: []
      });
    }
    
    const subCategoryInfo = categoryInfo.subCategories.get(subCategoryName)!;
    subCategoryInfo.count++;
    subCategoryInfo.documents.push(doc);
  });
  
  return { categories, parentChildMap, uncategorized };
}

// 폴더 경로 생성
function getDocumentPath(doc: EurekaDocument, parentDoc?: EurekaDocument): string {
  const slug = generateSlug(doc);
  
  if (parentDoc) {
    const parentSlug = generateSlug(parentDoc);
    const parentCategory = parentDoc.category || 'uncategorized';
    const parentSubCategory = parentDoc.subCategory || 'general';
    return path.join(CONTENT_DIR, parentCategory, parentSubCategory, parentSlug, `${slug}.md`);
  }
  
  if (!doc.category) {
    return path.join(CONTENT_DIR, 'uncategorized', `${slug}.md`);
  }
  
  const subCategory = doc.subCategory || 'general';
  return path.join(CONTENT_DIR, doc.category, subCategory, `${slug}.md`);
}

// Meta.json 생성
function createMetaJson(dirPath: string, metaData: MetaJson): void {
  const metaPath = path.join(dirPath, 'meta.json');
  fs.writeFileSync(metaPath, JSON.stringify(metaData, null, 2), 'utf-8');
  console.log(`📝 Created meta.json: ${metaPath}`);
}

// 루트 meta.json 생성
function createRootMeta(categories: Map<string, CategoryInfo>): void {
  const routes: RouteItem[] = [];
  
  categories.forEach((categoryInfo, categoryName) => {
    routes.push({
      title: categoryInfo.title,
      path: categoryName,
      icon: getCategoryIcon(categoryName),
      badge: `${categoryInfo.count} docs`
    });
  });
  
  // Uncategorized 추가
  routes.push({
    title: 'Uncategorized',
    path: 'uncategorized',
    icon: 'FileText',
    badge: ''
  });
  
  const rootMeta: MetaJson = {
    title: 'Documentation',
    root: true,
    routes
  };
  
  createMetaJson(CONTENT_DIR, rootMeta);
}

// 카테고리 아이콘 매핑
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'aws': 'Cloud',
    'development': 'Code',
    'web-development': 'Globe',
    'mobile': 'Smartphone',
    'business': 'Briefcase',
    'productivity': 'Clock',
    'documentation': 'FileText',
    'content': 'Edit',
    'design': 'Palette',
    'marketing': 'TrendingUp',
    'ai': 'Cpu'
  };
  return iconMap[category] || 'Folder';
}

// 메인 실행 함수
async function generateMDX() {
  console.log('🚀 Starting MDX generation...\n');
  
  // 캐시 디렉토리 생성
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  
  // 기존 content 디렉토리 정리
  if (fs.existsSync(CONTENT_DIR)) {
    fs.rmSync(CONTENT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  
  // 문서 페치
  const response = await fetchDocuments(true);
  const documents = response.list;
  console.log(`📚 Fetched ${documents.length} documents\n`);
  
  // 모든 문서의 이미지를 미리 다운로드
  console.log('📸 Pre-downloading images...');
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    if (doc.readme) {
      await processImages(doc.readme);
      if ((i + 1) % 20 === 0) {
        console.log(`📸 Processed images for ${i + 1}/${documents.length} documents`);
      }
    }
  }
  console.log(`📸 Image pre-download completed\n`);
  
  // 문서 구조 분석
  const { categories, parentChildMap, uncategorized } = analyzeDocumentStructure(documents);
  
  // 카테고리별 MDX 생성
  categories.forEach((categoryInfo, categoryName) => {
    const categoryDir = path.join(CONTENT_DIR, categoryName);
    
    // 카테고리 meta.json 생성
    const categoryRoutes: RouteItem[] = [];
    
    categoryInfo.subCategories.forEach((subCategoryInfo, subCategoryName) => {
      categoryRoutes.push({
        title: subCategoryInfo.title,
        path: subCategoryName,
        pages: subCategoryInfo.documents
          .filter(doc => !doc.parentId) // 부모 문서가 없는 것만
          .sort((a, b) => (a.order || a.no) - (b.order || b.no))
          .map(doc => generateSlug(doc))
      });
      
      // 서브카테고리별 문서 생성
      subCategoryInfo.documents.forEach(doc => {
        if (parentChildMap.has(doc.id)) {
          // 부모 문서인 경우 폴더 생성
          const parentSlug = generateSlug(doc);
          const parentDir = path.join(categoryDir, subCategoryName, parentSlug);
          
          // index.md 생성
          const childCount = parentChildMap.get(doc.id)!.length;
          const frontmatter = createFrontmatter(doc, childCount);
          createMDFile(doc, frontmatter, path.join(parentDir, 'index.md'));
          
          // 자식 문서들 생성
          const children = parentChildMap.get(doc.id)!;
          const childPages = children
            .sort((a, b) => (a.order || a.no) - (b.order || b.no))
            .map(child => {
              const childFrontmatter = createFrontmatter(child);
              const childPath = getDocumentPath(child, doc);
              createMDFile(child, childFrontmatter, childPath);
              return {
                name: generateSlug(child),
                title: child.title || `Document ${child.no}`,
                order: child.order || child.no
              };
            });
          
          // 부모 폴더 meta.json 생성
          const parentMeta: MetaJson = {
            title: doc.title || `Document ${doc.no}`,
            description: doc.readme ? doc.readme.substring(0, 100) + '...' : '',
            index: true,
            pages: [
              'index',
              ...children.map(child => generateSlug(child))
            ]
          };
          
          createMetaJson(parentDir, parentMeta);
        } else if (!doc.parentId) {
          // 일반 문서
          const frontmatter = createFrontmatter(doc);
          const docPath = getDocumentPath(doc);
          createMDFile(doc, frontmatter, docPath);
        }
      });
      
      // 서브카테고리 meta.json 생성
      const subCategoryDir = path.join(categoryDir, subCategoryName);
      const subCategoryMeta: MetaJson = {
        title: subCategoryInfo.title,
        defaultOpen: true,
        pages: subCategoryInfo.documents
          .filter(doc => !doc.parentId)
          .sort((a, b) => (a.order || a.no) - (b.order || b.no))
          .map(doc => generateSlug(doc))
      };
      
      if (fs.existsSync(subCategoryDir)) {
        createMetaJson(subCategoryDir, subCategoryMeta);
      }
    });
    
    // 카테고리 레벨 meta.json 생성
    const categoryMeta: MetaJson = {
      title: categoryInfo.title,
      description: `${categoryInfo.title} 관련 문서 모음`,
      defaultOpen: true,
      routes: categoryRoutes
    };
    
    if (fs.existsSync(categoryDir)) {
      createMetaJson(categoryDir, categoryMeta);
    }
  });
  
  // Uncategorized 문서 처리
  if (uncategorized.length > 0) {
    const uncategorizedDir = path.join(CONTENT_DIR, 'uncategorized');
    
    uncategorized.forEach(doc => {
      const frontmatter = createFrontmatter(doc);
      const docPath = getDocumentPath(doc);
      createMDFile(doc, frontmatter, docPath);
    });
    
    const uncategorizedMeta: MetaJson = {
      title: 'Uncategorized',
      description: '분류되지 않은 문서',
      pages: uncategorized
        .sort((a, b) => (a.order || a.no) - (b.order || b.no))
        .map(doc => generateSlug(doc))
    };
    
    if (fs.existsSync(uncategorizedDir)) {
      createMetaJson(uncategorizedDir, uncategorizedMeta);
    }
  }
  
  // 루트 meta.json 생성
  createRootMeta(categories);
  
  // 캐시 정보 저장
  const cacheInfo = {
    generatedAt: Date.now(),
    documentCount: documents.length,
    categoryCount: categories.size
  };
  
  fs.writeFileSync(
    path.join(CACHE_DIR, 'generation-info.json'),
    JSON.stringify(cacheInfo, null, 2),
    'utf-8'
  );
  
  console.log('\n✨ MDX generation completed!');
  console.log(`📊 Generated ${documents.length} documents in ${categories.size} categories`);
}

// 실행
generateMDX().catch(console.error);