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

const assetSchema = z.object({
  name: z.string().min(1, '请输入物品名称'),
  category: z.string().min(1, '请选择分类'),
  purchase_price: z.coerce.number({ invalid_type_error: '请输入有效数字' }).min(0, '价格必须大于等于0'),
  purchase_date: z.string().min(1, '请选择日期'),
})

type AssetFormValues = z.infer<typeof assetSchema>

export function AddAssetDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      category: '',
      purchase_price: 0,
      purchase_date: new Date().toISOString().split('T')[0],
    }
  })

  const onSubmit = async (data: AssetFormValues) => {
    console.log('正在提交数据:', data)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('未找到登录用户:', userError)
        alert('请先登录再操作')
        router.push('/login')
        return
      }

      const { error } = await supabase.from('assets').insert({
        user_id: user.id,
        name: data.name,
        category: data.category,
        purchase_price: data.purchase_price,
        purchase_date: data.purchase_date,
        status: 'ACTIVE'
      })

      if (error) {
        console.error('Supabase 插入错误:', error)
        alert(`保存失败: ${error.message}`)
      } else {
        console.log('保存成功！')
        setOpen(false)
        router.refresh()
        // 强制刷新当前路径数据
        window.location.reload()
      }
    } catch (err) {
      console.error('提交过程中发生意外错误:', err)
      alert('发生意外错误，请重试')
    }
  }

  const onInvalid = (errors: unknown) => {
    console.warn('表单校验未通过:', errors)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        onClick={() => setOpen(true)} 
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
      >
        录入新资产
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新资产</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">物品名称</Label>
            <Input id="name" placeholder="例如：MacBook Pro 16" {...register('name')} />
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

          <div className="space-y-2">
            <Label htmlFor="price">买入价格 (元)</Label>
            <Input 
              id="price" 
              type="number" 
              step="0.01" 
              {...register('purchase_price', { valueAsNumber: true })} 
            />
            {errors.purchase_price && <p className="text-xs text-red-500">{errors.purchase_price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">买入日期</Label>
            <Input id="date" type="date" {...register('purchase_date')} />
            {errors.purchase_date && <p className="text-xs text-red-500">{errors.purchase_date.message}</p>}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? '保存中...' : '确认录入'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
