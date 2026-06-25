'use client'

import { UploadArea } from '@/components/upload-area'
import { useCallback, useMemo, useState } from 'react'
import * as xlsx from 'xlsx'
import { DataGrid } from 'react-data-grid'
import { Spinner } from '@/components/ui/spinner'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function Page() {
  const [bkName, setBkName] = useState('')
  const [originData, setOriginData] = useState<string[][]>([])
  const [primaryKey, setPrimaryKey] = useState('')
  const [state, setState] = useState<boolean>(false)
  const router = useRouter()

  // 列定义
  const columns = useMemo(() => {
    if (!originData.length) {
      return []
    }
    const line = originData[0]
    return line.map((item, index) => ({
      key: `column-${index}`,
      name: item.toString()
    }))
  }, [originData])

  // 前10条数据
  const previewData = useMemo(() => {
    const sliceData = originData.slice(1, 11)

    return sliceData.map((row) => {
      return row.reduce(
        (acc, cur, index) => {
          acc[`column-${index}`] = cur
          return acc
        },
        {} as Record<string, any>
      )
    })
  }, [originData])

  // 主键选项
  const selectOptions = useMemo(() => {
    if (!originData.length) {
      return []
    }
    const line = originData[0]
    return line.map((item, index) => ({
      value: index,
      label: item.toString()
    }))
  }, [originData])

  const handleUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const bstr = reader.result
      const wb = xlsx.read(bstr, { type: 'binary' })

      // 读取第一个工作表
      const wsName = wb.SheetNames[0]
      const ws = wb.Sheets[wsName]

      // 转换为 JSON 数组
      const jsonData = xlsx.utils.sheet_to_json(ws, { header: 1 })
      setBkName(file.name)
      setOriginData(jsonData as any[])
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDetection = useCallback(() => {
    if (!primaryKey) {
      setState(false)
      return
    }

    const idx = Number(primaryKey)
    console.log(idx)

    const coll = new Set<string>()

    for (const it of originData) {
      const key = it[idx]
      if (!key) {
        setState(false)
        toast.error('主键不能为空')
        return
      }

      if (coll.has(key)) {
        setState(false)
        toast.error('主键重复')
        return
      }
      coll.add(key)
    }
    setState(true)
  }, [primaryKey, originData])

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const result = await fetch('/api/stock', {
      method: 'POST',
      body: JSON.stringify({
        idx: Number(primaryKey),
        name: bkName,
        data: originData
      })
    }).then((r) => r.json())

    console.log(result)
    if (result.code == 1) {
      toast.success('创建成功')
      router.push('/')
    }
  }

  if (originData.length > 0) {
    return (
      <div className="h-svh w-full p-8 flex flex-col gap-4">
        <div>
          1. 数据预览: 【{bkName}】 总数: {originData.length - 1}
        </div>
        <DataGrid columns={columns} rows={previewData} />
        <div>2. 扫描列选择</div>
        <div className="flex gap-4">
          <Select
            onValueChange={(value) => {
              setPrimaryKey(value)
              setState(false)
            }}
          >
            <SelectTrigger className="w-full max-w-48">
              <SelectValue placeholder="选择扫描列" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {selectOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleDetection}
            className={cn(state && 'hidden')}
          >
            检测重复
          </Button>
        </div>
        <div>3. 保存上传数据</div>
        <div>
          <Button
            variant="default"
            disabled={!state || loading}
            onClick={handleSave}
          >
            {loading && <Spinner />} 保存
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-svh w-full p-8">
      <UploadArea accept=".xlsx" onChange={handleUpload} />
    </div>
  )
}
