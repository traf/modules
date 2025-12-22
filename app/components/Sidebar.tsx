'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Button from './Button';
import Logo from './Logo';

const sections = [
  {
    name: 'icons',
    href: '/icons',
    description: 'Icon component system'
  },
  {
    name: 'domains',
    href: '/domains',
    description: 'Domain search'
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('modules');

  // Set active section based on current route
  useEffect(() => {
    const currentSection = sections.find(section => section.href === pathname);
    if (currentSection) {
      setActiveSection(currentSection.name);
    } else {
      setActiveSection('modules'); // Default fallback
    }
  }, [pathname]);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-full py-5 bg-black border-r flex-shrink-0">
      <div className="flex items-center gap-3 px-5 pt-4 mb-8">
        <Logo />
        <h1>&lt;Modules<span className="inline-block h-full w-0.5"></span>/&gt;</h1>
      </div>
      {sections.map((section) => (
        <Button
          key={section.name}
          href={section.href}
          prefetch={true}
          variant={activeSection === section.name ? 'primary' : 'ghost'}
          className="w-full px-5 py-1.5 justify-start"
        >
          &lt;{section.name}<span className="inline-block h-full w-0.5"></span>/&gt;
        </Button>
      ))}
      <div className="flex flex-col mt-auto py-4">
        <Button href="https://github.com/traf/modules" target="_blank" className="w-full px-5 py-1.5 justify-start">
          &lt;Github<span className="inline-block h-full w-0.5"></span>/&gt;
        </Button>
        <Button href="https://x.com/traf" target="_blank" className="w-full px-5 py-1.5 justify-start">
          &lt;@traf<span className="inline-block h-full w-0.5"></span>/&gt;
        </Button>
      </div>
    </aside>
  );
}
