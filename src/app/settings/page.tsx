import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
          <p className="text-gray-500 mt-1">管理您的个人偏好与账号设置。</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>个人偏好</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>货币单位</Label>
                <p className="text-sm text-muted-foreground">显示资产时使用的货币符号</p>
              </div>
              <div className="font-medium text-sm">CNY (¥)</div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>深色模式</Label>
                <p className="text-sm text-muted-foreground">跟随系统设置或手动切换</p>
              </div>
              {/* Note: Switch component might need to be checked if it exists or use a simple checkbox/placeholder */}
              <div className="text-sm text-muted-foreground">系统默认</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">账号安全</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">如果您想删除账号及所有相关资产数据，此操作不可逆。</p>
            <button className="text-sm font-medium text-red-600 hover:underline">删除我的账号</button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
