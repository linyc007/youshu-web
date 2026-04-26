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
  status: string
  sold_price?: number
  sold_date?: string
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
  
  const totalValue = activeAssets.reduce((sum, asset) => sum + Number(asset.purchase_price || 0), 0)

  // Calculate daily consumption (日耗): total price / days since purchase
  // We'll aggregate this over all active assets
  let totalDailyCost = 0
  const today = new Date()

  activeAssets.forEach(asset => {
    const purchaseDate = new Date(asset.purchase_date)
    const diffTime = Math.abs(today.getTime() - purchaseDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1 // at least 1 day
    totalDailyCost += Number(asset.purchase_price) / diffDays
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">资产总览看板</h1>
            <p className="text-gray-500 mt-1">这里展示您目前的万物资产及折旧、日耗情况。</p>
          </div>
          <AddAssetDialog />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总资产价值 (买入价)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{totalValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">服役中资产总额</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">每日真实消耗 (日耗)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{totalDailyCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">基于使用天数平摊</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">服役中资产数量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAssets.length} 件</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">当前服役中资产</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>物品名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>买入价格</TableHead>
                  <TableHead>买入日期</TableHead>
                  <TableHead>使用天数</TableHead>
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
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>{asset.category}</TableCell>
                        <TableCell>¥{Number(asset.purchase_price).toFixed(2)}</TableCell>
                        <TableCell>{asset.purchase_date}</TableCell>
                        <TableCell>{diffDays} 天</TableCell>
                        <TableCell>¥{dailyCost.toFixed(2)} / 天</TableCell>
                        <TableCell className="text-right">
                          <SellAssetDialog assetId={asset.id} assetName={asset.name} />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 流转复盘板块 */}
        <div className="mt-12 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-orange-700">闲置流转复盘</h2>
            <p className="text-sm text-gray-500">统计已卖出资产的盈亏与持有成本</p>
          </div>
          <div className="rounded-md border border-orange-100 bg-orange-50/10">
            <Table>
              <TableHeader className="bg-orange-50/30">
                <TableRow>
                  <TableHead>物品名称</TableHead>
                  <TableHead>买入/卖出价</TableHead>
                  <TableHead>持有天数</TableHead>
                  <TableHead>盈亏金额</TableHead>
                  <TableHead>总使用成本</TableHead>
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
                    const totalCost = pPrice - sPrice // 实际上用户花掉的钱
                    const dailyCost = totalCost / diffDays

                    return (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-xs text-gray-400">{asset.category}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-500">买: ¥{pPrice.toFixed(0)}</div>
                          <div className="font-medium text-orange-600">卖: ¥{sPrice.toFixed(0)}</div>
                        </TableCell>
                        <TableCell>{diffDays} 天</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            profit >= 0 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>¥{totalCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">¥{dailyCost.toFixed(2)} / 天</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
