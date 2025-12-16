import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

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
    const color = searchParams.get('color') || '#000000'
    const bgColor = searchParams.get('bgColor') || '#ffffff'
    const margin = parseInt(searchParams.get('margin') || '4')
    const errorCorrection = searchParams.get('errorCorrection') || 'M'

    if (!url) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`

    const sizeMap: Record<string, number> = {
      xs: 256,
      sm: 256,
      md: 512,
      lg: 512,
      xl: 1024
    }

    const width = sizeMap[size] || 512

    const qrCodeSvg = await QRCode.toString(normalizedUrl, {
      type: 'svg',
      width,
      margin,
      color: {
        dark: color,
        light: bgColor
      },
      errorCorrectionLevel: errorCorrection as 'L' | 'M' | 'Q' | 'H'
    })

    return new NextResponse(qrCodeSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, must-revalidate',
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
