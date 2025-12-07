'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from '@modules/icons';
import { resolveColor } from '@modules/icons/src/colors';
import Code from '../components/Code';
import Input from '../components/Input';
import Loader from '../components/Loader';
import Tabs from '../components/Tabs';
import Dropdown from '../components/Dropdown';

const iconSets = {
  huge: ['home-01', 'analytics-01', 'signature', 'code-folder', 'qr-code-01', 'browser', 'checkmark-badge-02', 'chat-feedback', 'dollar-02', 'zap', 'victory-finger-02', 'square-lock-password', 'user-02', 'settings-02', 'search-01', 'mail-01', 'calendar-01', 'notification-01', 'image-01', 'download-01'],
  phosphor: ['house', 'chart-bar', 'signature', 'folder', 'qr-code', 'browser', 'check-circle', 'chat-circle', 'currency-dollar', 'lightning', 'hand-peace', 'lock', 'user', 'gear', 'magnifying-glass', 'envelope', 'calendar', 'star', 'heart', 'download'],
  lucide: ['house', 'activity', 'pencil', 'folder', 'qr-code', 'monitor', 'circle-check', 'message-circle', 'dollar-sign', 'zap', 'heart', 'lock', 'user', 'settings', 'search', 'mail', 'calendar', 'star', 'bookmark', 'download'],
  pixelart: ['home', 'chart', 'edit', 'folder', 'code', 'file', 'check', 'chat', 'dollar', 'zap', 'heart', 'lock', 'user', 'search', 'mail', 'calendar', 'bookmark', 'download', 'cloud', 'image']
};


