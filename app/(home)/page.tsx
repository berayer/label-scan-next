'use client'

import { Button } from '@/components/ui/button'
import type { Stock } from '@/generated/prisma/client'
import { CalendarDaysIcon, PlusIcon, TrashIcon, UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import useSWR from 'swr'

interface StockTotal extends Stock {
  scan_count: number
  total_count: number
}

const fetcher = <R,>(url: string) => {
  return fetch(url).then((r): Promise<R> => r.json())
}

export default function Home() {
  const { data: stocks, mutate } = useSWR('/api/stock', fetcher<StockTotal[]>, {
    fallbackData: []
  })

  const router = useRouter()

  return (
    <div className="flex flex-col p-8 gap-4 h-svh w-full items-center">
      <div className="max-w-md w-full flex flex-col gap-4">
        <div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              router.push('/create')
            }}
          >
            <PlusIcon />
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {stocks.map((stock) => (
            <StockCard key={stock.id} stock={stock} onDelete={mutate} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StockCard({
  stock,
  onDelete
}: {
  stock: StockTotal
  onDelete: () => void
}) {
  const router = useRouter()
  const handleClick = useCallback(() => {
    router.push(`/stock/${stock.id}`)
  }, [stock, router])

  const handleDelete = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      await fetch('/api/stock', {
        method: 'DELETE',
        body: JSON.stringify({ id: stock.id })
      })
      onDelete()
    },
    [stock, onDelete]
  )

  return (
    <div
      className="group flex flex-col gap-4 border p-4 rounded-md hover:outline-1 outline-primary"
      onClick={handleClick}
    >
      <div className="flex justify-between">
        <span className="font-semibold">{stock.title}</span>
        <Button variant="destructive" size="icon" onClick={handleDelete}>
          <TrashIcon />
        </Button>
      </div>

      <div className="text-lg p-1">
        {stock.scan_count} / {stock.total_count}
      </div>

      <div className="flex gap-6 text-xs text-muted-foreground">
        <div className="flex gap-1 items-center ">
          <UserIcon className="size-4" />
          {stock.creator}
        </div>
        <div className="flex gap-1">
          <CalendarDaysIcon className="size-4" />
          {new Date(stock.create_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
