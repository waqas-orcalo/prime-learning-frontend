import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8), // matches backend @MinLength(8)
})

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = (auth?.user as any)?.role as string | undefined

      const isAdminRole =
        role === 'SUPER_ADMIN' || role === 'ORG_ADMIN'
      const isTrainerRole = role === 'TRAINER'

      const isPublicPath =
        nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/signup')

      const isAdminPath          = nextUrl.pathname.startsWith('/admin')
      const isTrainerPath        = nextUrl.pathname.startsWith('/trainer-dashboard')
      const isLearnerDashPath    = nextUrl.pathname.startsWith('/dashboard')

      if (!isPublicPath) {
        if (!isLoggedIn) return false // redirect to /login

        // Non-admin trying to reach /admin → send to role-appropriate home
        if (isAdminPath && !isAdminRole) {
          const fallback = isTrainerRole ? '/trainer-dashboard' : '/dashboard'
          return Response.redirect(new URL(fallback, nextUrl))
        }

        // Non-trainer trying to reach /trainer-dashboard → send to /dashboard
        if (isTrainerPath && !isTrainerRole && !isAdminRole) {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }

        // Trainer trying to reach /dashboard → send to /trainer-dashboard
        if (isLearnerDashPath && isTrainerRole) {
          return Response.redirect(new URL('/trainer-dashboard', nextUrl))
        }

        return true
      }

      // Logged-in user hitting a public page → send to role-appropriate home
      if (isLoggedIn) {
        let home = '/dashboard'
        if (isAdminRole)   home = '/admin'
        else if (isTrainerRole) home = '/trainer-dashboard'
        return Response.redirect(new URL(home, nextUrl))
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.accessToken = (user as any).accessToken
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).accessToken = token.accessToken
        ;(session.user as any).firstName = token.firstName
        ;(session.user as any).lastName = token.lastName
      }
      return session
    },
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

        try {
          const res = await fetch(`${apiUrl}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: parsed.data.email,
              password: parsed.data.password,
            }),
          })

          if (!res.ok) return null

          const body = await res.json()
          // backend returns: { statusCode, message, data: { accessToken, user } }
          const { accessToken, user } = body?.data ?? {}
          if (!accessToken || !user) return null

          return {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            accessToken,
          }
        } catch {
          // ── Dev fallback: backend not running ─────────────────────────────
          // Remove this block once the backend is running in your environment.
          if (
            parsed.data.email === 'learner@example.com' &&
            parsed.data.password === 'password123'
          ) {
            return {
              id: '1',
              name: 'John Doe',
              email: parsed.data.email,
              firstName: 'John',
              lastName: 'Doe',
              role: 'LEARNER',
              accessToken: 'mock-jwt-token',
            }
          }
          // Hardcoded trainer fallback
          if (
            parsed.data.email === 'trainer@example.com' &&
            parsed.data.password === 'password123'
          ) {
            return {
              id: '2',
              name: 'Jane Smith',
              email: parsed.data.email,
              firstName: 'Jane',
              lastName: 'Smith',
              role: 'TRAINER',
              accessToken: 'mock-trainer-jwt-token',
            }
          }
          // Hardcoded admin fallback
          if (
            parsed.data.email === 'admin@prime.com' &&
            parsed.data.password === 'Admin@123'
          ) {
            return {
              id: 'admin-001',
              name: 'Super Admin',
              email: parsed.data.email,
              firstName: 'Super',
              lastName: 'Admin',
              role: 'SUPER_ADMIN',
              accessToken: 'mock-admin-jwt-token',
            }
          }
          return null
        }
      },
    }),
  ],
}
