import { AppLayout } from '@/components/layout/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { AddStockTransactionDialog } from '@/components/stocks/AddStockTransactionDialog'
import { StockHistoryClient } from '@/components/stocks/StockHistoryClient'
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
            <StockHistoryClient transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
