'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f7f9fb' }}>
      {/* Mobile overlay backdrop */}
      <div
        className={`l-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar — gets .open class on mobile to slide in */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header onHamburgerClick={() => setSidebarOpen(o => !o)} />
        <main className="l-main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
