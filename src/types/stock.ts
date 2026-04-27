export interface StockTransaction {
  id: string
  symbol: string
  transaction_type: 'BUY' | 'SELL'
  price: number
  quantity: number
  currency: string
  transaction_date: string
}

export interface StockHolding {
  symbol: string
  quantity: number
  avgCost: number
  totalBuyCost: number
  totalBuyQuantity: number
  totalSellProceeds: number
  totalSellQuantity: number
  realizedPnL: number
  currency: string
  currentPrice?: number
}
