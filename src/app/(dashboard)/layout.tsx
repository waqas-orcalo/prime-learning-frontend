import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import type { ReactNode } from 'react'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return <DashboardLayout>{children}</DashboardLayout>
}
