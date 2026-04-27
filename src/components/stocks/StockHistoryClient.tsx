'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import { StockTransaction } from '@/types/stock'
import { EditStockTransactionDialog } from './EditStockTransactionDialog'

interface StockHistoryClientProps {
  transactions: StockTransaction[]
}

export function StockHistoryClient({ transactions }: StockHistoryClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [editingTransaction, setEditingTransaction] = useState<StockTransaction | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这笔交易记录吗？此操作不可撤销。')) return

    try {
      const { error } = await supabase
        .from('stock_transactions')
        .delete()
        .eq('id', id)

      if (error) {
        alert(`删除失败: ${error.message}`)
      } else {
        router.refresh()
        window.location.reload()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (transaction: StockTransaction) => {
    setEditingTransaction(transaction)
    setEditOpen(true)
  }

  return (
    <div className="rounded-md border bg-white">
      <div className="p-4 border-b font-semibold">交易记录流水</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>代码</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>价格</TableHead>
            <TableHead>数量</TableHead>
            <TableHead>币种</TableHead>
            <TableHead>总额</TableHead>
            <TableHead>日期</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24 text-gray-500">
                暂无股票交易记录。
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-bold">{t.symbol}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    t.transaction_type === 'BUY' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {t.transaction_type === 'BUY' ? '买入' : '卖出'}
                  </span>
                </TableCell>
                <TableCell>{t.price.toFixed(3)}</TableCell>
                <TableCell>{t.quantity}</TableCell>
                <TableCell>{t.currency}</TableCell>
                <TableCell>{(t.price * t.quantity).toFixed(2)}</TableCell>
                <TableCell>{t.transaction_date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editingTransaction && (
        <EditStockTransactionDialog
          transaction={editingTransaction}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  )
}
