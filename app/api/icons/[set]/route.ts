import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { keywordMap } from '../keywords';

let iconCache: Record<string, string[]> = {};

function searchIcons(iconNames: string[], query: string): string[] {
  if (!query.trim()) return iconNames;

  const lowerQuery = query.toLowerCase();
  const keywords = keywordMap[lowerQuery] || [];
  const allTerms = [lowerQuery, ...keywords];

  const scored = iconNames
    .map(iconName => {
      const lowerName = iconName.toLowerCase();
      let score = 0;

      for (const term of allTerms) {
        if (lowerName === term) {
          score = Math.max(score, 1000);
        } else if (lowerName.startsWith(term)) {
          score = Math.max(score, 900);
        } else if (lowerName.includes(term)) {
          score = Math.max(score, 800);
        } else {
          const nameParts = lowerName.split(/[-_]/);
          for (const part of nameParts) {
            if (part === term) {
              score = Math.max(score, 700);
            } else if (part.startsWith(term)) {
              score = Math.max(score, 600);
            } else if (part.includes(term)) {
              score = Math.max(score, 500);
            }
          }
        }
      }

      return { iconName, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.iconName);

  return scored;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ set: string }> }
) {
  try {
    const { set } = await params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    const validSets = ['huge', 'phosphor', 'lucide', 'pixelart'];
    if (!validSets.includes(set)) {
      return NextResponse.json({ error: 'Invalid icon set' }, { status: 400 });
    }

    const iconsDir = join(process.cwd(), 'public', 'icons', set);
    
    try {
      const files = await readdir(iconsDir);
      
      let iconNames = files
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''))
        .filter(name => !name.includes('.'))
        .sort();

      if (!iconCache[set]) {
        iconCache[set] = iconNames;
      }

      const results = searchIcons(iconCache[set], query);

      return NextResponse.json(results);
    } catch {
      return NextResponse.json({ error: 'Failed to read icons directory' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}