export default function IconsPage() {
  const [selectedSet, setSelectedSet] = useState<string>('huge');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStroke, setSelectedStroke] = useState<string>('1.5');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('home-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allIcons, setAllIcons] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIcon, setCopiedIcon] = useState<string>('');
  const [copyMode, setCopyMode] = useState<string>('name');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = async (iconName: string) => {
    setSelectedIcon(iconName);

    if (copyMode === 'name') {
      try {
        await navigator.clipboard.writeText(iconName);
        setCopiedIcon(iconName);
        setTimeout(() => setCopiedIcon(''), 1000);
      } catch {
        // Silently fail
      }
    } else if (copyMode === 'svg') {
      try {
        // Fetch the SVG from the CDN with current settings
        let url = `https://icons.modul.es/${selectedSet}/${iconName}.svg?color=${encodeURIComponent(validColor)}`;
        if (selectedSet !== 'phosphor' && selectedSet !== 'pixelart') {
          url += `&stroke=${encodeURIComponent(selectedStroke)}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const svgContent = await response.text();
          await navigator.clipboard.writeText(svgContent);
          setCopiedIcon(iconName);
          setTimeout(() => setCopiedIcon(''), 1000);
        }
      } catch {
        // Silently fail
      }
    } else if (copyMode === 'component') {
      try {
        let componentCode = `<Icon set="${selectedSet}" name="${iconName}" color="${validColor}"`;
        if (selectedSet !== 'phosphor' && selectedSet !== 'pixelart') {
          componentCode += ` stroke="${selectedStroke}"`;
        }
        if (selectedSet === 'phosphor' && selectedStyle) {
          componentCode += ` style="${selectedStyle}"`;
        }
        componentCode += ` />`;
        await navigator.clipboard.writeText(componentCode);
        setCopiedIcon(iconName);
        setTimeout(() => setCopiedIcon(''), 1000);
      } catch {
        // Silently fail
      }
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
          label="Icon color"
          placeholder="#0066ff, sky-500, neutral-400"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
        />

        {/* Set */}
        <div className="flex flex-col gap-3">
          <p className="text-white">Icon set</p>
          <Tabs
            items={Object.keys(iconSets).map(setName => ({
              id: setName,
              label: setName
            }))}
            activeTab={selectedSet}
            onTabChange={setSelectedSet}
          />
        </div>

        {/* Stroke */}
        {selectedSet !== 'phosphor' && selectedSet !== 'pixelart' && (
          <div className="flex flex-col gap-3">
            <p className="text-white">Stroke width</p>
            <Tabs
              items={[
                { id: '1', label: '1' },
                { id: '1.5', label: '1.5' },
                { id: '2', label: '2' },
                { id: '2.5', label: '2.5' }
              ]}
              activeTab={selectedStroke}
              onTabChange={setSelectedStroke}
            />
          </div>
        )}

        {/* Style */}
        {selectedSet === 'phosphor' && (
          <div className="flex flex-col gap-3">
            <p className="text-white">Style</p>
            <Dropdown
              items={[
                { id: '', label: 'Regular' },
                { id: 'thin', label: 'Thin' },
                { id: 'light', label: 'Light' },
                { id: 'bold', label: 'Bold' },
                { id: 'fill', label: 'Fill' },
                { id: 'duotone', label: 'Duotone' }
              ]}
              value={selectedStyle}
              onChange={setSelectedStyle}
            />
          </div>
        )}

        {/* Copy Mode */}
        <div className="flex flex-col gap-3">
          <p className="text-white">Copy method</p>
          <Tabs
            items={[
              { id: 'name', label: 'Icon name' },
              { id: 'svg', label: 'SVG code' },
              { id: 'component', label: 'Component' }
            ]}
            activeTab={copyMode}
            onTabChange={setCopyMode}
          />
        </div>

        {/* Install */}
        <Code type="terminal" title="Install" className="mt-auto">{`npm install @modul-es/icons`}</Code>

        {/* Usage */}
        <Code title="Usage">
          {`import { Icon } from '@modul-es/icons';

<Icon set="${selectedSet}" name="${selectedIcon}" color="${validColor}"${selectedSet !== 'phosphor' && selectedSet !== 'pixelart' ? ` stroke="${selectedStroke}"` : ''}${selectedSet === 'phosphor' && selectedStyle ? ` style="${selectedStyle}"` : ''} />`}
        </Code>

      </div>

      {/* Right Side - Icon Grid */}
      <div className="w-full flex-1 bg-black grid grid-cols-4 lg:grid-cols-8 lg:grid-rows-6 h-fit lg:h-full">
        {isLoading ? (
          Array.from({ length: 48 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center border-r border-b border-neutral-800 last:border-r-0 [&:nth-child(4n)]:border-r-0 lg:[&:nth-child(4n)]:border-r lg:[&:nth-child(8n)]:border-r-0 [&:nth-child(n+45)]:border-b-0 lg:[&:nth-child(n+41)]:border-b-0">
              <Loader />
            </div>
          ))
        ) : (
          filteredIcons.map((iconName, index) => (
            <button
              key={`${selectedSet}-${iconName}-${index}`}
              className="relative flex items-center justify-center cursor-pointer hover:bg-neutral-900 aspect-square lg:aspect-auto border-r border-b border-neutral-800 last:border-r-0 [&:nth-child(4n)]:border-r-0 lg:[&:nth-child(4n)]:border-r lg:[&:nth-child(8n)]:border-r-0 [&:nth-child(n+45)]:border-b-0 lg:[&:nth-child(n+41)]:border-b-0"
              onClick={() => iconName && handleIconClick(iconName)}
            >
              {iconName && (
                <>
                  <Icon
                    name={iconName}
                    set={selectedSet as 'huge' | 'phosphor' | 'lucide' | 'pixelart'}
                    color={validColor}
                    stroke={selectedSet !== 'phosphor' && selectedSet !== 'pixelart' ? selectedStroke : undefined}
                    style={selectedSet === 'phosphor' && selectedStyle ? selectedStyle as 'thin' | 'light' | 'bold' | 'fill' | 'duotone' : undefined}
                    className="w-9"
                    key={`${selectedSet}-${iconName}-${validColor}-${selectedStroke}-${selectedStyle}`}
                  />

                  {/* Copy feedback */}
                  {copiedIcon === iconName && (
                      <p className="absolute bottom-0 text-center p-2.5 !text-xs font">
                        Copied {copyMode === 'name' ? 'name' : copyMode === 'svg' ? 'SVG' : 'component'}
                      </p>
                  )}
                </>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}