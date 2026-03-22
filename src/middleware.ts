export { auth as middleware } from '@/lib/auth-server'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)'],
}
