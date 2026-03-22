import type { Metadata } from 'next'
import '@/styles/globals.css'
import Providers from '@/components/common/Providers'
import ToastContainer from '@/components/common/Toast'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Prime Learning',
  description: 'Learner Dashboard',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}
