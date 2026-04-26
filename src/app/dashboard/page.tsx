import { AppLayout } from '@/components/layout/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { AddAssetDialog } from '@/components/dashboard/AddAssetDialog'
import { SellAssetDialog } from '@/components/dashboard/SellAssetDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const dynamic = 'force-dynamic'

interface Asset {
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

export default async function DashboardPage() {
  const supabase = createClient()
  
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  let assets: Asset[] = []
  if (userId) {
    const { data } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false })
    
    if (data) {
      assets = data as Asset[]
    }
  }

  const activeAssets = assets.filter(a => a.status === 'ACTIVE')
  
  // Group assets by currency
  const totalByCurrency = activeAssets.reduce((acc, asset) => {
    const currency = asset.currency || 'CNY'
    acc[currency] = (acc[currency] || 0) + Number(asset.purchase_price || 0)
    return acc
  }, {} as Record<string, number>)

  // Group daily cost by currency
  const dailyCostByCurrency = activeAssets.reduce((acc, asset) => {
    const currency = asset.currency || 'CNY'
    const purchaseDate = new Date(asset.purchase_date)
    const diffTime = Math.abs(today.getTime() - purchaseDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
    const cost = Number(asset.purchase_price) / diffDays
    acc[currency] = (acc[currency] || 0) + cost
    return acc
  }, {} as Record<string, number>)

  const currencySymbols: Record<string, string> = {
    'CNY': '¥',
    'EUR': '€',
    'USD': '$'
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">资产总览看板</h1>
            <p className="text-sm text-gray-500 mt-1">这里展示您目前的万物资产及折旧、日耗情况。</p>
          </div>
          <div className="flex">
            <AddAssetDialog />
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总资产价值 (买入价)</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(totalByCurrency).map(([currency, total]) => (
                <div key={currency} className="text-xl sm:text-2xl font-bold">
                  {currencySymbols[currency] || currency}{total.toFixed(2)}
                </div>
              ))}
              {Object.keys(totalByCurrency).length === 0 && <div className="text-xl sm:text-2xl font-bold">¥0.00</div>}
              <p className="text-xs text-muted-foreground mt-1">服役中资产总额</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">每日真实消耗 (日耗)</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(dailyCostByCurrency).map(([currency, total]) => (
                <div key={currency} className="text-xl sm:text-2xl font-bold">
                  {currencySymbols[currency] || currency}{total.toFixed(2)}
                </div>
              ))}
              {Object.keys(dailyCostByCurrency).length === 0 && <div className="text-xl sm:text-2xl font-bold">¥0.00</div>}
              <p className="text-xs text-muted-foreground mt-1">基于使用天数平摊</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">服役中资产数量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{activeAssets.length} 件</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">当前服役中资产</h2>
          <div className="rounded-md border bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">物品名称</TableHead>
                    <TableHead className="hidden sm:table-cell">分类</TableHead>
                    <TableHead>买入价格</TableHead>
                    <TableHead className="hidden md:table-cell">买入日期</TableHead>
                    <TableHead className="hidden sm:table-cell">使用天数</TableHead>
                    <TableHead>预估日耗</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                        暂无资产数据，请点击右上角录入。
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeAssets.map(asset => {
                      const purchaseDate = new Date(asset.purchase_date)
                      const diffTime = Math.abs(today.getTime() - purchaseDate.getTime())
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
                      const dailyCost = Number(asset.purchase_price) / diffDays

                      return (
                        <TableRow key={asset.id} className="text-sm">
                          <TableCell className="font-medium py-3">
                            <div>{asset.name}</div>
                            <div className="text-xs text-gray-400 sm:hidden">{asset.category}</div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{asset.category}</TableCell>
                          <TableCell>{currencySymbols[asset.currency || 'CNY']}{Number(asset.purchase_price).toFixed(2)}</TableCell>
                          <TableCell className="hidden md:table-cell">{asset.purchase_date}</TableCell>
                          <TableCell className="hidden sm:table-cell">{diffDays} 天</TableCell>
                          <TableCell>{currencySymbols[asset.currency || 'CNY']}{dailyCost.toFixed(2)}/天</TableCell>
                          <TableCell className="text-right">
                            <SellAssetDialog assetId={asset.id} assetName={asset.name} defaultCurrency={asset.currency} />
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* 流转复盘板块 */}
        <div className="mt-12 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-orange-700">闲置流转复盘</h2>
            <p className="text-xs sm:text-sm text-gray-500">统计已卖出资产的盈亏与持有成本</p>
          </div>
          <div className="rounded-md border border-orange-100 bg-orange-50/10 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-orange-50/30">
                  <TableRow>
                    <TableHead className="min-w-[120px]">物品名称</TableHead>
                    <TableHead>买入/卖出价</TableHead>
                    <TableHead className="hidden sm:table-cell">持有天数</TableHead>
                    <TableHead>盈亏</TableHead>
                    <TableHead className="hidden md:table-cell">总成本</TableHead>
                    <TableHead className="text-right">平均日耗</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.filter(a => a.status === 'SOLD').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                        暂无已流转资产。
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.filter(a => a.status === 'SOLD').map(asset => {
                      const buyDate = new Date(asset.purchase_date)
                      const sellDate = new Date(asset.sold_date || asset.purchase_date)
                      const diffTime = Math.abs(sellDate.getTime() - buyDate.getTime())
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
                      
                      const pPrice = Number(asset.purchase_price)
                      const sPrice = Number(asset.sold_price || 0)
                      const profit = sPrice - pPrice
                      const totalCost = pPrice - sPrice 
                      const dailyCost = totalCost / diffDays

                      return (
                        <TableRow key={asset.id} className="text-sm">
                          <TableCell className="py-3">
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-xs text-gray-400">{asset.category}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-[10px] text-gray-500">买: {currencySymbols[asset.currency || 'CNY']}{pPrice.toFixed(0)}</div>
                            <div className="font-medium text-orange-600">卖: {currencySymbols[asset.sold_currency || asset.currency || 'CNY']}{sPrice.toFixed(0)}</div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{diffDays} 天</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              profit >= 0 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              {profit >= 0 ? '+' : ''}{profit.toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {currencySymbols[asset.currency || 'CNY']}{totalCost.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {currencySymbols[asset.currency || 'CNY']}{dailyCost.toFixed(2)}/天
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
