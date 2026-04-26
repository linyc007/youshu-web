import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MetricsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据指标</h1>
          <p className="text-gray-500 mt-1">分析您的资产趋势与消耗数据（开发中）。</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>资产趋势</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
              图表占位符
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>分类比例</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
              图表占位符
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
