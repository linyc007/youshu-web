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
import { Trash2 } from 'lucide-react'

interface DeleteAssetDialogProps {
  assetId: string
  assetName: string
}

export function DeleteAssetDialog({ assetId, assetName }: DeleteAssetDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const onDelete = async () => {
    try {
      setIsDeleting(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('请先登录再操作')
        router.push('/login')
        return
      }

      // Supabase RLS will handle security, but we eq('user_id', user.id) for safety
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId)
        .eq('user_id', user.id)

      if (error) {
        alert(`删除失败: ${error.message}`)
      } else {
        setOpen(false)
        router.refresh()
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
      alert('发生意外错误，请重试')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(true)} 
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除资产？</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除 “{assetName}” 吗？此操作将永久移除该资产及其所有关联数据，且无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                onDelete()
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? '正在删除...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
