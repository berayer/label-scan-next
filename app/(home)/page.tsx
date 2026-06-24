'use client'

import { Button } from '@/components/ui/button'
import type { Stock } from '@/generated/prisma/client'
import { UserIcon, CalendarDaysIcon, PlusIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import useSWR from 'swr'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { useRouter } from 'next/navigation'

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

  return (
    <div className="flex flex-col p-8 gap-4 h-svh w-full items-center">
      <div className="max-w-md w-full flex flex-col gap-4">
        <div>
          <DialogButtonForm onSuccess={mutate} />
        </div>

        <div className="flex flex-col gap-4">
          {stocks.map((stock) => (
            <StockCard key={stock.id} stock={stock} />
          ))}
        </div>
      </div>
    </div>
  )
}

function StockCard({ stock }: { stock: StockTotal }) {
  const router = useRouter()
  const handleClick = useCallback(() => {
    router.push(`/stock/${stock.id}?title=${stock.title}`)
  }, [stock, router])

  return (
    <div
      className="flex flex-col gap-4 border p-4 rounded-md hover:outline-1 outline-primary"
      onClick={handleClick}
    >
      <div className="flex justify-between">
        <span className="font-semibold">{stock.title}</span>
        <Badge className="bg-green-700">进行中</Badge>
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

function DialogButtonForm({ onSuccess }: { onSuccess: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const isMobile = useIsMobile()

  const handleSubmit = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const formValues = Object.fromEntries(formData.entries())
      const title = formValues.title || ''
      if (!title) {
        toast.error('标题不能为空')
        return
      }

      const result = await fetch('/api/stock', {
        method: 'POST',
        body: JSON.stringify({ title })
      }).then((r) => r.json())

      if (result.code != 1) {
        toast.error(result.message)
        return
      }

      closeRef.current?.click()
      onSuccess()
    },
    [onSuccess]
  )

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon">
            <PlusIcon />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <DrawerHeader>
              <DrawerTitle>新建</DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <FieldGroup>
                <Field>
                  <Label htmlFor="title">标题</Label>
                  <Input id="title" name="title" autoComplete="off" autoFocus />
                </Field>
              </FieldGroup>
            </div>
            <DrawerFooter>
              <Button type="submit">保存</Button>
              <DrawerClose asChild>
                <Button ref={closeRef} variant="outline">
                  取消
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>新建</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="title">标题</Label>
              <Input id="title" name="title" autoComplete="off" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button ref={closeRef} variant="outline">
                取消
              </Button>
            </DialogClose>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
