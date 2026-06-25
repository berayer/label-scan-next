'use client'

import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Stock, StockRow } from '@/generated/prisma/client'
import { useParams } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Column, DataGrid, DataGridHandle } from 'react-data-grid'
import { toast } from 'sonner'
import useSWR from 'swr'

export default function StockDetailPage() {
  const params = useParams()
  const id = params.id
  const [error, setError] = useState('')
  const gridRef = useRef<DataGridHandle>(null)

  const fetcher = useCallback(
    (url: string) => {
      return fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (data.code != 1) {
            setError(data.message)
            return undefined
          }

          const stock = data.stock as Stock
          const details = data.detail as StockRow[]
          return { stock, details }
        })
    },
    [setError]
  )

  const { data, mutate } = useSWR(`/api/detail?id=${id}`, fetcher)

  const columns = useMemo((): Column<Record<string, any>>[] => {
    if (!data) return []
    const header = JSON.parse(data.stock.table_header!) as string[]
    return header.map((item, index) => ({
      key: `column-${index}`,
      name: item.toString(),
      resizable: true
    }))
  }, [data])

  const rows = useMemo((): Record<string, any>[] => {
    if (!data) return []
    return data.details.map((l) => {
      const raw = JSON.parse(l.row_data!) as string[]
      return {
        scan_state: l.scan_state,
        ...raw.reduce(
          (acc, cur, index) => {
            acc[`column-${index}`] = cur
            return acc
          },
          {} as Record<string, any>
        )
      }
    })
  }, [data])

  const rowClass = (row: Record<string, any>) => {
    return row.scan_state ? '!bg-green-200' : ''
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const handleInput = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const value = (inputRef.current?.value || '').trim()
        if (!value) return
        inputRef.current!.disabled = true

        const result = await fetch('/api/detail', {
          method: 'POST',
          body: JSON.stringify({ code: value })
        }).then((r) => r.json())

        if (result.code == 1) {
          mutate()
          const idx = data?.details.findIndex((r) => r.row_key == value)
          console.log(idx)
          gridRef.current?.scrollToCell({ rowIdx: idx })
        } else {
          toast.error(result.message)
        }

        inputRef.current!.disabled = false
        inputRef.current!.value = ''
        inputRef.current!.focus()
      }
    },
    [data, mutate]
  )

  if (error) {
    return (
      <div className=" h-svh flex w-full items-center justify-center text-red-500">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className=" h-svh flex w-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="h-svh flex flex-col gap-4">
      <div className="bg-muted h-10 flex items-center px-4 justify-between">
        <span className="font-semibold">{data.stock.title}</span>
        <div className="flex items-center gap-4">
          <span>扫描:</span>
          <span>{data.details.filter((f) => f.scan_state).length}</span>
          <span>总数:</span>
          <span> {data.details.length}</span>
        </div>
      </div>
      <div className="px-4">
        <Input
          ref={inputRef}
          className="h-12"
          placeholder="在此处扫描"
          autoFocus
          autoComplete="off"
          onKeyDown={handleInput}
        />
      </div>
      <DataGrid
        ref={gridRef}
        columns={columns}
        rows={rows}
        rowClass={rowClass}
        className="flex-1!"
      />
    </div>
  )
}
