import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

function tokenize(str: string): string[] {
  return str.toLowerCase().split(/[-_\s.]+/).filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

function scoreMatch(iconName: string, query: string): number {
  const name = iconName.toLowerCase();
  const q = query.toLowerCase();
  
  if (name === q) return 1000;
  if (name.startsWith(q)) return 900;
  if (name.includes(q)) return 800;
  
  const iconTokens = tokenize(iconName);
  let bestScore = 0;
  
  for (const token of iconTokens) {
    if (token === q) {
      bestScore = Math.max(bestScore, 700);
    } else if (token.startsWith(q)) {
      bestScore = Math.max(bestScore, 600);
    } else if (token.includes(q)) {
      bestScore = Math.max(bestScore, 500);
    } else {
      const distance = levenshtein(token, q);
      const maxLen = Math.max(token.length, q.length);
      const similarity = 1 - (distance / maxLen);
      
      if (similarity > 0.6) {
        bestScore = Math.max(bestScore, similarity * 400);
      }
    }
  }
  
  return bestScore;
}

function searchIcons(iconNames: string[], query: string): string[] {
  if (!query.trim()) return iconNames;

  const scored = iconNames
    .map(iconName => ({
      iconName,
      score: scoreMatch(iconName, query)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(item => item.iconName);
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
      
      const iconNames = files
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''))
        .filter(name => !name.includes('.'))
        .sort();

      const results = searchIcons(iconNames, query);

      return NextResponse.json(results);
    } catch {
      return NextResponse.json({ error: 'Failed to read icons directory' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}