import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ code: -1, message: '参数错误' })
  }

  const mId = Number(id.trim())

  const stock = await prisma.stock.findUnique({
    where: {
      id: mId
    }
  })

  if (!stock) {
    return NextResponse.json({ code: -1, message: '数据不存在' })
  }

  const detail = await prisma.stockRow.findMany({
    where: { stockId: stock.id }
  })

  return NextResponse.json({ code: 1, stock, detail })
}

// 扫描API
export async function POST(r: NextRequest) {
  const { code, id } = (await r.json()) as { code: string; id: number }
  if (!code) {
    return NextResponse.json({ code: -1, message: '参数错误' })
  }

  const detail = await prisma.stockRow.findFirst({
    where: { stockId: id, row_key: code }
  })

  if (!detail) {
    return NextResponse.json({ code: -1, message: '条码不存在' })
  }

  if (detail.scan_state) {
    return NextResponse.json({ code: -1, message: '重复扫描' })
  }

  await prisma.stockRow.update({
    where: { id: detail.id },
    data: { scan_state: true }
  })

  return NextResponse.json({ code: 1 })
}
