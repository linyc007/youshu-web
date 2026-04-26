'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

interface Asset {
  id: string
  name: string
  category: string
  purchase_price: number
  purchase_date: string
  status: string
}

export function MetricsCharts({ assets }: { assets: Asset[] }) {
  const activeAssets = assets.filter(a => a.status === 'ACTIVE')

  // 1. Pie Chart Data (Category Distribution)
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    activeAssets.forEach(asset => {
      counts[asset.category] = (counts[asset.category] || 0) + Number(asset.purchase_price || 0)
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [activeAssets])

  // 2. Line Chart Data (Asset Growth Trend)
  const growthData = useMemo(() => {
    // Sort all assets by date
    const sortedAssets = [...assets].sort((a, b) => 
      new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()
    )

    const dailyData: Record<string, number> = {}
    let runningTotal = 0

    sortedAssets.forEach(asset => {
      runningTotal += Number(asset.purchase_price || 0)
      dailyData[asset.purchase_date] = runningTotal
    })

    // Convert to array and ensure chronological order
    return Object.entries(dailyData)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [assets])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CardContainer title="资产分类占比 (按价值)">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContainer>

      <CardContainer title="累计资产价值增长趋势">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tickFormatter={(str) => str.split('-').slice(1).join('/')} 
            />
            <YAxis fontSize={12} />
            <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}`} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContainer>
    </div>
  )
}

function CardContainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
      </div>
      <div className="p-6 pt-0 h-[300px]">
        {children}
      </div>
    </div>
  )
}
