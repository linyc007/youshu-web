'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil } from 'lucide-react'

const assetSchema = z.object({
  name: z.string().min(1, '请输入物品名称'),
  category: z.string().min(1, '请选择分类'),
  purchase_price: z.number().min(0, '价格必须大于等于0'),
  purchase_date: z.string().min(1, '请选择日期'),
  currency: z.string().min(1, '请选择币种'),
  status: z.string().optional(),
  sold_price: z.number().optional(),
  sold_date: z.string().optional(),
  sold_currency: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetSchema>

interface EditAssetDialogProps {
  asset: {
    id: string
    name: string
    category: string
    purchase_price: number
    purchase_date: string
    currency: string
    status: string
    sold_price?: number
    sold_date?: string
    sold_currency?: string
  }
}

export function EditAssetDialog({ asset }: EditAssetDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset.name,
      category: asset.category,
      purchase_price: Number(asset.purchase_price),
      purchase_date: asset.purchase_date,
      currency: asset.currency || 'CNY',
      status: asset.status,
      sold_price: asset.sold_price ? Number(asset.sold_price) : undefined,
      sold_date: asset.sold_date,
      sold_currency: asset.sold_currency,
    }
  })

  const onSubmit = async (data: AssetFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('请先登录再操作')
        router.push('/login')
        return
      }

      const updateData: {
        name: string
        category: string
        purchase_price: number
        purchase_date: string
        currency: string
        sold_price?: number
        sold_date?: string
        sold_currency?: string
      } = {
        name: data.name,
        category: data.category,
        purchase_price: data.purchase_price,
        purchase_date: data.purchase_date,
        currency: data.currency,
      }

      if (asset.status === 'SOLD') {
        updateData.sold_price = data.sold_price
        updateData.sold_date = data.sold_date
        updateData.sold_currency = data.sold_currency
      }

      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', asset.id)
        .eq('user_id', user.id)

      if (error) {
        alert(`更新失败: ${error.message}`)
      } else {
        setOpen(false)
        router.refresh()
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
      alert('发生意外错误，请重试')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)} 
        className="h-8 w-8 text-gray-500"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑资产信息</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">物品名称</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="电子数码">电子数码</SelectItem>
                    <SelectItem value="摄影摄像">摄影摄像</SelectItem>
                    <SelectItem value="交通工具">交通工具</SelectItem>
                    <SelectItem value="生活家电">生活家电</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">买入价格</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                {...register('purchase_price', { valueAsNumber: true })} 
              />
              {errors.purchase_price && <p className="text-xs text-red-500">{errors.purchase_price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">币种</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="币种" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                      <SelectItem value="EUR">欧元 (EUR)</SelectItem>
                      <SelectItem value="USD">美元 (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.currency && <p className="text-xs text-red-500">{errors.currency.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">买入日期</Label>
            <Input id="date" type="date" {...register('purchase_date')} />
            {errors.purchase_date && <p className="text-xs text-red-500">{errors.purchase_date.message}</p>}
          </div>

          {asset.status === 'SOLD' && (
            <>
              <div className="pt-2 border-t mt-4 mb-2">
                <p className="text-sm font-semibold text-orange-600">卖出信息修改</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sold_price">卖出价格</Label>
                  <Input 
                    id="sold_price" 
                    type="number" 
                    step="0.01" 
                    {...register('sold_price', { valueAsNumber: true })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sold_currency">卖出币种</Label>
                  <Controller
                    control={control}
                    name="sold_currency"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || 'CNY'}>
                        <SelectTrigger>
                          <SelectValue placeholder="币种" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                          <SelectItem value="EUR">欧元 (EUR)</SelectItem>
                          <SelectItem value="USD">美元 (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sold_date">卖出日期</Label>
                <Input id="sold_date" type="date" {...register('sold_date')} />
              </div>
            </>
          )}

          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '确认修改'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
