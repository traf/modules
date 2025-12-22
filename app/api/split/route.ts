import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function splitGrid(buffer: Buffer, cols: number, rows: number, frameBorder: number = 0) {
  const image = sharp(buffer);
  const { width, height } = await image.metadata();
  
  if (!width || !height) {
    throw new Error('Invalid image');
  }

  const frameWidth = Math.floor(width / cols);
  const frameHeight = Math.floor(height / rows);

  const frames = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      frames.push({
        left: col * frameWidth + frameBorder,
        top: row * frameHeight + frameBorder,
        width: frameWidth - (frameBorder * 2),
        height: frameHeight - (frameBorder * 2),
      });
    }
  }

  return frames;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const cols = parseInt(formData.get('cols') as string) || 3;
    const rows = parseInt(formData.get('rows') as string) || 3;
    const frameBorder = parseInt(formData.get('frameBorder') as string) || 0;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const frames = await splitGrid(buffer, cols, rows, frameBorder);

    const images = await Promise.all(
      frames.map(async (frame) => {
        const png = await sharp(buffer)
          .extract(frame)
          .png()
          .toBuffer();

        return {
          url: `data:image/png;base64,${png.toString('base64')}`,
          width: frame.width,
          height: frame.height,
        };
      })
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Split error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
