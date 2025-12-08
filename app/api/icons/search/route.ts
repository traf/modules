import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { keywordMap } from '../keywords';

function searchIcons(iconNames: string[], query: string): string[] {
  if (!query.trim()) return iconNames;

  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 0);

  const scored = iconNames
    .map(iconName => {
      const lowerName = iconName.toLowerCase();
      const nameParts = lowerName.split(/[-_]/);
      let score = 0;
      let matchedWords = 0;

      // Check if all query words match
      for (const word of queryWords) {
        let wordMatched = false;
        const wordKeywords = keywordMap[word] || [];
        const wordTerms = [word, ...wordKeywords.slice(0, 3)]; // Limit keywords to first 3

        for (const term of wordTerms) {
          if (lowerName.includes(term) || nameParts.some(part => part === term || part.startsWith(term))) {
            wordMatched = true;
            break;
          }
        }

        if (wordMatched) matchedWords++;
      }

      // Only include icons where ALL query words matched
      if (matchedWords < queryWords.length) {
        return { iconName, score: 0 };
      }

      // Score based on match quality
      // Exact full match
      if (lowerName === lowerQuery || lowerName === lowerQuery.replace(/\s+/g, '-')) {
        score = 10000;
      }
      // Full query appears in name
      else if (lowerName.includes(lowerQuery.replace(/\s+/g, '-'))) {
        score = 9000;
      }
      // All words appear as separate parts
      else if (queryWords.every(word => nameParts.includes(word))) {
        score = 8000;
      }
      // All words appear somewhere
      else if (queryWords.every(word => lowerName.includes(word))) {
        score = 7000;
      }
      // Mixed matches with keywords
      else {
        score = 5000;
      }

      // Bonus for shorter names (more specific)
      score -= lowerName.length * 10;

      // Bonus if name starts with first query word
      if (lowerName.startsWith(queryWords[0])) {
        score += 1000;
      }

      return { iconName, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.iconName);

  return scored;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const set = searchParams.get('set') || '';
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