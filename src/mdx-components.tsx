import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import { getImagePath } from '@/lib/image-utils';

// Custom image component that handles dynamic dimensions
const CustomImage = ({ src, alt, ...props }: any) => {
  // For local images in /images/, use basePath-aware path
  if (src?.startsWith('/images/')) {
    return (
      <img
        src={getImagePath(src)}
        alt={alt}
        className="max-w-full h-auto rounded-lg border"
        style={{ display: 'block' }}
        {...props}
      />
    );
  }

  // For external images, use Next.js Image with fallback dimensions
  return (
    <Image
      src={src}
      alt={alt || 'image'}
      width={800}
      height={600}
      className="max-w-full h-auto rounded-lg border"
      style={{ width: 'auto', height: 'auto' }}
      unoptimized
      {...props}
    />
  );
};

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: CustomImage,
    ...components,
  };
}
