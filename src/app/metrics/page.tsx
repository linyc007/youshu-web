import { AppLayout } from '@/components/layout/AppLayout'
import { createClient } from '@/lib/supabase/server'
import { MetricsCharts } from '@/components/metrics/MetricsCharts'

export const dynamic = 'force-dynamic'

export default async function MetricsPage() {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  interface Asset {
    id: string
    name: string
    category: string
    purchase_price: number
    purchase_date: string
    status: string
  }

  let assets: Asset[] = []
  if (userId) {
    const { data } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: true })
    
    if (data) {
      assets = data
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据指标</h1>
          <p className="text-gray-500 mt-1">分析您的资产趋势与消耗数据。</p>
        </div>
        
        <MetricsCharts assets={assets} />
      </div>
    </AppLayout>
  )
}
