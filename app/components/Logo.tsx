'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/modules/icons/src/Icon';
import Link from 'next/link';

const icons = [
    'square',
    'circle',
    'diamond',
    'house-simple',
    'hexagon',
    'first-aid',
    'spade',
    'pentagon',
    'club',
    'triangle',
    'seal',
];

export default function Logo({ className }: { className?: string }) {
    const [currentIconIndex, setCurrentIconIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Preload all icons on mount
    useEffect(() => {
        icons.forEach(icon => {
            const img = new Image();
            img.src = `https://modul.es/api/icons/phosphor/${icon}.fill.svg?color=white`;
        });
    }, []);

    // Handle hover cycling
    useEffect(() => {
        if (isHovering) {
            intervalRef.current = setInterval(() => {
                setCurrentIconIndex(prev => (prev + 1) % icons.length);
            }, 150);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setCurrentIconIndex(0); // Reset to first icon
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isHovering]);

    return (
        <Link 
            href="/" 
            className={`flex items-center justify-center w-16 h-14 ${className}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <Icon set="phosphor" name={icons[currentIconIndex]} color="white" style="fill" size="sm" />
        </Link>
    );
}