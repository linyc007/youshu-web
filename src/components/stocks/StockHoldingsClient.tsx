'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { StockHolding, StockTransaction } from '@/types/stock'

interface StockHoldingsClientProps {
  transactions: StockTransaction[]
}

const currencySymbols: Record<string, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  HKD: 'HK$'
}

export function StockHoldingsClient({ transactions }: StockHoldingsClientProps) {
  // Calculate holdings
  const holdingsMap = transactions.reduce((acc, t) => {
    const symbol = t.symbol
    if (!acc[symbol]) {
      acc[symbol] = {
        symbol,
        quantity: 0,
        avgCost: 0,
        totalBuyCost: 0,
        totalBuyQuantity: 0,
        totalSellProceeds: 0,
        totalSellQuantity: 0,
        realizedPnL: 0,
        currency: t.currency || 'CNY',
      }
    }

    const h = acc[symbol]
    if (t.transaction_type === 'BUY') {
      h.quantity += t.quantity
      h.totalBuyCost += t.quantity * t.price
      h.totalBuyQuantity += t.quantity
    } else {
      h.quantity -= t.quantity
      h.totalSellProceeds += t.quantity * t.price
      h.totalSellQuantity += t.quantity
    }

    return acc
  }, {} as Record<string, StockHolding>)

  const holdings = Object.values(holdingsMap).map(h => {
    const avgCost = h.totalBuyQuantity > 0 ? h.totalBuyCost / h.totalBuyQuantity : 0
    const realizedPnL = h.totalSellProceeds - (avgCost * h.totalSellQuantity)
    return { ...h, avgCost, realizedPnL }
  }).filter(h => h.quantity !== 0 || h.realizedPnL !== 0)

  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({})

  const handlePriceChange = (symbol: string, price: string) => {
    const numPrice = parseFloat(price)
    if (!isNaN(numPrice)) {
      setCurrentPrices(prev => ({ ...prev, [symbol]: numPrice }))
    } else if (price === '') {
      const newPrices = { ...currentPrices }
      delete newPrices[symbol]
      setCurrentPrices(newPrices)
    }
  }

  // Aggregate by currency
  const summaryByCurrency = holdings.reduce((acc, h) => {
    const currency = h.currency
    if (!acc[currency]) {
      acc[currency] = {
        marketValue: 0,
        realizedPnL: 0,
        floatingPnL: 0
      }
    }
    
    const price = currentPrices[h.symbol] || h.avgCost
    const marketValue = h.quantity > 0 ? h.quantity * price : 0
    
    const currentFloating = currentPrices[h.symbol] && h.quantity > 0
      ? (currentPrices[h.symbol] - h.avgCost) * h.quantity 
      : 0

    acc[currency].marketValue += marketValue
    acc[currency].realizedPnL += h.realizedPnL
    acc[currency].floatingPnL += currentFloating
    
    return acc
  }, {} as Record<string, { marketValue: number, realizedPnL: number, floatingPnL: number }>)

  const currencies = Object.keys(summaryByCurrency)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总持仓市值</CardTitle>
          </CardHeader>
          <CardContent>
            {currencies.length === 0 ? (
              <div className="text-2xl font-bold">¥0.00</div>
            ) : (
              currencies.map(currency => {
                const data = summaryByCurrency[currency]
                const sym = currencySymbols[currency] || currency
                return (
                  <div key={currency} className="mb-3 last:mb-0">
                    <div className="text-xl font-bold">{sym}{data.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {currency} 浮动盈亏: 
                      <span className={data.floatingPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {data.floatingPnL >= 0 ? ' +' : ' '}{data.floatingPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </p>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">累计已实现盈亏</CardTitle>
          </CardHeader>
          <CardContent>
            {currencies.length === 0 ? (
              <div className="text-2xl font-bold">¥0.00</div>
            ) : (
              currencies.map(currency => {
                const data = summaryByCurrency[currency]
                const sym = currencySymbols[currency] || currency
                return (
                  <div key={currency} className={`text-xl font-bold mb-2 last:mb-0 ${data.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {sym}{data.realizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总盈亏 (已实现+浮动)</CardTitle>
          </CardHeader>
          <CardContent>
            {currencies.length === 0 ? (
              <div className="text-2xl font-bold">¥0.00</div>
            ) : (
              currencies.map(currency => {
                const data = summaryByCurrency[currency]
                const sym = currencySymbols[currency] || currency
                const totalPnL = data.realizedPnL + data.floatingPnL
                return (
                  <div key={currency} className={`text-xl font-bold mb-2 last:mb-0 ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {sym}{totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white">
        <div className="p-4 border-b font-semibold">持仓明细</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>代码</TableHead>
              <TableHead>当前持仓</TableHead>
              <TableHead>持仓成本</TableHead>
              <TableHead>当前价格</TableHead>
              <TableHead>浮动盈亏</TableHead>
              <TableHead>已实现盈亏</TableHead>
              <TableHead className="text-right">市值</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-gray-500">
                  暂无持仓股票。
                </TableCell>
              </TableRow>
            ) : (
              holdings.map((h) => {
                const currentPrice = currentPrices[h.symbol]
                const floatingPnL = currentPrice && h.quantity > 0 ? (currentPrice - h.avgCost) * h.quantity : 0
                const marketValue = currentPrice ? currentPrice * h.quantity : h.avgCost * h.quantity
                const sym = currencySymbols[h.currency] || ''

                return (
                  <TableRow key={h.symbol}>
                    <TableCell className="font-bold">
                      {h.symbol}
                      <div className="text-xs text-gray-400 font-normal">{h.currency}</div>
                    </TableCell>
                    <TableCell>{h.quantity}</TableCell>
                    <TableCell>{sym}{h.avgCost.toFixed(3)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="输入现价"
                        className="w-24 h-8 text-sm"
                        value={currentPrices[h.symbol] ?? ''}
                        onChange={(e) => handlePriceChange(h.symbol, e.target.value)}
                      />
                    </TableCell>
                    <TableCell className={floatingPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {currentPrice ? `${sym}${floatingPnL.toFixed(2)}` : '-'}
                      {currentPrice && h.quantity > 0 && (
                        <div className="text-xs opacity-70">
                          {((floatingPnL / (h.avgCost * h.quantity)) * 100).toFixed(2)}%
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={h.realizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {sym}{h.realizedPnL.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {sym}{marketValue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
