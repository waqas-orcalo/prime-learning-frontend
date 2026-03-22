import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f7f9fb' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Header />
        <main style={{
          flex: 1, overflowY: 'auto',
          padding: '24px 28px',
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}
