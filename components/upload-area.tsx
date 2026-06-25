'use client'

import { cn } from '@/lib/utils'
import { useDrop } from 'ahooks'
import { UploadIcon } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'

interface UploadAreaProps {
  onChange?: (file: File) => void
  accept?: string
  multiple?: boolean
  className?: string
  children?: React.ReactNode
}

export function UploadArea({
  onChange,
  accept,
  multiple,
  className,
  children = '点击此处上传'
}: UploadAreaProps) {
  const divRef = useRef<HTMLDivElement>(null)

  useDrop(divRef, {
    onFiles: (files: File[]) => {
      if (!multiple && files.length > 1) {
        toast.error('只能上传一个文件')
        return
      }

      files.forEach((file) => {
        onChange?.(file)
      })
    },
    onDragEnter: () => {
      divRef.current?.classList.add('border-gray-400')
    },
    onDrop: () => {
      divRef.current?.classList.remove('border-gray-400')
    },
    onDragLeave: () => {
      divRef.current?.classList.remove('border-gray-400')
    }
  })

  const handleClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept || '*'
    input.multiple = !!multiple
    input.onchange = (e) => {
      const el = e.target as HTMLInputElement
      if (!el.files) return
      for (let i = 0; i < el.files.length; i++) {
        const file = el.files[i]
        onChange?.(file)
      }
    }
    input.click()
  }

  return (
    <div
      ref={divRef}
      className={cn(
        'text-muted-foreground flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-8 py-6 text-sm select-none hover:border-gray-400',
        className
      )}
      onClick={handleClick}
    >
      <UploadIcon />
      {children}
    </div>
  )
}
