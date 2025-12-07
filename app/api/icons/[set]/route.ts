import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ set: string }> }
) {
  try {
    const { set } = await params;
    
    // Validate the set parameter
    const validSets = ['huge', 'phosphor', 'lucide', 'pixelart'];
    if (!validSets.includes(set)) {
      return NextResponse.json({ error: 'Invalid icon set' }, { status: 400 });
    }

    const iconsDir = join(process.cwd(), 'public', 'icons', set);
    
    try {
      const files = await readdir(iconsDir);
      
      // Filter SVG files and remove the .svg extension
      let iconNames = files
        .filter(file => file.endsWith('.svg'))
        .map(file => file.replace('.svg', ''))
        .sort();

      // For phosphor, exclude style variants (keep only base/default icons)
      if (set === 'phosphor') {
        iconNames = iconNames.filter(name => 
          !name.includes('.thin') && 
          !name.includes('.light') && 
          !name.includes('.bold') && 
          !name.includes('.fill') && 
          !name.includes('.duotone')
        );
      }

      return NextResponse.json(iconNames);
    } catch (error) {
      console.error(`Error reading icons directory for set ${set}:`, error);
      return NextResponse.json({ error: 'Failed to read icons directory' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in icons API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}