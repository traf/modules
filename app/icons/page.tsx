'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Icon } from '@modules/icons';
import { resolveColor } from '@modules/icons/src/colors';
import Code from '../components/Code';
import Input from '../components/Input';
import Loader from '../components/Loader';
import Tabs from '../components/Tabs';
import Dropdown from '../components/Dropdown';
import Badge from '../components/Badge';
import PageContent from '../components/PageContent';
import PageSidebar from '../components/PageSidebar';
import PageLayout from '../components/PageLayout';
import FormField from '../components/FormField';

const iconSets = {
  huge: ['home-01', 'analytics-01', 'signature', 'code-folder', 'qr-code-01', 'browser', 'checkmark-badge-02', 'chat-feedback', 'dollar-02', 'zap', 'victory-finger-02', 'square-lock-password', 'user-02', 'settings-02', 'search-01', 'mail-01', 'calendar-01', 'notification-01', 'image-01', 'download-01'],
  phosphor: ['house', 'chart-bar', 'signature', 'folder', 'qr-code', 'browser', 'check-circle', 'chat-circle', 'currency-dollar', 'lightning', 'hand-peace', 'lock', 'user', 'gear', 'magnifying-glass', 'envelope', 'calendar', 'star', 'heart', 'download'],
  lucide: ['house', 'activity', 'pencil', 'folder', 'qr-code', 'monitor', 'circle-check', 'message-circle', 'dollar-sign', 'zap', 'heart', 'lock', 'user', 'settings', 'search', 'mail', 'calendar', 'star', 'bookmark', 'download'],
  pixelart: ['home', 'chart', 'edit', 'folder', 'code', 'file', 'check', 'chat', 'dollar', 'zap', 'heart', 'lock', 'user', 'search', 'mail', 'calendar', 'bookmark', 'download', 'cloud', 'image']
};

const ICONS_PER_LOAD = 80;

function IconBox({ iconName, selectedSet, validColor, selectedStroke, selectedStyle, selectedSize, copiedIcon, copyMode, onClick }: {
  iconName: string;
  selectedSet: string;
  validColor: string;
  selectedStroke: string;
  selectedStyle: string;
  selectedSize: string;
  copiedIcon: string;
  copyMode: string;
  onClick: (iconName: string) => void;
}) {
  return (
    <button
      className="relative flex items-center justify-center cursor-pointer hover:bg-neutral-900 aspect-square border-r border-b border-neutral-800"
      onClick={() => onClick(iconName)}
    >
      <Icon
        name={iconName}
        set={selectedSet as 'huge' | 'phosphor' | 'lucide' | 'pixelart'}
        color={validColor}
        stroke={selectedSet !== 'phosphor' && selectedSet !== 'pixelart' ? selectedStroke : undefined}
        style={selectedSet === 'phosphor' && selectedStyle ? selectedStyle as 'thin' | 'light' | 'bold' | 'fill' | 'duotone' : undefined}
        size={selectedSize as 'xs' | 'sm' | 'md' | 'lg' | 'xl'}
        key={`${selectedSet}-${iconName}-${validColor}-${selectedStroke}-${selectedStyle}-${selectedSize}`}
      />

      {copiedIcon === iconName && (
        <p className="absolute bottom-0 text-center p-2.5 !text-xs font">
          Copied {copyMode === 'name' ? 'name' : copyMode === 'svg' ? 'SVG' : copyMode === 'image' ? 'URL' : 'component'}
        </p>
      )}
    </button>
  );
}

