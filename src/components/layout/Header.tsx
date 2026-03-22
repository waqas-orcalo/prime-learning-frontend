'use client'

import { useRef, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { BREADCRUMB_MAP } from '@/constants/nav'

const FF = "'Inter', sans-serif"
const font = (size: number, weight = 400, color = '#1c1c1c') => ({
  fontFamily: FF, fontSize: `${size}px`, fontWeight: weight, color,
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
})

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="4.5" stroke="rgba(28,28,28,0.4)" strokeWidth="1.3"/>
      <path d="M11 11l2.5 2.5" stroke="rgba(28,28,28,0.4)" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function CaretDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 7.5l5 5 5-5" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 3h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h2" stroke="#1c1c1c" strokeWidth="1.4" strokeLinecap="round"/>
      <rect x="7" y="2" width="6" height="3" rx="1" stroke="#1c1c1c" strokeWidth="1.4"/>
      <path d="M7 10h6M7 13h4" stroke="#1c1c1c" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2.5a5.5 5.5 0 0 0-5.5 5.5v3L3 13h14l-1.5-2V8A5.5 5.5 0 0 0 10 2.5z" stroke="#1c1c1c" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M8.5 17a1.5 1.5 0 0 0 3 0" stroke="#1c1c1c" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const crumbs = BREADCRUMB_MAP[pathname] ?? ['Dashboards']

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (name: string) => setOpenDropdown((p) => p === name ? null : name)

  return (
    <header
      ref={headerRef}
      style={{
        height: '72px', flexShrink: 0,
        backgroundColor: '#fff',
        borderBottom: '1px solid rgba(28,28,28,0.1)',
        display: 'flex', alignItems: 'center',
        padding: '0 28px', gap: '12px',
        position: 'sticky', top: 0, zIndex: 100,
      }}
    >
      {/* Breadcrumbs */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {i > 0 && (
              <span style={{ ...font(14, 400, 'rgba(28,28,28,0.2)') }}>/</span>
            )}
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 8px', borderRadius: '8px',
                ...font(14, i === crumbs.length - 1 ? 400 : 400,
                  i === crumbs.length - 1 ? '#1c1c1c' : 'rgba(28,28,28,0.4)'),
              }}
            >
              {crumb}
            </button>
          </span>
        ))}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '8px', padding: '4px 8px', height: '28px',
        width: '219px', flexShrink: 0, position: 'relative',
      }}>
        <SearchIcon />
        <span style={{ ...font(14, 400, 'rgba(28,28,28,0.4)'), flex: 1, lineHeight: '20px' }}>Search for account</span>
        <span style={{ ...font(12, 400, 'rgba(28,28,28,0.4)') }}>⌘/</span>
      </div>

      {/* Icon buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Tasks */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => toggle('tasks')}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              border: 'none', cursor: 'pointer',
              backgroundColor: openDropdown === 'tasks' ? 'rgba(28,28,28,0.08)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ClipboardIcon />
          </button>
          {openDropdown === 'tasks' && (
            <div style={{
              position: 'absolute', top: '44px', right: '0',
              backgroundColor: '#fff', borderRadius: '12px',
              boxShadow: '0px 8px 24px rgba(13,10,44,0.12)',
              border: '1px solid rgba(28,28,28,0.1)',
              width: '280px', zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
                <span style={{ ...font(14, 700) }}>My Tasks</span>
              </div>
              {['Review evidence submission', 'Complete Unit 3 quiz', 'Attend mentor session'].map((t, i) => (
                <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: i === 1 ? '#5fc966' : '#9747ff', flexShrink: 0 }} />
                  <span style={{ ...font(13, 400), flex: 1 }}>{t}</span>
                </div>
              ))}
              <button
                onClick={() => { router.push('/tasks'); setOpenDropdown(null) }}
                style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', ...font(13, 600, '#1c1c1c') }}
              >
                Show All Tasks →
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => toggle('messages')}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              border: 'none', cursor: 'pointer',
              backgroundColor: openDropdown === 'messages' ? 'rgba(28,28,28,0.08)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <BellIcon />
          </button>
          {openDropdown === 'messages' && (
            <div style={{
              position: 'absolute', top: '44px', right: '0',
              backgroundColor: '#fff', borderRadius: '12px',
              boxShadow: '0px 8px 24px rgba(13,10,44,0.12)',
              border: '1px solid rgba(28,28,28,0.1)',
              width: '300px', zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
                <span style={{ ...font(14, 700) }}>Messages</span>
              </div>
              {[
                { name: 'Sarah Connor', msg: 'Your assignment is due soon', time: '2h ago' },
                { name: 'Mike Johnson', msg: 'Great progress this week!', time: '5h ago' }
              ].map((m, i) => (
                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(28,28,28,0.06)', display: 'flex', gap: '10px', cursor: 'pointer' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ ...font(11, 700, '#fff') }}>{m.name[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...font(13, 600), lineHeight: '18px' }}>{m.name}</div>
                    <div style={{ ...font(12, 400, 'rgba(28,28,28,0.5)'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{m.msg}</div>
                  </div>
                  <span style={{ ...font(11, 400, 'rgba(28,28,28,0.4)'), flexShrink: 0 }}>{m.time}</span>
                </div>
              ))}
              <button
                onClick={() => { router.push('/messages'); setOpenDropdown(null) }}
                style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, ...font(13, 600, '#1c1c1c') }}
              >
                Show All Messages →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile badge */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => toggle('profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px', borderRadius: '12px',
            border: 'none', backgroundColor: 'transparent',
            cursor: 'pointer', width: '168px',
          }}
        >
          {/* Avatar */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '80px',
            backgroundColor: 'rgba(28,28,28,0.05)',
            overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="13" r="6" fill="#9291A5"/>
              <path d="M4 29c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#9291A5"/>
            </svg>
          </div>
          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' as const }}>
            <div style={{ ...font(14, 700, '#1c1c1c'), lineHeight: '20px' }}>John Doe</div>
            <div style={{ ...font(14, 400, 'rgba(28,28,28,0.6)'), lineHeight: '20px' }}>Learner</div>
          </div>
          <CaretDownIcon />
        </button>

        {openDropdown === 'profile' && (
          <div style={{
            position: 'absolute', top: '56px', right: '0',
            backgroundColor: '#fff', borderRadius: '12px',
            boxShadow: '0px 8px 24px rgba(13,10,44,0.12)',
            border: '1px solid rgba(28,28,28,0.1)',
            width: '220px', zIndex: 200, overflow: 'hidden',
          }}>
            {['Set Status', 'My Profile', 'Email preference', 'My Activity', 'User Guide', 'System Announcements'].map((item, i) => (
              <div
                key={i}
                style={{ padding: '10px 16px', borderBottom: i < 5 ? '1px solid rgba(28,28,28,0.06)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => { if (item === 'My Profile') router.push('/my-account') }}
              >
                <span style={{ ...font(13, 400) }}>{item}</span>
                <span style={{ color: 'rgba(28,28,28,0.3)', fontSize: '12px' }}>›</span>
              </div>
            ))}
            <div style={{ padding: '8px', borderTop: '1px solid rgba(28,28,28,0.08)' }}>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{ width: '100%', padding: '8px 12px', backgroundColor: 'rgba(244,63,94,0.08)', border: 'none', borderRadius: '8px', cursor: 'pointer', ...font(13, 600, '#e11d48') }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
