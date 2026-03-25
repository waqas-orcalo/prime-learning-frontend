'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`

const ICONS: Record<string, string> = {
  dashboard: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>`),
  tasks: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M5 9l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
  learning: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L2 6l7 4 7-4-7-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 11l7 4 7-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
  journals: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="1" width="12" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M6 5h6M6 8h6M6 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`),
  scorecard: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.5"/><path d="M6 9l2.5 2.5L13 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
  courses: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 3h12v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3z" stroke="currentColor" stroke-width="1.5"/><path d="M1 3h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`),
  progress: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><polyline points="2,13 6,8 10,11 16,4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
  resources: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10 2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 2v6h6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`),
  help: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7.5" stroke="currentColor" stroke-width="1.5"/><path d="M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="13.5" r=".75" fill="currentColor"/></svg>`),
  message: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M16 3H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3l4 3 4-3h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`),
  account: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6.5" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M2 16.5c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`),
  eportfolio: svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 4h12v1H3zM2 5h14v11H2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 9.5L7 7v6l3.5-2.5" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`),
}

const NAV_MAIN = [
  { label: 'Dashboards', items: [
    { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  ]},
  { label: null, items: [
    { label: 'Tasks', href: '/tasks', icon: 'tasks' },
    { label: 'Learning Activities', href: '/learning-activities', icon: 'learning' },
    { label: 'Leaning Journals', href: '/learning-journals', icon: 'journals' },
    { label: 'Scorecard', href: '/scorecard', icon: 'scorecard' },
    { label: 'Courses', href: '/courses', icon: 'courses' },
    { label: 'Progress', href: '/progress-review', icon: 'progress' },
    // { label: 'Resources', href: '/resources', icon: 'resources' },
    { label: 'Help Centre', href: '/help', icon: 'help' },
    { label: 'Message', href: '/messages', icon: 'message' },
  ]},
]

const FF = "'Inter', sans-serif"

// Inline Prime logo SVG matching Figma
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

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <aside className={`l-sidebar${isOpen ? ' open' : ''}`} style={{
      width: '212px', flexShrink: 0,
      height: '100vh', position: 'sticky', top: 0,
      backgroundColor: '#fff',
      borderRight: '1px solid rgba(28,28,28,0.1)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto', overflowX: 'hidden',
      padding: '16px',
      gap: '8px',
    }}>
      {/* Logo + mobile close button */}
      <div style={{ height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', flexShrink: 0 }}>
        <PrimeLogo />
        {/* Close button — hidden on desktop via CSS */}
        <button
          className="l-sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
          style={{
            display: 'none',
            alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px',
            background: 'none', border: '1px solid rgba(28,28,28,0.15)',
            borderRadius: '6px', cursor: 'pointer', flexShrink: 0,
            fontSize: '16px', color: '#1c1c1c',
          }}
        >
          ×
        </button>
      </div>

      {/* Nav sections */}
      {NAV_MAIN.map((section, si) => (
        <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {section.label && (
            <div style={{
              padding: '4px 12px',
              fontFamily: FF, fontSize: '14px', fontWeight: 400,
              color: 'rgba(28,28,28,0.4)',
              fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
            }}>
              {section.label}
            </div>
          )}
          {section.items.map((item) => {
            const active = isActive(item.href)
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
                      opacity: active ? 1 : 0.8,
                    }}
                  />
                </div>
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}

      {/* Ask Anything */}
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
          <span style={{ fontSize: '14px', color: '#1c1c1c' }}>✦</span>
          Ask Anything?
        </button>
      </div>
    </aside>
  )
}
