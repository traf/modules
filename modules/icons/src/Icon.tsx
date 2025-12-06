import React, { useState, useEffect, useMemo } from 'react';

export type IconSet = 'huge' | 'pixelart' | 'phosphor';

export interface IconProps {
    name: string;
    color?: string;
    stroke?: string;
    style?: 'sharp' | 'default' | 'fill' | 'thin' | 'light' | 'bold' | 'duotone';
    set?: IconSet;
    className?: string;
    size?: number | string;
}

// Cache for loaded SVG content
const svgCache = new Map<string, string>();

export function Icon({ 
    name, 
    color = 'currentColor',
    stroke,
    style, 
    set = 'huge',
    className = "w-6 select-none",
    size
}: IconProps) {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    const iconKey = useMemo(() => {
        let iconName = name.replace('.svg', '');
        
        if (set === 'phosphor' && typeof style === 'string' && ['thin', 'light', 'bold', 'fill', 'duotone'].includes(style)) {
            iconName = `${iconName}.${style}`;
        }
        
        if (set === 'huge' && style === 'sharp') {
            iconName = `${iconName}.sharp`;
        }
        
        return iconName;
    }, [name, set, style]);
    
    const cacheKey = `${set}/${iconKey}`;
    
    useEffect(() => {
        const loadSvg = async () => {
            // Check cache first
            if (svgCache.has(cacheKey)) {
                setSvgContent(svgCache.get(cacheKey)!);
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(false);
            
            try {
                const params = new URLSearchParams();
                if (color !== 'currentColor') params.set('color', color);
                if (stroke) params.set('stroke', stroke);
                
                const url = `https://icons.modul.es/${set}/${iconKey}.svg${params.toString() ? `?${params.toString()}` : ''}`;
                
                const response = await fetch(url);
                
                if (response.ok) {
                    const svg = await response.text();
                    svgCache.set(cacheKey, svg);
                    setSvgContent(svg);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(`Error loading icon ${cacheKey}:`, err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        
        loadSvg();
    }, [cacheKey, color, stroke, set, iconKey]);
    
    const processedSvg = useMemo(() => {
        if (!svgContent) return null;
        
        let svg = svgContent;
        
        // Remove XML declaration and comments for smaller size
        svg = svg.replace(/<\?xml[^>]*\?>/g, '');
        svg = svg.replace(/<!--[\s\S]*?-->/g, '');
        
        // Size handling
        if (size) {
            svg = svg.replace(/width="[^"]*"/g, `width="${size}"`);
            svg = svg.replace(/height="[^"]*"/g, `height="${size}"`);
        } else {
            // Remove fixed dimensions for responsive sizing
            svg = svg.replace(/\s*width="[^"]*"/g, '');
            svg = svg.replace(/\s*height="[^"]*"/g, '');
        }
        
        // Add className and ensure currentColor works
        svg = svg.replace(/<svg([^>]*)>/i, (match, attrs) => {
            // Add className
            let newAttrs = attrs;
            if (!newAttrs.includes('class=')) {
                newAttrs += ` class="${className}"`;
            }
            // Ensure fill/stroke use currentColor if not specified
            if (!newAttrs.includes('fill=')) {
                newAttrs += ` fill="currentColor"`;
            }
            return `<svg${newAttrs}>`;
        });
        
        return svg.trim();
    }, [svgContent, size, className]);
    
    if (loading || error || !processedSvg) {
        return null;
    }
    
    return (
        <div dangerouslySetInnerHTML={{ __html: processedSvg }} />
    );
}