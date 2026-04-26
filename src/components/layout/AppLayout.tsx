'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BarChart3, LineChart, Settings, LogOut, Menu, X } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: '概览 Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: '指标 Metrics', href: '/metrics', icon: BarChart3 },
  { name: '股票交易 Stocks', href: '/stocks', icon: LineChart },
  { name: '设置 Settings', href: '/settings', icon: Settings },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuthContext()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const NavContent = () => (
    <>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-sm font-medium text-gray-600">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </div>
      )}
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-xl font-bold tracking-tight">有数 Youshu</span>
        </div>
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <span className="text-xl font-bold tracking-tight">有数 Youshu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col h-[calc(100vh-64px)]">
          <NavContent />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 md:hidden sticky top-0 z-30">
          <span className="text-lg font-bold">有数 Youshu</span>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 -mr-1 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
