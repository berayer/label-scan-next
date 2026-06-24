'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useParams, useSearchParams } from 'next/navigation'

export default function StockDetailPage() {
  const params = useParams()
  const query = Object.fromEntries(useSearchParams())

  const id = params.id
  const title = query.title

  console.log(id, title)
  return (
    <div className=" h-svh flex flex-col gap-4">
      <div className="bg-muted h-10 flex items-center px-4 justify-between">
        <span className="font-semibold">{title}</span>
        <span>0 / 999</span>
        <div>
          <Button variant="outline" size="sm">
            导入数据
          </Button>
        </div>
      </div>
      <div className="px-4">
        <Input className="h-12" placeholder="在此处扫描" />
      </div>
      <div className="p-4">table</div>
    </div>
  )
}
