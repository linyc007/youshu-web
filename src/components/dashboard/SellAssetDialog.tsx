'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const sellAssetSchema = z.object({
  sold_price: z.preprocess((val) => Number(val), z.number().min(0, '价格必须大于等于0')),
  sold_date: z.string().min(1, '请选择日期'),
})

type SellAssetFormValues = z.infer<typeof sellAssetSchema>

interface SellAssetDialogProps {
  assetId: string
  assetName: string
}

export function SellAssetDialog({ assetId, assetName }: SellAssetDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SellAssetFormValues>({
    resolver: zodResolver(sellAssetSchema),
    defaultValues: {
      sold_price: 0,
      sold_date: new Date().toISOString().split('T')[0],
    }
  })

  const onSubmit = async (data: SellAssetFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('请先登录再操作')
        router.push('/login')
        return
      }

      // 更新资产状态为 SOLD，并记录卖出信息
      const { error: updateError } = await supabase
        .from('assets')
        .update({
          status: 'SOLD',
          sold_price: data.sold_price,
          sold_date: data.sold_date,
        })
        .eq('id', assetId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('更新资产失败:', updateError)
        alert(`更新失败: ${updateError.message}`)
        return
      }

      // 同时记录一条交易记录
      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          asset_id: assetId,
          user_id: user.id,
          transaction_type: 'SELL',
          amount: data.sold_price,
          transaction_date: data.sold_date,
          notes: `卖出资产: ${assetName}`,
        })

      if (transError) {
        console.warn('记录交易失败 (可选):', transError)
      }

      setOpen(false)
      router.refresh()
      // 强制刷新
      window.location.reload()
    } catch (err) {
      console.error('提交过程中发生意外错误:', err)
      alert('发生意外错误，请重试')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
          卖出
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>资产卖出结算: {assetName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="sold_price">卖出价格 (元)</Label>
            <Input 
              id="sold_price" 
              type="number" 
              step="0.01" 
              {...register('sold_price', { valueAsNumber: true })} 
            />
            {errors.sold_price && <p className="text-xs text-red-500">{errors.sold_price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sold_date">卖出日期</Label>
            <Input id="sold_date" type="date" {...register('sold_date')} />
            {errors.sold_date && <p className="text-xs text-red-500">{errors.sold_date.message}</p>}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white">
              {isSubmitting ? '正在提交...' : '确认卖出'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
