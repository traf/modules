'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@modules/icons';
import { resolveColor } from '@modules/icons/src/colors';
import Button from '../components/Button';
import Code from '../components/Code';
import Input from '../components/Input';
import Loader from '../components/Loader';

const iconSets = {
  huge: ['home-01', 'analytics-01', 'signature', 'code-folder', 'qr-code-01', 'browser', 'checkmark-badge-02', 'chat-feedback', 'dollar-02', 'zap', 'victory-finger-02', 'square-lock-password', 'user-02', 'settings-02', 'search-01', 'mail-01', 'calendar-01', 'notification-01', 'image-01', 'download-01'],
  phosphor: ['house', 'chart-bar', 'signature', 'folder', 'qr-code', 'browser', 'check-circle', 'chat-circle', 'currency-dollar', 'lightning', 'hand-peace', 'lock', 'user', 'gear', 'magnifying-glass', 'envelope', 'calendar', 'star', 'heart', 'download'],
  lucide: ['house', 'activity', 'pencil', 'folder', 'qr-code', 'monitor', 'circle-check', 'message-circle', 'dollar-sign', 'zap', 'heart', 'lock', 'user', 'settings', 'search', 'mail', 'calendar', 'star', 'bookmark', 'download'],
  pixelart: ['home', 'chart', 'edit', 'folder', 'code', 'file', 'check', 'chat', 'dollar', 'zap', 'heart', 'lock', 'user', 'search', 'mail', 'calendar', 'bookmark', 'download', 'cloud', 'image']
};


export default function IconsPage() {
  const [selectedSet, setSelectedSet] = useState<string>('huge');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('home-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allIcons, setAllIcons] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIcon, setCopiedIcon] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Copy icon name to clipboard
  const handleIconClick = async (iconName: string) => {
    setSelectedIcon(iconName);
    try {
      await navigator.clipboard.writeText(iconName);
      setCopiedIcon(iconName);
      setTimeout(() => setCopiedIcon(''), 1000);
    } catch (err) {
      // Silently fail
    }
  };

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

  // Autofocus on mount only
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Validate color input
  const validColor = useMemo(() => {
    if (!selectedColor.trim()) return 'white';

    try {
      // Use resolveColor to validate and convert the color
      const resolved = resolveColor(selectedColor);
      // If resolveColor returns a hex color, the input was valid
      if (/^#[0-9A-Fa-f]{3,6}$/.test(resolved)) {
        return selectedColor; // Return original input for the Icon component
      }
      return 'white';
    } catch {
      return 'white'; // Default to white for invalid colors
    }
  }, [selectedColor]);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    const currentSetIcons = allIcons[selectedSet] || iconSets[selectedSet as keyof typeof iconSets] || [];

    let icons: (string | null)[];
    if (!searchQuery.trim()) {
      icons = currentSetIcons.slice(0, 48); // Keep 48 icons
    } else {
      const query = searchQuery.toLowerCase();
      icons = currentSetIcons
        .filter(iconName => iconName.toLowerCase().includes(query))
        .slice(0, 48); // Keep 48 results
    }

    // Pad to exactly 48 items to maintain 8x6 grid
    const paddedIcons = [...icons];
    while (paddedIcons.length < 48) {
      paddedIcons.push(null);
    }

    return paddedIcons;
  }, [selectedSet, searchQuery, allIcons]);

  return (
    <div className="w-full flex flex-col lg:flex-row items-start justify-start h-full">

      {/* Left Sidebar - Controls and Code */}
      <div className="w-full lg:w-[440px] h-auto lg:h-full flex flex-col gap-8 p-6 border-r lg:overflow-y-auto">

        {/* Set */}
        <div className="flex flex-col gap-3">
          <p className="text-white">Icon set</p>
          <div className="w-full border flex items-center">
            {Object.keys(iconSets).map(setName => (
              <Button
                key={setName}
                onClick={() => setSelectedSet(setName)}
                variant={selectedSet === setName ? 'primary' : 'ghost'}
                className="w-full [&>span]:w-full [&>span]:py-1.5 [&>span]:px-2"
              >
                {setName}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <Input
          ref={searchInputRef}
          label="Icon search"
          placeholder="home, activity, window"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Color */}
        <Input
          label="Color search"
          placeholder="#0066ff, sky-500, neutral-400"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        />

        {/* Install */}
        <Code type="terminal" title="Install">{`npm install @modul-es/icons`}</Code>

        {/* Usage */}
        <Code title="Usage">
          {`import { Icon } from '@modul-es/icons';

<Icon set="${selectedSet}" name="${selectedIcon}" color="${validColor}" />`}
        </Code>
      
      </div>

      {/* Right Side - Icon Grid */}
      <div className="w-full flex-1 bg-black grid grid-cols-4 lg:grid-cols-8 lg:grid-rows-6 h-fit lg:h-full">
        {isLoading ? (
          Array.from({ length: 48 }).map((_, index) => (
            <div key={index} className={`flex items-center justify-center ${index % 8 !== 7 ? 'border-r' : ''
              } ${index < 40 ? 'border-b' : ''
              }`}>
              <Loader />
            </div>
          ))
        ) : (
          filteredIcons.map((iconName, index) => (
            <div
              key={`${selectedSet}-${iconName}-${index}`}
              className={`relative flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 aspect-square lg:aspect-auto ${index % 8 !== 7 ? 'border-r' : ''
                } ${index < 40 ? 'border-b' : ''
                }`}
              onClick={() => iconName && handleIconClick(iconName)}
            >
              {iconName && (
                <>
                  <Icon
                    name={iconName}
                    set={selectedSet as 'huge' | 'phosphor' | 'lucide' | 'pixelart'}
                    color={validColor}
                    className="w-9"
                    key={`${selectedSet}-${iconName}-${validColor}`}
                  />
                  {copiedIcon === iconName && (
                    <div className="absolute w-full text-center bottom-0 p-2.5 text-xs text-grey">
                      Copied name
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}