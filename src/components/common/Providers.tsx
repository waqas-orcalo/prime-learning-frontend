'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/query-client'
import type { ReactNode } from 'react'

/**
 * NOTE: RTK Query infrastructure is ready in src/store/.
 * To activate it, run `npm install` in the frontend folder (adds
 * @reduxjs/toolkit and react-redux), then swap this file for the
 * version in src/store/Providers.rtk.tsx which adds <ReduxProvider>
 * and the <TokenSync> component.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </SessionProvider>
  )
}
