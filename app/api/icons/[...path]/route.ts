import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { resolveColor } from '@modules/shared'

function applyColorByIconSet(svg: string, iconPath: string, resolvedColor: string): string {
  const [iconSet] = iconPath.split('/')

  switch (iconSet) {
    case 'phosphor':
      return applyPhosphorColor(svg, resolvedColor)
    case 'huge':
      return applyHugeColor(svg, resolvedColor)
    case 'pixelart':
      return applyPixelartColor(svg, resolvedColor)
    default:
      // Fallback to generic color application
      return applyGenericColor(svg, resolvedColor)
  }
}

function applyPhosphorColor(svg: string, resolvedColor: string): string {
  // Handle duotone icons (have both opacity and stroke)
  if (/opacity="0\.2"/.test(svg) && /stroke="currentColor"/.test(svg)) {
    let modified = svg.replace(/stroke="currentColor"/g, `stroke="${resolvedColor}"`)
    // Color the background path (with opacity) by adding fill
    modified = modified.replace(/opacity="0\.2"/g, `opacity="0.2" fill="${resolvedColor}"`)
    return modified
  }

  // Phosphor icons use stroke="currentColor" for outline variants
  if (/stroke="currentColor"/.test(svg)) {
    let modified = svg.replace(/stroke="currentColor"/g, `stroke="${resolvedColor}"`)
    // Clean up any interfering hardcoded fills (keep fill="none")
    modified = modified.replace(/fill="#[a-fA-F0-9]{6}"/g, 'fill="none"')
    modified = modified.replace(/fill="#[a-fA-F0-9]{3}"/g, 'fill="none"')
    return modified
  }

  // Phosphor fill variants use solid fills
  if (/fill="(?!none)[^"]*"/.test(svg.replace(/<rect[^>]*fill="none"[^>]*>/g, ''))) {
    return svg.replace(/fill="(?!none)[^"]*"/g, `fill="${resolvedColor}"`)
  }

  // Fallback for phosphor icons without explicit coloring
  return applyGenericColor(svg, resolvedColor)
}

function applyHugeColor(svg: string, resolvedColor: string): string {
  // Huge icons typically use stroke-based coloring
  if (/stroke="(?!none)[^"]*"/.test(svg)) {
    return svg.replace(/stroke="(?!none)[^"]*"/g, `stroke="${resolvedColor}"`)
  }

  // Some huge icons use fill
  if (/fill="(?!none)[^"]*"/.test(svg)) {
    return svg.replace(/fill="(?!none)[^"]*"/g, `fill="${resolvedColor}"`)
  }

  return applyGenericColor(svg, resolvedColor)
}

function applyPixelartColor(svg: string, resolvedColor: string): string {
  // Pixelart icons typically use fill
  if (/fill="(?!none)[^"]*"/.test(svg)) {
    return svg.replace(/fill="(?!none)[^"]*"/g, `fill="${resolvedColor}"`)
  }

  return applyGenericColor(svg, resolvedColor)
}

function applyGenericColor(svg: string, resolvedColor: string): string {
  // Generic fallback: try fill first, then stroke, then add fill
  if (/fill="(?!none)[^"]*"/.test(svg)) {
    return svg.replace(/fill="(?!none)[^"]*"/g, `fill="${resolvedColor}"`)
  }

  if (/stroke="(?!none)[^"]*"/.test(svg)) {
    return svg.replace(/stroke="(?!none)[^"]*"/g, `stroke="${resolvedColor}"`)
  }

  // Add fill to drawable elements as last resort
  return svg.replace(/<(circle|ellipse|rect|polygon|path|line|polyline)(?![^>]*fill=)(?![^>]*stroke=)/g, `<$1 fill="${resolvedColor}"`)
}

function applyStrokeByIconSet(svg: string, iconPath: string, strokeWidth: string): string {
  const [iconSet] = iconPath.split('/')

  switch (iconSet) {
    case 'phosphor':
      // Phosphor icons have designed weights - don't modify stroke-width
      return svg
    case 'huge':
    case 'pixelart':
      // These icon sets support stroke width modification
      if (/stroke="(?!none)[^"]*"/.test(svg)) {
        return svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`)
      }
      return svg
    default:
      // Generic: apply stroke width if stroke exists
      if (/stroke="(?!none)[^"]*"/.test(svg)) {
        return svg.replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`)
      }
      return svg
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
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

    // Apply color modification using icon set-specific rules
    if (color) {
      const resolvedColor = resolveColor(color)
      modifiedSvg = applyColorByIconSet(modifiedSvg, iconPath, resolvedColor)
    }


    // Apply stroke width modification using icon set-specific rules
    if (stroke) {
      modifiedSvg = applyStrokeByIconSet(modifiedSvg, iconPath, stroke)
    }

    return new NextResponse(modifiedSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Icon-Route': 'hit',
      },
    })
  } catch {
    return new NextResponse('404', { status: 404 })
  }
}