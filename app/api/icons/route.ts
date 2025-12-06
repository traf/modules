import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const iconsPath = join(process.cwd(), 'public', 'icons');
    const sets = await readdir(iconsPath);
    
    const iconSets: Record<string, string[]> = {};
    
    for (const set of sets) {
      if (set.startsWith('.')) continue;
      
      const setPath = join(iconsPath, set);
      const files = await readdir(setPath);
      
      // Get random 12 icons, remove .svg extension and .sharp variants
      // For phosphor, only show regular weight (no .fill, .thin, .light, .bold, .duotone variants)
      const allIcons = files
        .filter(file => file.endsWith('.svg') && !file.includes('.sharp.'))
        .map(file => file.replace('.svg', ''))
        .filter(name => {
          // For phosphor set, only show regular weight icons (no weight suffixes)
          if (set === 'phosphor') {
            return !name.match(/\.(fill|thin|light|bold|duotone)$/);
          }
          return true;
        });
      
      // Shuffle and take 12 random icons
      const shuffled = allIcons.sort(() => Math.random() - 0.5);
      const icons = shuffled.slice(0, 12);
      
      iconSets[set] = icons;
    }
    
    return NextResponse.json(iconSets);
  } catch (error) {
    console.error('Error reading icons:', error);
    return NextResponse.json({ error: 'Failed to read icons' }, { status: 500 });
  }
}