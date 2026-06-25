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
  const { idx, name, data } = (await r.json()) as {
    idx: number
    name: string
    data: string[][]
  }
  if (!idx) return NextResponse.json({ code: -1, message: '参数错误' })

  const header = data[0]

  const stock = await prisma.stock.create({
    data: {
      title: name,
      table_header: JSON.stringify(header)
    }
  })

  const batchData = data.slice(1).map((d) => ({
    stockId: stock.id,
    row_key: d[idx],
    row_data: JSON.stringify(d)
  }))

  // 批量插入明细
  await prisma.stockRow.createMany({
    data: batchData
  })

  return NextResponse.json({ code: 1 })
}

export async function DELETE(r: NextRequest) {
  const { id } = (await r.json()) as {
    id: number
  }
  if (id) {
    await prisma.stockRow.deleteMany({ where: { stockId: id } })
    await prisma.stock.deleteMany({ where: { id: id } })
  }
  return NextResponse.json({ code: 1 })
}
