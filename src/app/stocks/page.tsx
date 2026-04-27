import { AppLayout } from '@/components/layout/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { AddStockTransactionDialog } from '@/components/stocks/AddStockTransactionDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StockHoldingsClient } from '@/components/stocks/StockHoldingsClient'
import { StockTransaction } from '@/types/stock'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const dynamic = 'force-dynamic'

export default async function StocksPage() {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  let transactions: StockTransaction[] = []
  if (userId) {
    const { data } = await supabase
      .from('stock_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
    if (data) transactions = data as StockTransaction[]
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">股票管理</h1>
            <p className="text-gray-500 mt-1">分析持仓盈亏并记录交易历史。</p>
          </div>
          <AddStockTransactionDialog />
        </div>

        <Tabs defaultValue="holdings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="holdings">持仓统计</TabsTrigger>
            <TabsTrigger value="history">交易历史</TabsTrigger>
          </TabsList>
          
          <TabsContent value="holdings" className="mt-6">
            <StockHoldingsClient transactions={transactions} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
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
                    <TableHead>成交金额</TableHead>
                    <TableHead className="text-right">日期</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-gray-500">
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
                        <TableCell className="text-right">{t.transaction_date}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
