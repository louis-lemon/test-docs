import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            src="/codes-logo-black.png"
            alt="Logo"
            width={24}
            height={24}
            className="dark:hidden"
          />
          <Image
            src="/codes-logo-white.png"
            alt="Logo"
            width={24}
            height={24}
            className="hidden dark:block"
          />
          EurekaCodes
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        text: 'Home',
        url: '/',
        active: 'nested-url',
      },
      {
        text: 'Documentation',
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'GitHub',
        url: 'https://github.com/lemoncloud-io',
        external: true,
      },
    ],
  };
}
