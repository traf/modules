import { ReactNode, forwardRef } from 'react';

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

const PageContent = forwardRef<HTMLDivElement, PageContentProps>(({ children, className = '' }, ref) => {
  return (
    <div ref={ref} className={`w-full lg:flex-1 h-fit lg:h-full bg-black overflow-hidden lg:overflow-y-auto scrollbar-hide ${className}`}>
      {children}
    </div>
  );
});

PageContent.displayName = 'PageContent';

export default PageContent;
