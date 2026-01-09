import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { resolveColor } from '@modules/icons/src/colors'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const size = searchParams.get('size') || 'md'
    const rawColor = searchParams.get('color') || '000000'
    const rawBgColor = searchParams.get('bgColor') || 'ffffff'
    const color = resolveColor(rawColor)
    const bgColor = resolveColor(rawBgColor)
    const margin = parseInt(searchParams.get('margin') || '4')

    if (!url) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`

    const sizeMap: Record<string, number> = {
      sm: 256,
      md: 384,
      lg: 512
    }

    const width = sizeMap[size] || 384

    const qrCodeSvg = await QRCode.toString(normalizedUrl, {
      type: 'svg',
      width,
      margin,
      color: {
        dark: color,
        light: bgColor
      },
      errorCorrectionLevel: 'H'
    })

    return new NextResponse(qrCodeSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('QR code generation failed:', error)
    return new NextResponse('QR code generation failed', { status: 500 })
  }
}
