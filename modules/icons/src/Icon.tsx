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
                // First try with URL parameters
                const params = new URLSearchParams();
                if (color !== 'currentColor') params.set('color', color);
                if (stroke) params.set('stroke', stroke);

                const urlWithParams = `https://icons.modul.es/${set}/${iconKey}.svg${params.toString() ? `?${params.toString()}` : ''}`;

                console.log(`Fetching icon: ${urlWithParams}`);
                let response = await fetch(urlWithParams, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'force-cache'
                });

                // If it fails and we had parameters, try without them
                if (!response.ok && params.toString()) {
                    console.log(`Retrying without params: https://icons.modul.es/${set}/${iconKey}.svg`);
                    response = await fetch(`https://icons.modul.es/${set}/${iconKey}.svg`, {
                        method: 'GET',
                        mode: 'cors',
                        cache: 'force-cache'
                    });
                }

                if (response.ok) {
                    const svg = await response.text();
                    svgCache.set(cacheKey, svg);
                    setSvgContent(svg);
                } else {
                    console.warn(`Icon not found: ${urlWithParams} (${response.status})`);
                    setError(true);
                }
            } catch (err) {
                // If fetch with params failed due to CORS/network, try without params
                if (color !== 'currentColor' || stroke) {
                    try {
                        console.log(`Fetch failed, retrying without params: https://icons.modul.es/${set}/${iconKey}.svg`);
                        const response = await fetch(`https://icons.modul.es/${set}/${iconKey}.svg`, {
                            method: 'GET',
                            mode: 'cors',
                            cache: 'force-cache'
                        });

                        if (response.ok) {
                            const svg = await response.text();
                            svgCache.set(cacheKey, svg);
                            setSvgContent(svg);
                            return;
                        }
                    } catch (fallbackErr) {
                        console.error(`Fallback also failed for ${cacheKey}:`, fallbackErr);
                    }
                }

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

        // Size handling - only target SVG element attributes to avoid stroke-width corruption
        if (size) {
            svg = svg.replace(/<svg([^>]*)\swidth="[^"]*"([^>]*)>/i, `<svg$1 width="${size}"$2>`);
            svg = svg.replace(/<svg([^>]*)\sheight="[^"]*"([^>]*)>/i, `<svg$1 height="${size}"$2>`);
        } else {
            // Remove fixed dimensions for responsive sizing - only from SVG element
            svg = svg.replace(/<svg([^>]*)\swidth="[^"]*"([^>]*)>/i, '<svg$1$2>');
            svg = svg.replace(/<svg([^>]*)\sheight="[^"]*"([^>]*)>/i, '<svg$1$2>');
        }

        // Add className and ensure currentColor works
        svg = svg.replace(/<svg([^>]*)>/i, (match, attrs) => {
            // Add className
            let newAttrs = attrs;
            if (!newAttrs.includes('class=')) {
                newAttrs += ` class="${className}"`;
            }

            // Handle different icon types differently
            if (set === 'phosphor') {
                // Phosphor icons already have proper stroke setup, don't modify fill/stroke
                // They come with stroke="currentColor" and proper stroke-width
            } else if (set === 'pixelart') {
                // Pixelart icons have hardcoded fill colors that need to be replaced
                svg = svg.replace(/fill="#[^"]*"/g, 'fill="currentColor"');
                svg = svg.replace(/fill='#[^']*'/g, "fill='currentColor'");
            } else {
                // Other icon sets are fill-based
                if (!newAttrs.includes('fill=')) {
                    newAttrs += ` fill="currentColor"`;
                }
            }

            // Add crisp rendering attributes
            if (!newAttrs.includes('shape-rendering=')) {
                newAttrs += ` shape-rendering="crispEdges"`;
            }
            return `<svg${newAttrs}>`;
        });

        return svg.trim();
    }, [svgContent, size, className]);

    if (loading) {
        return null;
    }

    if (error || !processedSvg) {
        return null;
    }

    return (
        <div style={{ imageRendering: 'crisp-edges' }} dangerouslySetInnerHTML={{ __html: processedSvg }} />
    );
}