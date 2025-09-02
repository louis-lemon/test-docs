// EurekaBox API 타입 정의
export interface EurekaDocument {
  id: string;
  no: number;
  title?: string;
  readme: string; // 실제 마크다운 콘텐츠
  category?: string;
  subCategory?: string;
  keywords?: string[];
  parentId?: string;
  parent$?: { id: string };
  markCount?: number;
  noOfElement?: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  publishedAt?: number; // null이면 draft
  slug?: string; // 커스텀 URL 경로
  order?: number; // 정렬 순서
}

export interface EurekaApiResponse {
  limit: number;
  page: number;
  list: EurekaDocument[];
  total: number;
  aggr: any | null;
}

// MDX Frontmatter 타입
export interface MDXFrontmatter {
  title: string;
  description: string;
  // 메타데이터
  id: string;
  no: number;
  order: number;
  // 분류
  category?: string | null;
  subCategory?: string | null;
  tags?: string[];
  // 날짜
  created: string;
  updated: string;
  published?: string | null;
  // 특수 플래그
  featured: boolean;
  draft: boolean;
  hasChildren: boolean;
  // 통계
  elementCount?: number;
  childCount?: number;
  // SEO
  slug: string;
  canonical?: string;
}

// 카테고리 정보
export interface CategoryInfo {
  name: string;
  title: string;
  count: number;
  subCategories: Map<string, SubCategoryInfo>;
}

export interface SubCategoryInfo {
  name: string;
  title: string;
  count: number;
  documents: EurekaDocument[];
}

// Meta.json 타입
export interface MetaJson {
  title: string;
  description?: string;
  root?: boolean;
  defaultOpen?: boolean;
  index?: boolean;
  routes?: RouteItem[];
  pages?: PageItem[] | string[];
}

export interface RouteItem {
  title: string;
  path: string;
  icon?: string;
  badge?: string;
  pages?: string[];
}

export interface PageItem {
  name: string;
  title: string;
  order?: number;
}