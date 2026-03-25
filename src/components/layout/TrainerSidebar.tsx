'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`

const ICONS: Record<string, string> = {
  dashboard: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 10h6V2H2v8zm0 6h6v-4H2v4zm8 0h6v-8h-6v8zm0-14v4h6V2h-6z" fill="currentColor" opacity=".8"/></svg>`),
  tasks:     svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M5 9l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
  courses:   svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 2h9l3 3v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/><path d="M12 2v4h4" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 8h8M5 11h8M5 14h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`),
  message:   svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M16 3H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3l4 3 4-3h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`),
  reports:   svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="9" width="3" height="8" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="6" y="5" width="3" height="12" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="11" y="1" width="3" height="16" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>`),
  resources: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 15H3a1 1 0 01-1-1V4a1 1 0 011-1h5l2 2h5a1 1 0 011 1v8a1 1 0 01-1 1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`),
  help:      svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.5"/><path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="13.5" r=".75" fill="currentColor"/></svg>`),
  ai:        svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="5" width="12" height="9" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M6 5V3.5a1 1 0 011-1h4a1 1 0 011 1V5" stroke="currentColor" stroke-width="1.4"/><circle cx="6.5" cy="9.5" r="1" fill="currentColor"/><circle cx="11.5" cy="9.5" r="1" fill="currentColor"/><path d="M7 12h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`),
}

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/trainer-dashboard',           icon: 'dashboard', exact: true  },
  { label: 'Tasks',       href: '/trainer-dashboard/tasks',      icon: 'tasks',     exact: false },
  { label: 'Courses',     href: '/trainer-dashboard/courses',    icon: 'courses',   exact: false },
  { label: 'Message',     href: '/trainer-dashboard/messages',   icon: 'message',   exact: false },
  { label: 'Reports',     href: '/trainer-dashboard/reports',    icon: 'reports',   exact: false },
  { label: 'Resources',   href: '/trainer-dashboard/resources',  icon: 'resources', exact: false },
  { label: 'Help Centre', href: '/trainer-dashboard/help-centre',icon: 'help',      exact: false },
]

const FF = "'Inter', sans-serif"

function PrimeLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="100" height="50" viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="36" height="30" rx="3" fill="none" stroke="#1c1c1c" strokeWidth="2"/>
        <rect x="5" y="4" width="30" height="30" rx="2" fill="none" stroke="#1c1c1c" strokeWidth="1.2"/>
        <line x1="20" y1="4" x2="20" y2="34" stroke="#1c1c1c" strokeWidth="1.2"/>
        <path d="M26 6 Q36 2 38 10 Q33 12 30 17 L24 24 L26 6Z" fill="#1c1c1c"/>
        <path d="M24 24 L22 28 L26 26Z" fill="#1c1c1c"/>
        <text x="46" y="20" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="14" fill="#1c1c1c" letterSpacing="-0.4">Prime</text>
        <text x="46" y="32" fontFamily="Inter, sans-serif" fontWeight="400" fontSize="9" fill="#1c1c1c" letterSpacing="0.1">Learning Platform</text>
      </svg>
    </div>
  )
}

interface TrainerSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function TrainerSidebar({ isOpen = false, onClose }: TrainerSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      className={`t-sidebar${isOpen ? ' open' : ''}`}
      style={{
        width: '212px', flexShrink: 0,
        height: '100vh',
        backgroundColor: '#fff',
        borderRight: '1px solid rgba(28,28,28,0.1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', overflowX: 'hidden',
        padding: '16px',
        gap: '4px',
      }}
    >
      {/* Logo + close button row on mobile */}
      <div style={{ height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', flexShrink: 0, marginBottom: 4 }}>
        <PrimeLogo />
        {/* Close button — only visible on mobile via CSS */}
        <button
          onClick={onClose}
          aria-label="Close menu"
          style={{
            display: 'none', // shown via CSS on mobile
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 6, color: '#666',
          }}
          className="t-sidebar-close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px',
              borderRadius: '12px',
              backgroundColor: active ? '#000' : 'transparent',
              color: active ? '#fff' : '#1c1c1c',
              fontFamily: FF,
              fontSize: '14px',
              fontWeight: active ? 500 : 400,
              fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
              textDecoration: 'none',
              transition: 'background-color 0.1s',
            }}
          >
            <div style={{
              width: '20px', height: '20px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img
                src={ICONS[item.icon]}
                alt=""
                style={{
                  width: '18px', height: '18px',
                  filter: active ? 'invert(1)' : 'none',
                  opacity: active ? 1 : 0.75,
                }}
              />
            </div>
            {item.label}
          </Link>
        )
      })}

      {/* Ask Anything (bottom) */}
      <div style={{ marginTop: 'auto', paddingTop: '8px', flexShrink: 0 }}>
        <button style={{
          width: '100%', padding: '10px 12px',
          backgroundColor: 'rgba(28,28,28,0.04)',
          border: '1px solid rgba(28,28,28,0.1)',
          borderRadius: '12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontFamily: FF, fontSize: '14px', fontWeight: 400,
          color: 'rgba(28,28,28,0.7)',
          fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
        }}>
          <img src={ICONS.ai} width={18} height={18} alt="" style={{ opacity: 0.6 }} />
          Ask Anything?
        </button>
      </div>
    </aside>
  )
}
