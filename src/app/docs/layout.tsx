import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const docsOptions = { ...baseOptions(), links: [] } ;

  return (
    <DocsLayout tree={source.pageTree} {...docsOptions}>
      {children}
    </DocsLayout>
  );
}
