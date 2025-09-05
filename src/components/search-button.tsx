'use client';

import { useEffect, useState } from 'react';

export function SearchButton() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const handleSearchClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleSearchClick}
      className="flex w-full max-w-2xl items-center text-sm leading-6 rounded-lg py-1.5 pl-2.5 pr-3 shadow-sm text-gray-400 dark:text-white/50 bg-fd-background dark:bg-fd-background hover:ring-gray-600/25 dark:hover:ring-gray-500/30 ring-1 ring-gray-400/20 dark:ring-gray-600/30 transition-all cursor-pointer"
    >
      <svg
        className="h-4 w-4 ml-1.5 mr-3 flex-none bg-gray-500 hover:bg-gray-600 dark:bg-white/50 dark:hover:bg-white/70"
        style={{
          maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke-width=\'1.5\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z\' /%3E%3C/svg%3E")',
          maskRepeat: 'no-repeat',
          maskPosition: 'center'
        }}
      />
      <span>Search or ask anything</span>
    </button>
  );
}