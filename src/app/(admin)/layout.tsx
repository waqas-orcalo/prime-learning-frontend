import { auth } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Admin Layout
 * Guards every route under (admin). Only SUPER_ADMIN and ORG_ADMIN may access.
 * All other roles are bounced back to /dashboard.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const role = (session.user as any)?.role as string | undefined
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ORG_ADMIN'
  if (!isAdmin) redirect('/dashboard')

  return <>{children}</>
}
