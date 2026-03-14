import React, { useState, useEffect, useMemo } from 'react';
import { resolveColor } from './colors'

export type IconSet = 'huge' | 'pixelart' | 'phosphor' | 'lucide';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<IconSize, number> = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40
};

const svgCache = new Map<string, string>();
const failedUrls = new Set<string>();
const LS_PREFIX = 'modul-es-icon:';
const LS_MAX = 200;

function writeToStorage(url: string, svg: string) {
    try {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k?.startsWith(LS_PREFIX) && k !== LS_PREFIX + url) keys.push(k);
        }
        if (keys.length >= LS_MAX) {
            for (let i = 0; i <= keys.length - LS_MAX; i++) {
                localStorage.removeItem(keys[i]);
            }
        }
        localStorage.setItem(LS_PREFIX + url, svg);
    } catch {}
}

function hydrateFromStorage() {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(LS_PREFIX)) {
                const svg = localStorage.getItem(key);
                if (svg) svgCache.set(key.slice(LS_PREFIX.length), svg);
            }
        }
    } catch {}
}

if (typeof window !== 'undefined') hydrateFromStorage();

export interface IconProps {
    name: string;
    color?: string;
    stroke?: string;
    style?: 'sharp' | 'default' | 'fill' | 'sharp-fill' | 'thin' | 'light' | 'bold' | 'duotone';
    set?: IconSet;
    className?: string;
    size?: IconSize | number | string;
}

function buildUrl(set: string, iconKey: string, color: string, stroke?: string): string {
    const params = new URLSearchParams();
    if (color !== 'currentColor') {
        const colorValue = resolveColor(color).replace('#', '');
        params.set('color', colorValue);
    }
    if (stroke) params.set('stroke', stroke);
    return `https://modul.es/api/icons/${set}/${iconKey}.svg${params.toString() ? `?${params.toString()}` : ''}`;
}

export async function preloadIcons(icons: { name: string; set?: string; color?: string; stroke?: string }[]) {
    await Promise.all(icons.map(async ({ name, set = 'huge', color = 'currentColor', stroke }) => {
        const iconKey = name.replace('.svg', '');
        const url = buildUrl(set, iconKey, color, stroke);
        if (svgCache.has(url) || failedUrls.has(url)) return;
        try {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) {
                const svg = await res.text();
                svgCache.set(url, svg);
                writeToStorage(url, svg);
            }
        } catch {}
    }));
}

export function Icon({
    name,
    color = 'currentColor',
    stroke,
    style,
    set = 'huge',
    className,
    size = 'md'
}: IconProps) {
    const iconKey = useMemo(() => {
        let iconName = name.replace('.svg', '');

        if (set === 'phosphor' && (style === 'thin' || style === 'light' || style === 'bold' || style === 'fill' || style === 'duotone')) {
            iconName = `${iconName}.${style}`;
        }

        if (set === 'huge') {
            if (style === 'sharp') {
                iconName = `${iconName}.sharp`;
            } else if (style === 'fill') {
                iconName = `${iconName}.fill`;
            } else if (style === 'sharp-fill') {
                iconName = `${iconName}.sharp.fill`;
            }
        }

        return iconName;
    }, [name, set, style]);

    const url = useMemo(() => buildUrl(set, iconKey, color, stroke), [set, iconKey, color, stroke]);

    const [svgContent, setSvgContent] = useState<string | null>(() => svgCache.get(url) ?? null);
    const [error, setError] = useState(() => failedUrls.has(url));
    const [currentUrl, setCurrentUrl] = useState(url);

    if (currentUrl !== url) {
        setCurrentUrl(url);
        const cached = svgCache.get(url);
        if (cached) {
            setSvgContent(cached);
            setError(false);
        } else if (failedUrls.has(url)) {
            setSvgContent(null);
            setError(true);
        } else {
            setSvgContent(null);
            setError(false);
        }
    }

    useEffect(() => {
        if (svgCache.has(url) || failedUrls.has(url)) return;

        let cancelled = false;

        const loadSvg = async () => {
            try {
                const response = await fetch(url, { mode: 'cors' });
                if (cancelled) return;

                if (response.ok) {
                    const svg = await response.text();
                    svgCache.set(url, svg);
                    writeToStorage(url, svg);
                    setSvgContent(svg);
                } else {
                    failedUrls.add(url);
                    setError(true);
                }
            } catch {
                if (!cancelled) {
                    failedUrls.add(url);
                    setError(true);
                }
            }
        };

        loadSvg();
        return () => { cancelled = true; };
    }, [url]);

    const processedSvg = useMemo(() => {
        if (!svgContent) return null;

        const iconSize = typeof size === 'string' && size in SIZE_MAP 
            ? SIZE_MAP[size as IconSize]
            : typeof size === 'number' 
            ? size 
            : 24;

        let svg = svgContent;

        svg = svg.replace(/<\?xml[^>]*\?>/g, '');
        svg = svg.replace(/<!--[\s\S]*?-->/g, '');

        svg = svg.replace(/<svg([^>]*)>/i, (match, attrs) => {
            let newAttrs = attrs;
            
            newAttrs = newAttrs.replace(/\s(?:width|height)="[^"]*"/gi, '');
            
            newAttrs += ` width="${iconSize}" style="height: auto;"`;

            if (className) {
                newAttrs = newAttrs.replace(/\sclass="[^"]*"/gi, '');
                newAttrs += ` class="${className}"`;
            }

            if (set !== 'phosphor' && set !== 'lucide' && !newAttrs.includes('fill=')) {
                newAttrs += ` fill="currentColor"`;
            }

            if (set === 'pixelart' && !newAttrs.includes('shape-rendering=')) {
                newAttrs += ` shape-rendering="crispEdges"`;
            }
            return `<svg${newAttrs}>`;
        });

        return svg.trim();
    }, [svgContent, size, className, set]);

    const iconSize = typeof size === 'string' && size in SIZE_MAP 
        ? SIZE_MAP[size as IconSize]
        : typeof size === 'number' 
        ? size 
        : 24;

    if (error) {
        return null;
    }

    return (
        <span 
            style={{ 
                width: iconSize,
                height: iconSize,
            }}
            dangerouslySetInnerHTML={processedSvg ? { __html: processedSvg } : undefined}
        />
    );
}