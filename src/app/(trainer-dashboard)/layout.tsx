import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import TrainerDashboardLayout from '@/components/layout/TrainerDashboardLayout'
import type { ReactNode } from 'react'

export default async function TrainerProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const role = (session.user as any)?.role as string | undefined
  // Only TRAINER (and admins who might browse) can access this route group
  if (role !== 'TRAINER' && role !== 'SUPER_ADMIN' && role !== 'ORG_ADMIN') {
    redirect('/dashboard')
  }

  return <TrainerDashboardLayout>{children}</TrainerDashboardLayout>
}
