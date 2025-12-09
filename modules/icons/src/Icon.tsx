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

export interface IconProps {
    name: string;
    color?: string;
    stroke?: string;
    style?: 'sharp' | 'default' | 'fill' | 'thin' | 'light' | 'bold' | 'duotone';
    set?: IconSet;
    className?: string;
    size?: IconSize | number | string;
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
    const [svgContent, setSvgContent] = useState<string | null>(null);
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

    useEffect(() => {
        const loadSvg = async () => {
            setError(false);

            try {
                const params = new URLSearchParams();
                if (color !== 'currentColor') {
                    const colorValue = resolveColor(color).replace('#', '');
                    params.set('color', colorValue);
                }
                if (stroke) params.set('stroke', stroke);

                const url = `https://modul.es/api/icons/${set}/${iconKey}.svg${params.toString() ? `?${params.toString()}` : ''}`;
                const response = await fetch(url, { mode: 'cors' });

                if (response.ok) {
                    const svg = await response.text();
                    setSvgContent(svg);
                } else {
                    setError(true);
                }
            } catch {
                setError(true);
            }
        };

        loadSvg();
    }, [color, stroke, set, iconKey]);

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
                newAttrs += ` className="${className}"`;
            }

            if (set !== 'phosphor' && set !== 'lucide' && !newAttrs.includes('fill=')) {
                newAttrs += ` fill="currentColor"`;
            }

            if (!newAttrs.includes('shape-rendering=')) {
                newAttrs += ` shape-rendering="crispEdges"`;
            }
            return `<svg${newAttrs}>`;
        });

        svg = svg.replace(/\sclass=/g, ' className=');

        return svg.trim();
    }, [svgContent, size, className, set]);

    if (error || !processedSvg) {
        return null;
    }

    return (
        <div dangerouslySetInnerHTML={{ __html: processedSvg }} />
    );
}