export default function IconsClient() {
  const [selectedSet, setSelectedSet] = useState<string>('huge');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [validColor, setValidColor] = useState<string>('white');
  const [selectedStroke, setSelectedStroke] = useState<string>('1.5');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('lg');
  const [selectedIcon, setSelectedIcon] = useState<string>('home-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allIcons, setAllIcons] = useState<Record<string, string[]>>({});
  const [displayCount, setDisplayCount] = useState<number>(ICONS_PER_LOAD);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedIcon, setCopiedIcon] = useState<string>('');
  const [copyMode, setCopyMode] = useState<string>('name');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef<boolean>(false);

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
        let url = `/api/icons/${selectedSet}/${iconName}.svg?color=${encodeURIComponent(validColor)}`;
        if (selectedSet !== 'phosphor' && selectedSet !== 'pixelart') {
          url += `&stroke=${encodeURIComponent(selectedStroke)}`;
        }
        if (selectedSet === 'phosphor' && selectedStyle) {
          url = `/api/icons/${selectedSet}/${iconName}.${selectedStyle}.svg?color=${encodeURIComponent(validColor)}`;
        }
        if (selectedSet === 'huge' && selectedStyle === 'sharp') {
          url = `/api/icons/${selectedSet}/${iconName}.sharp.svg?color=${encodeURIComponent(validColor)}&stroke=${encodeURIComponent(selectedStroke)}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          let svgContent = await response.text();

          const sizeMap: Record<string, number> = { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 };
          const iconSize = sizeMap[selectedSize] || 24;

          svgContent = svgContent.replace(/<\?xml[^>]*\?>/g, '');
          svgContent = svgContent.replace(/<!--[\s\S]*?-->/g, '');
          svgContent = svgContent.replace(/<svg([^>]*)>/i, (match, attrs) => {
            let newAttrs = attrs;
            newAttrs = newAttrs.replace(/\s(?:width|height)="[^"]*"/gi, '');
            newAttrs += ` width="${iconSize}" height="${iconSize}"`;
            if (selectedSet !== 'phosphor' && selectedSet !== 'lucide' && !newAttrs.includes('fill=')) {
              newAttrs += ` fill="currentColor"`;
            }
            if (!newAttrs.includes('shape-rendering=')) {
              newAttrs += ` shape-rendering="crispEdges"`;
            }
            return `<svg${newAttrs}>`;
          });

          await navigator.clipboard.writeText(svgContent.trim());
          setCopiedIcon(iconName);
          setTimeout(() => setCopiedIcon(''), 1000);
        }
      } catch {
        // Silently fail
      }
    } else if (copyMode === 'image') {
      try {
        const urlColor = validColor === 'white' ? 'black' : validColor;
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://modul.es';
        let url = `${baseUrl}/api/icons/${selectedSet}/${iconName}.svg?color=${encodeURIComponent(urlColor)}`;
        if (selectedSet !== 'phosphor' && selectedSet !== 'pixelart') {
          url += `&stroke=${encodeURIComponent(selectedStroke)}`;
        }
        if (selectedSet === 'phosphor' && selectedStyle) {
          url = `${baseUrl}/api/icons/${selectedSet}/${iconName}.${selectedStyle}.svg?color=${encodeURIComponent(urlColor)}`;
        }
        if (selectedSet === 'huge' && selectedStyle === 'sharp') {
          url = `${baseUrl}/api/icons/${selectedSet}/${iconName}.sharp.svg?color=${encodeURIComponent(urlColor)}&stroke=${encodeURIComponent(selectedStroke)}`;
        }
        url += `&size=${selectedSize}`;
        
        await navigator.clipboard.writeText(url);
        setCopiedIcon(iconName);
        setTimeout(() => setCopiedIcon(''), 1000);
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
        if (selectedSize !== 'md') {
          componentCode += ` size="${selectedSize}"`;
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
      setIsLoading(true);
      setDisplayCount(ICONS_PER_LOAD);
      try {
        const url = `/api/icons/search?set=${selectedSet}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`;
        const response = await fetch(url);
        if (response.ok) {
          const icons = await response.json();
          setAllIcons(prev => ({ ...prev, [`${selectedSet}-${searchQuery}`]: icons }));
        }
      } catch (error) {
        console.error('Failed to load icons:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIcons();
  }, [selectedSet, searchQuery]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!gridRef.current || isLoading || isLoadingMoreRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = gridRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 500) {
      const cacheKey = `${selectedSet}-${searchQuery}`;
      const totalIcons = allIcons[cacheKey]?.length || 0;

      setDisplayCount(prev => {
        if (prev < totalIcons) {
          isLoadingMoreRef.current = true;
          const newCount = Math.min(prev + ICONS_PER_LOAD, totalIcons);
          setTimeout(() => {
            isLoadingMoreRef.current = false;
          }, 100);
          return newCount;
        }
        return prev;
      });
    }
  }, [isLoading, selectedSet, searchQuery, allIcons]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    grid.addEventListener('scroll', handleScroll);
    return () => grid.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Autofocus on mount only
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Validate color input and update validColor only when valid
  useEffect(() => {
    if (!selectedColor.trim()) {
      setValidColor('white');
      return;
    }

    try {
      const resolved = resolveColor(selectedColor);
      if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(resolved)) {
        setValidColor(selectedColor);
      }
    } catch {
      // Keep previous valid color
    }
  }, [selectedColor]);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    const cacheKey = `${selectedSet}-${searchQuery}`;
    const currentSetIcons = allIcons[cacheKey] || [];
    return currentSetIcons.slice(0, displayCount);
  }, [selectedSet, searchQuery, allIcons, displayCount]);

  return (
    <PageLayout>
      <PageSidebar
        size="lg"
        footer={
          <>
            <Code type="terminal" title="Install">{`npm install @modul-es/icons`}</Code>
            <Code title="Usage">
              {`import { Icon } from '@modul-es/icons';

<Icon set="${selectedSet}" name="${selectedIcon}" color="${validColor}"${selectedSet !== 'phosphor' && selectedSet !== 'pixelart' ? ` stroke="${selectedStroke}"` : ''}${selectedSet === 'phosphor' && selectedStyle ? ` style="${selectedStyle}"` : ''}${selectedSize !== 'md' ? ` size="${selectedSize}"` : ''} />`}
            </Code>

            <div className="flex flex-col gap-5">
              <p className="text-white">Props</p>
              <div className="flex gap-2">
                <Badge className="flex-1 border">Set</Badge>
                <Badge className="flex-1 border">Color</Badge>
                <Badge className="flex-1 border">Size</Badge>
                <Badge className="flex-1 border">Style</Badge>
                <Badge className="flex-1 border">Stroke</Badge>
              </div>
            </div>
          </>
        }
      >
        <Input
          ref={searchInputRef}
          label="Search"
          placeholder="home, activity, window"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <FormField title="Set">
          <Tabs
            items={Object.keys(iconSets).map(setName => ({
              id: setName,
              label: setName
            }))}
            activeTab={selectedSet}
            onTabChange={setSelectedSet}
          />
        </FormField>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Color"
              placeholder="#0066ff, sky-600"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </div>

          {selectedSet !== 'phosphor' && selectedSet !== 'pixelart' && (
            <div className="w-36">
              <FormField title="Stroke">
                <Dropdown
                  items={[
                    { id: '1', label: '1' },
                    { id: '1.5', label: '1.5' },
                    { id: '2', label: '2' },
                    { id: '2.5', label: '2.5' }
                  ]}
                  value={selectedStroke}
                  onChange={setSelectedStroke}
                />
              </FormField>
            </div>
          )}

          {selectedSet === 'phosphor' && (
            <div className="w-36">
              <FormField title="Style">
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
              </FormField>
            </div>
          )}
        </div>

        <FormField title="Size">
          <Tabs
            items={[
              { id: 'xs', label: 'XS' },
              { id: 'sm', label: 'SM' },
              { id: 'md', label: 'MD' },
              { id: 'lg', label: 'LG' },
              { id: 'xl', label: 'XL' }
            ]}
            activeTab={selectedSize}
            onTabChange={setSelectedSize}
          />
        </FormField>

        <FormField title="Copy">
          <Tabs
            items={[
              { id: 'name', label: 'Name' },
              { id: 'svg', label: 'SVG' },
              { id: 'image', label: 'URL' },
              { id: 'component', label: 'Component' }
            ]}
            activeTab={copyMode}
            onTabChange={setCopyMode}
          />
        </FormField>
      </PageSidebar>

      <PageContent ref={gridRef}>
        <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 auto-rows-auto divide-x-2 divide-y-2 divide-neutral-800 divide-dashed">

          {isLoading && displayCount === ICONS_PER_LOAD ? (
            Array.from({ length: ICONS_PER_LOAD }).map((_, index) => (
              <div key={index} className="flex items-center justify-center aspect-square border-r border-b border-neutral-800 [&:nth-child(4n)]:border-r-0 lg:[&:nth-child(4n)]:border-r lg:[&:nth-child(8n)]:border-r-0">
                <Loader />
              </div>
            ))
          ) : (
            <>
              {filteredIcons.map((iconName, index) => (
                <IconBox
                  key={`${selectedSet}-${iconName}-${index}`}
                  iconName={iconName}
                  selectedSet={selectedSet}
                  validColor={validColor}
                  selectedStroke={selectedStroke}
                  selectedStyle={selectedStyle}
                  selectedSize={selectedSize}
                  copiedIcon={copiedIcon}
                  copyMode={copyMode}
                  onClick={handleIconClick}
                />
              ))}
            </>
          )}
        </div>
      </PageContent>
    </PageLayout>
  );
}