'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Undo2 } from 'lucide-react'

interface UndoSellDialogProps {
  assetId: string
  assetName: string
}

export function UndoSellDialog({ assetId, assetName }: UndoSellDialogProps) {
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const onUndo = async () => {
    try {
      setIsProcessing(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('请先登录再操作')
        router.push('/login')
        return
      }

      // 1. 重置资产状态
      const { error: updateError } = await supabase
        .from('assets')
        .update({
          status: 'ACTIVE',
          sold_price: null,
          sold_date: null,
          sold_currency: null,
        })
        .eq('id', assetId)
        .eq('user_id', user.id)

      if (updateError) {
        alert(`撤销失败: ${updateError.message}`)
        return
      }

      // 2. 删除关联的 SELL 类型 transaction
      const { error: transError } = await supabase
        .from('transactions')
        .delete()
        .eq('asset_id', assetId)
        .eq('user_id', user.id)
        .eq('transaction_type', 'SELL')

      if (transError) {
        console.error('Failed to delete sell transaction:', transError.message)
        // We don't alert here as the primary asset state is already fixed
      }

      setOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert('发生意外错误，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)} 
        className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        title="撤销卖出"
      >
        <Undo2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认撤销卖出状态？</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要将 “{assetName}” 恢复为“服役中”状态吗？这会清除卖出价格和日期，并删除关联的卖出交易记录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                onUndo()
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isProcessing}
            >
              {isProcessing ? '正在处理...' : '确认撤销'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
