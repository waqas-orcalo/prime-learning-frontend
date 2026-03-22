'use client'

import { useRouter } from 'next/navigation'

interface PlaceholderPageProps {
  title?: string
}

export default function PlaceholderPage({ title = 'Coming Soon' }: PlaceholderPageProps) {
  const router = useRouter()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'none', border: '1px solid rgba(28,28,28,0.2)',
            borderRadius: '8px', padding: '4px 12px', height: '28px',
            cursor: 'pointer', fontFamily: "'Inter'", fontSize: '14px', color: '#1c1c1c',
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '-0.36px', color: '#000', margin: 0 }}>
          {title}
        </h1>
      </div>

      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid rgba(28,28,28,0.1)',
        padding: '60px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          backgroundColor: 'rgba(28,28,28,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="14" width="7" height="7" rx="1" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Inter'", fontWeight: 700, fontSize: '16px', color: '#1c1c1c' }}>
          {title}
        </div>
        <div style={{ fontFamily: "'Inter'", fontSize: '14px', color: 'rgba(28,28,28,0.5)' }}>
          This section is coming soon.
        </div>
      </div>
    </div>
  )
}
