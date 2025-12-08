import React, { useState, useEffect, useMemo } from 'react';
import { resolveColor } from './colors'

export type IconSet = 'huge' | 'pixelart' | 'phosphor' | 'lucide';

export interface IconProps {
    name: string;
    color?: string;
    stroke?: string;
    style?: 'sharp' | 'default' | 'fill' | 'thin' | 'light' | 'bold' | 'duotone';
    set?: IconSet;
    className?: string;
    size?: number | string;
}

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

        let svg = svgContent;

        svg = svg.replace(/<\?xml[^>]*\?>/g, '');
        svg = svg.replace(/<!--[\s\S]*?-->/g, '');

        svg = svg.replace(/<svg([^>]*)\s(?:width|height)="[^"]*"([^>]*)>/gi, '<svg$1$2>');
        if (size) {
            svg = svg.replace(/<svg([^>]*)>/i, `<svg$1 width="${size}" height="${size}">`);
        }

        svg = svg.replace(/<svg([^>]*)>/i, (match, attrs) => {
            let newAttrs = attrs;
            if (!newAttrs.includes('class=')) {
                newAttrs += ` class="${className}"`;
            }

            if (set !== 'phosphor' && set !== 'lucide' && !newAttrs.includes('fill=')) {
                newAttrs += ` fill="currentColor"`;
            }

            if (!newAttrs.includes('shape-rendering=')) {
                newAttrs += ` shape-rendering="crispEdges"`;
            }
            return `<svg${newAttrs}>`;
        });

        return svg.trim();
    }, [svgContent, size, className, set]);

    if (error || !processedSvg) {
        return null;
    }

    return (
        <div style={{ imageRendering: 'crisp-edges' }} dangerouslySetInnerHTML={{ __html: processedSvg }} />
    );
}