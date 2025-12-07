'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@modules/icons';
import Button from './Button';
import Code from './Code';
import Section from './Section';
import Loader from './Loader';

const iconSets = {
  huge: ['home-01', 'analytics-01', 'signature', 'code-folder', 'qr-code-01', 'browser', 'checkmark-badge-02', 'chat-feedback', 'dollar-02', 'zap', 'victory-finger-02', 'square-lock-password', 'user-02', 'settings-02', 'search-01', 'mail-01', 'calendar-01', 'notification-01', 'image-01', 'download-01'],
  phosphor: ['house', 'chart-bar', 'signature', 'folder', 'qr-code', 'browser', 'check-circle', 'chat-circle', 'currency-dollar', 'lightning', 'hand-peace', 'lock', 'user', 'gear', 'magnifying-glass', 'envelope', 'calendar', 'star', 'heart', 'download'],
  lucide: ['house', 'activity', 'pencil', 'folder', 'qr-code', 'monitor', 'circle-check', 'message-circle', 'dollar-sign', 'zap', 'heart', 'lock', 'user', 'settings', 'search', 'mail', 'calendar', 'star', 'bookmark', 'download'],
  pixelart: ['home', 'chart', 'edit', 'folder', 'code', 'file', 'check', 'chat', 'dollar', 'zap', 'heart', 'lock', 'user', 'search', 'mail', 'calendar', 'bookmark', 'download', 'cloud', 'image']
};

const colors = ['white', '#2563eb', 'rose-400', 'teal-500'];

export default function SectionIcons() {
  const [selectedSet, setSelectedSet] = useState<string>('huge');
  const [selectedColor, setSelectedColor] = useState<string>('white');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allIcons, setAllIcons] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load all icons for the selected set
  useEffect(() => {
    const loadIcons = async () => {
      if (allIcons[selectedSet]) return; // Already loaded
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/icons/${selectedSet}`);
        if (response.ok) {
          const icons = await response.json();
          setAllIcons(prev => ({ ...prev, [selectedSet]: icons }));
        }
      } catch (error) {
        console.error('Failed to load icons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIcons();
  }, [selectedSet, allIcons]);

  // Clear search when set changes and refocus input
  useEffect(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, [selectedSet]);

  // Refocus input when color changes
  useEffect(() => {
    searchInputRef.current?.focus();
  }, [selectedColor]);

  // Autofocus on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    const currentSetIcons = allIcons[selectedSet] || iconSets[selectedSet as keyof typeof iconSets] || [];
    
    let icons: (string | null)[];
    if (!searchQuery.trim()) {
      icons = currentSetIcons.slice(0, 20); // Keep 20 icons
    } else {
      const query = searchQuery.toLowerCase();
      icons = currentSetIcons
        .filter(iconName => iconName.toLowerCase().includes(query))
        .slice(0, 20); // Keep 20 results
    }
    
    // Pad to exactly 20 items to maintain 4x5 grid
    const paddedIcons = [...icons];
    while (paddedIcons.length < 20) {
      paddedIcons.push(null);
    }
    
    return paddedIcons;
  }, [selectedSet, searchQuery, allIcons]);

  return (
    <Section id="icon" title="icon.module" description="Icon component system" className="!pb-40">

      <div className="flex gap-6 w-full items-stretch">

        {/* Left: Icon Grid */}
        <div className="w-full">
          <div className="bg-black w-full border flex flex-col" style={{ height: 'calc(100% - 4px)' }}>
            <div className="flex items-center justify-between border-b p-4">
              <p className="text-white">Icons</p>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder:text-grey border-none outline-none text-right font"
              />
            </div>
            <div className="grid grid-cols-5 grid-rows-4 w-full flex-1">
              {isLoading ? (
                // Loading state
                Array.from({ length: 20 }).map((_, index) => (
                  <div key={index} className={`flex items-center justify-center w-full h-full ${
                    index % 5 !== 4 ? 'border-r' : ''
                  } ${
                    index < 15 ? 'border-b' : ''
                  }`}>
                    <Loader />
                  </div>
                ))
              ) : (
                filteredIcons.map((iconName, index) => (
                <div key={`${selectedSet}-${iconName}-${index}`} className={`flex items-center justify-center w-full h-full ${index % 5 !== 4 ? 'border-r' : ''
                  } ${index < 15 ? 'border-b' : ''
                  }`}>
                  {iconName && (
                    <Icon
                      name={iconName}
                      set={selectedSet as 'huge' | 'phosphor' | 'lucide' | 'pixelart'}
                      color={selectedColor}
                      className="w-9"
                      key={`${selectedSet}-${iconName}-${selectedColor}`}
                    />
                  )}
                </div>
              ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls and Code */}
        <div className="flex flex-col gap-6 w-full">

          {/* Set Selector */}
          <div className="border bg-black w-full">
            <div className="flex items-center justify-between border-b p-4">
              <p className="text-white">Set</p>
              <p className="text-grey">[04]</p>
            </div>
            <div className="p-2.5 flex">
              {Object.keys(iconSets).map(setName => (
                <Button
                  key={setName}
                  onClick={() => setSelectedSet(setName)}
                  variant={selectedSet === setName ? 'primary' : 'ghost'}
                >
                  {setName}
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="border bg-black w-full">
            <div className="flex items-center justify-between border-b p-4">
              <p className="text-white">Color</p>
              <p className="text-grey">[Hex, Tailwind]</p>
            </div>
            <div className="p-2.5 flex">
              {colors.map(colorName => (
                <Button
                  key={colorName}
                  onClick={() => setSelectedColor(colorName)}
                  variant={selectedColor === colorName ? 'primary' : 'ghost'}
                >
                  {colorName}
                </Button>
              ))}
            </div>
          </div>

          <Code type="terminal">{`npm install @modul-es/icons`}</Code>

          <Code>
            {`
        import { Icon } from '@modul-es/icons';

<Icon set="${selectedSet}" name="home-01" color="${selectedColor}" />

`}
          </Code>

        </div>

      </div>
    </Section>
  );
}