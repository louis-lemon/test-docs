'use client';

import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';

export function Provider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      search={{
        options: {
          type: 'static',
          // GitHub Pages 배포시 basePath 고려
          api: process.env.NODE_ENV === 'production' ? '/test-docs/api/search' : '/api/search',
        },
      }}
    >
      {children}
    </RootProvider>
  );
}