import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Tailwind color mapping
const tailwindColors: Record<string, string> = {
  // Red
  'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-200': '#fecaca', 'red-300': '#fca5a5',
  'red-400': '#f87171', 'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c',
  'red-800': '#991b1b', 'red-900': '#7f1d1d', 'red-950': '#450a0a',
  
  // Blue
  'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe', 'blue-300': '#93c5fd',
  'blue-400': '#60a5fa', 'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'blue-700': '#1d4ed8',
  'blue-800': '#1e40af', 'blue-900': '#1e3a8a', 'blue-950': '#172554',
  
  // Green
  'green-50': '#f0fdf4', 'green-100': '#dcfce7', 'green-200': '#bbf7d0', 'green-300': '#86efac',
  'green-400': '#4ade80', 'green-500': '#22c55e', 'green-600': '#16a34a', 'green-700': '#15803d',
  'green-800': '#166534', 'green-900': '#14532d', 'green-950': '#052e16',
  
  // Yellow
  'yellow-50': '#fefce8', 'yellow-100': '#fef3c7', 'yellow-200': '#fde68a', 'yellow-300': '#fcd34d',
  'yellow-400': '#fbbf24', 'yellow-500': '#f59e0b', 'yellow-600': '#d97706', 'yellow-700': '#b45309',
  'yellow-800': '#92400e', 'yellow-900': '#78350f', 'yellow-950': '#451a03',
  
  // Purple
  'purple-50': '#faf5ff', 'purple-100': '#f3e8ff', 'purple-200': '#e9d5ff', 'purple-300': '#d8b4fe',
  'purple-400': '#c084fc', 'purple-500': '#a855f7', 'purple-600': '#9333ea', 'purple-700': '#7c3aed',
  'purple-800': '#6b21a8', 'purple-900': '#581c87', 'purple-950': '#3b0764',
  
  // Common colors
  'black': '#000000',
  'white': '#ffffff',
  'transparent': 'transparent',
  'current': 'currentColor',
}

function resolveColor(color: string): string {
  // If it's already a hex color, return as is
  if (color.match(/^[0-9a-fA-F]{3,8}$/)) {
    return `#${color}`
  }
  
  // Check if it's a Tailwind color
  if (tailwindColors[color]) {
    return tailwindColors[color]
  }
  
  // If it starts with bg-, text-, border-, etc., extract the color part
  const colorMatch = color.match(/^(?:bg-|text-|border-|ring-|from-|to-|via-)?(.+)$/)
  if (colorMatch && tailwindColors[colorMatch[1]]) {
    return tailwindColors[colorMatch[1]]
  }
  
  // Default to the original color (might be a CSS color name)
  return color.startsWith('#') ? color : `#${color}`
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const color = searchParams.get('color')
    const stroke = searchParams.get('stroke')
    const style = searchParams.get('style')
    
    
    const params = await context.params
    
    // Construct file path
    let iconPath = params.path.join('/')
    
    // Handle style parameter for huge icons
    if (style === 'sharp' && iconPath.startsWith('huge/') && iconPath.endsWith('.svg')) {
      iconPath = iconPath.replace('.svg', '.sharp.svg')
    }
    
    // Map clean URLs to actual file paths in public/icons/
    const filePath = join(process.cwd(), 'public/icons', iconPath)
    
    // Read the SVG file
    const svgContent = await readFile(filePath, 'utf-8')
    
    let modifiedSvg = svgContent
    
    // Apply color modification
    if (color) {
      const resolvedColor = resolveColor(color)
      
      // Smart detection: check what the SVG actually uses
      const hasFill = /fill="[^"]*"/.test(modifiedSvg) && !/fill="none"/.test(modifiedSvg)
      const hasStroke = /stroke="[^"]*"/.test(modifiedSvg) && !/stroke="none"/.test(modifiedSvg)
      
      if (hasFill) {
        // SVG uses fill - apply color to fill
        modifiedSvg = modifiedSvg.replace(/fill="[^"]*"/g, `fill="${resolvedColor}"`)
      } else if (hasStroke) {
        // SVG uses stroke - apply color to stroke
        modifiedSvg = modifiedSvg.replace(/stroke="[^"]*"/g, `stroke="${resolvedColor}"`)
      }
    }
    
    
    // Apply stroke width modification
    if (stroke) {
      modifiedSvg = modifiedSvg.replace(/stroke-width="[^"]*"/g, `stroke-width="${stroke}"`)
    }
    
    return new NextResponse(modifiedSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Icon-Route': 'hit',
      },
    })
  } catch {
    return new NextResponse('Icon not found', { status: 404 })
  }
}