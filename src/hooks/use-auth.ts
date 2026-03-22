'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { setUser, clearAuth } = useAppStore()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const user = session?.user ?? null

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      router.push('/dashboard')
      router.refresh()
      return { success: true }
    }

    return { success: false, error: result?.error || 'Invalid credentials' }
  }

  const logout = async () => {
    clearAuth()
    await signOut({ callbackUrl: '/login' })
  }

  return { user, isLoading, isAuthenticated, login, logout }
}
