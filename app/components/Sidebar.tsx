'use client';

import { useEffect, useState, useRef } from 'react';
import Button from './Button';

const sections = [
  {
    name: 'modules',
    anchor: '#modules',
    title: 'Modules',
    description: 'Code && UI component repository'
  },
  {
    name: 'icon',
    anchor: '#icon',
    description: 'Icon component system'
  },
];

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState('modules');
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (isScrollingRef.current) return;
      
      const target = e.target as HTMLElement;
      const scrollY = target.scrollTop;
      const navHeight = 52; // Account for sticky nav
      
      let currentSection = 'modules'; // Default to first section
      
      // Check each section to find which one is currently active
      for (const section of sections) {
        const element = document.getElementById(section.name);
        if (element) {
          const sectionTop = element.offsetTop;
          
          // If we've scrolled past this section's top (accounting for nav), it becomes active
          if (scrollY + navHeight >= sectionTop) {
            currentSection = section.name;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleClick = (anchor: string, sectionName: string) => {
    isScrollingRef.current = true;
    setActiveSection(sectionName);
    
    const element = document.getElementById(sectionName);
    const mainElement = document.querySelector('main');
    
    if (element && mainElement) {
      element.scrollIntoView({ behavior: 'smooth' });
      
      // Monitor scroll events to detect when smooth scrolling stops
      let scrollTimeout: NodeJS.Timeout;
      const detectScrollEnd = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrollingRef.current = false;
          mainElement.removeEventListener('scroll', detectScrollEnd);
        }, 150); // Wait 150ms after last scroll event
      };
      
      mainElement.addEventListener('scroll', detectScrollEnd);
      detectScrollEnd(); // Start the timeout
    }
  };

  return (
    <aside className="flex flex-col w-64 h-full py-5 bg-black border-r flex-shrink-0">
      {sections.map((section) => (
        <Button
          key={section.name}
          onClick={() => handleClick(section.anchor, section.name)}
          variant={activeSection === section.name ? 'primary' : 'ghost'}
          className="w-full px-5 py-1.5 justify-start"
        >
          &lt;{section.name}<span className="inline-block h-full w-0.5"></span>/&gt;
        </Button>
      ))}
    </aside>
  );
}
