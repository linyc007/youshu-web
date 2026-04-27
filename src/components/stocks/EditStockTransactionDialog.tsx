'use client'

import { useEffect } from 'react'
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
import { StockTransaction } from '@/types/stock'

const stockSchema = z.object({
  symbol: z.string().min(1, '请输入股票代码'),
  transaction_type: z.enum(['BUY', 'SELL']),
  price: z.number().min(0, '价格必须大于等于0'),
  quantity: z.number().min(0, '数量必须大于等于0'),
  currency: z.string().min(1, '请选择币种'),
  transaction_date: z.string().min(1, '请选择日期'),
})

type StockFormValues = z.infer<typeof stockSchema>

interface EditStockTransactionDialogProps {
  transaction: StockTransaction
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditStockTransactionDialog({ transaction, open, onOpenChange }: EditStockTransactionDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      symbol: transaction.symbol,
      transaction_type: transaction.transaction_type,
      price: transaction.price,
      quantity: transaction.quantity,
      currency: transaction.currency,
      transaction_date: transaction.transaction_date,
    }
  })

  // Update form values when transaction prop changes
  useEffect(() => {
    if (transaction) {
      reset({
        symbol: transaction.symbol,
        transaction_type: transaction.transaction_type,
        price: transaction.price,
        quantity: transaction.quantity,
        currency: transaction.currency,
        transaction_date: transaction.transaction_date,
      })
    }
  }, [transaction, reset])

  const onSubmit = async (data: StockFormValues) => {
    try {
      const { error } = await supabase
        .from('stock_transactions')
        .update(data)
        .eq('id', transaction.id)

      if (error) {
        alert(`更新失败: ${error.message}`)
      } else {
        onOpenChange(false)
        router.refresh()
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑交易记录</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">代码</Label>
              <Input id="symbol" {...register('symbol')} />
              {errors.symbol && <p className="text-xs text-red-500">{errors.symbol.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">类型</Label>
              <Controller
                control={control}
                name="transaction_type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">买入</SelectItem>
                      <SelectItem value="SELL">卖出</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">成交价</Label>
              <Input type="number" step="0.001" {...register('price', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">成交数量</Label>
              <Input type="number" step="1" {...register('quantity', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">币种</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNY">人民币</SelectItem>
                      <SelectItem value="EUR">欧元</SelectItem>
                      <SelectItem value="USD">美元</SelectItem>
                      <SelectItem value="HKD">港币</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">日期</Label>
              <Input type="date" {...register('transaction_date')} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? '保存中...' : '确认更新'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
