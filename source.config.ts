import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { z } from 'zod';

// Extended frontmatter schema for EurekaBox documents
const extendedFrontmatterSchema = frontmatterSchema.extend({
  // 메타데이터
  id: z.string().optional(),
  no: z.number().optional(),
  order: z.number().optional(),
  // 분류
  category: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  // 날짜
  created: z.string().optional(),
  updated: z.string().optional(),
  published: z.string().nullable().optional(),
  // 특수 플래그
  featured: z.boolean().optional(),
  draft: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  // 통계
  elementCount: z.number().optional(),
  childCount: z.number().optional(),
  // SEO
  slug: z.string().optional(),
  canonical: z.string().optional(),
});

// Extended meta.json schema
const extendedMetaSchema = metaSchema.extend({
  root: z.boolean().optional(),
  defaultOpen: z.boolean().optional(),
  index: z.boolean().optional(),
  routes: z.array(z.object({
    title: z.string(),
    path: z.string(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    pages: z.array(z.string()).optional(),
  })).optional(),
  pages: z.union([
    z.array(z.string()),
    z.array(z.object({
      name: z.string(),
      title: z.string(),
      order: z.number().optional(),
    }))
  ]).optional(),
});

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections#define-docs
export const docs = defineDocs({
  docs: {
    schema: extendedFrontmatterSchema,
  },
  meta: {
    schema: extendedMetaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    // MDX options
    remarkPlugins: [],
    rehypePlugins: [],
    // Disable image optimization completely
    remarkImageOptions: false,
  },
  // Disable image optimization to prevent external URL issues
  lastModifiedTime: 'none',
  attachments: false,
  generateManifest: false,
});
