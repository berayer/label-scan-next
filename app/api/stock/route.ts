import { Stock } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface StockTotal extends Stock {
  scan_count: number
  total_count: number
}

export async function GET() {
  const stocks = await prisma.$queryRaw<StockTotal[]>`
    select a.id,
           a.title,
           a.table_header,
           a.creator,
           a.create_at,
           count(case when b.scan_state then 1 end) as scan_count,
           count(b.id)                                 as total_count
    from Stock a
             left join StockRow b on a.id = b.stockId
    group by a.id, a.title, a.table_header, a.creator, a.create_at;
  `

  // 核心：在这里把 bigint 转换为普通 number
  const serializedStocks = stocks.map((stock) => ({
    ...stock,
    scan_count: Number(stock.scan_count),
    total_count: Number(stock.total_count)
  }))

  // 返回转换后的数组
  return NextResponse.json(serializedStocks)
}

export async function POST(r: NextRequest) {
  const { title } = await r.json()
  if (!title) return NextResponse.json({ code: -1, message: '参数错误' })
  await prisma.stock.create({
    data: {
      title
    }
  })
  return NextResponse.json({ code: 1 })
}
