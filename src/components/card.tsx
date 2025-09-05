import Link from 'next/link';

interface CardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export function QuickStartCard({ title, description, href, icon }: CardProps) {
  return (
    <Link
      href={href}
      className="card block font-normal group relative my-2 rounded-2xl bg-white dark:bg-fd-card border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 overflow-hidden w-full cursor-pointer transition-all"
    >
      <div className="px-6 py-5 relative">
        <div className="absolute text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M7 7h10v10"></path>
            <path d="M7 17 17 7"></path>
          </svg>
        </div>
        <div className="h-6 w-6 mb-4 text-gray-700 dark:text-gray-300">
          {icon}
        </div>
        <div>
          <h2 className="not-prose font-semibold text-base text-gray-800 dark:text-white mt-4">
            {title}
          </h2>
          <div className="mt-1 font-normal text-sm leading-6 text-gray-600 dark:text-gray-400">
            <span>{description}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TopicCard({ title, description, href, icon }: CardProps) {
  return (
    <Link
      href={href}
      className="card block font-normal group relative my-2 rounded-2xl bg-white dark:bg-fd-card border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 overflow-hidden w-full cursor-pointer transition-all"
    >
      <div className="px-6 py-5 relative">
        <div className="absolute text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary-light top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M7 7h10v10"></path>
            <path d="M7 17 17 7"></path>
          </svg>
        </div>
        <div className="h-6 w-6 mb-4 text-gray-700 dark:text-gray-300">
          {icon}
        </div>
        <div>
          <h2 className="not-prose font-semibold text-base text-gray-800 dark:text-white mt-4">
            {title}
          </h2>
          <div className="mt-1 font-normal text-sm leading-6 text-gray-600 dark:text-gray-400">
            <span>{description}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}