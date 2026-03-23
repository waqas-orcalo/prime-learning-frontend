'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

/* ─── font / style helpers ───────────────────────────────────────── */
const FF = {
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
} as const
const font = (
  size: number,
  weight = 400,
  color = '#1c1c1c',
  extra: React.CSSProperties = {},
): React.CSSProperties => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

/* ─── inline SVG icons ───────────────────────────────────────────── */
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`

const iconActivity = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
    <circle cx="10" cy="10" r="7.5" stroke="#1c1c1c" stroke-width="1.5"/>
    <circle cx="10" cy="10" r="3" stroke="#1c1c1c" stroke-width="1.5"/>
  </svg>`,
)
const iconEvidence = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
    <path d="M13 2H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6l-3-4z"
      stroke="#1c1c1c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M13 2v4h3" stroke="#1c1c1c" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M7 9h6M7 12h6M7 15h4"
      stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
)
const iconTimesheet = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
    <rect x="2" y="3" width="16" height="15" rx="2"
      stroke="#1c1c1c" stroke-width="1.5"/>
    <path d="M2 8h16" stroke="#1c1c1c" stroke-width="1.5"/>
    <path d="M7 2v2M13 2v2" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M6 12h2v2H6zM9 12h2v2H9zM12 12h2v2h-2zM6 15h2M9 15h2"
      stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,
)
const iconVisit = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
    <rect x="2" y="3" width="16" height="15" rx="2"
      stroke="#1c1c1c" stroke-width="1.5"/>
    <path d="M2 8h16" stroke="#1c1c1c" stroke-width="1.5"/>
    <path d="M7 2v2M13 2v2" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M7 13l2 2 4-4" stroke="#1c1c1c" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
)
const iconChevronRight = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="#1c1c1c" stroke-width="1.5"
      stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
)
const iconChevronLeft = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
    <path d="M13 16L7 10l6-6" stroke="#1c1c1c" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
)
const iconUser = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
    <circle cx="20" cy="16" r="6" fill="#9CA3AF"/>
    <ellipse cx="20" cy="32" rx="10" ry="6" fill="#9CA3AF"/>
  </svg>`,
)

/* ─── types ──────────────────────────────────────────────────────── */
interface Activity {
  id: string
  title: string
  method: string
  activityDate: string
  status: string
  ref: string
}

type MainTab = 'Activity' | 'Manage' | 'Progress' | 'Forms'

/* ─── sub-nav pill items ─────────────────────────────────────────── */
const SUB_NAV = [
  { key: 'activity',  label: 'Activity',                  icon: iconActivity  },
  { key: 'evidence',  label: 'Learning Activity Evidence', icon: iconEvidence  },
  { key: 'timesheet', label: 'Timesheet',                  icon: iconTimesheet },
  { key: 'visit',     label: 'Visit',                     icon: iconVisit     },
] as const

type SubNav = typeof SUB_NAV[number]['key']

/* ─── helpers ────────────────────────────────────────────────────── */
function fmtDate(d: string) {
  if (!d) return ''
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`
}
function fmtMethod(m: string) {
  return m.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

/* ─── inner page component (uses useSearchParams) ────────────────── */
function ActivityDetailInner() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id') ?? ''
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken

  const [activity, setActivity] = useState<Activity | null>(null)
  const [activeTab, setActiveTab] = useState<MainTab>('Activity')
  const [activeSub, setActiveSub] = useState<SubNav>('activity')

  useEffect(() => {
    if (!id || !token) return
    apiFetch<any>(`/learning-activities/${id}`, token)
      .then(res => {
        const a = res.data
        setActivity({
          id: a._id,
          title: a.title,
          method: a.method ? fmtMethod(a.method) : '',
          activityDate: a.activityDate ? fmtDate(a.activityDate) : '',
          status: a.status ?? 'PENDING',
          ref: a.ref ?? '',
        })
        // also cache for sub-pages
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentActivityId', a._id)
          localStorage.setItem('currentActivity', JSON.stringify(a))
        }
      })
      .catch(() => {
        // fallback from localStorage
        try {
          const cached = localStorage.getItem('currentActivity')
          if (cached) {
            const a = JSON.parse(cached)
            setActivity({
              id: a.id ?? a._id ?? id,
              title: a.title ?? '',
              method: a.method ?? '',
              activityDate: a.date ?? a.activityDate ?? '',
              status: a.status ?? 'PENDING',
              ref: a.ref ?? '',
            })
          }
        } catch { /* ignore */ }
      })
  }, [id, token])

  const handleSubNav = (key: SubNav) => {
    setActiveSub(key)
    if (key === 'evidence') {
      router.push(`/learning-activities/evidence?id=${id}`)
    } else if (key === 'timesheet') {
      router.push(`/learning-activities/timesheet?id=${id}`)
    } else if (key === 'visit') {
      router.push(`/learning-activities/visit?id=${id}`)
    }
    // 'activity' stays on this page
  }

  const MAIN_TABS: MainTab[] = ['Activity', 'Manage', 'Progress', 'Forms']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Back button + title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => router.push('/learning-activities')}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1.5px solid rgba(28,28,28,0.15)',
            backgroundColor: '#fff', cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <img src={iconChevronLeft} alt="Back" style={{ width: '18px', height: '18px' }} />
        </button>
        <div>
          <p style={{ ...font(20, 700), letterSpacing: '-0.4px', margin: 0 }}>
            {activity?.title ?? 'Learning Activity'}
          </p>
          {activity && (
            <p style={{ ...font(13, 400, 'rgba(28,28,28,0.5)'), margin: '2px 0 0' }}>
              {activity.ref && `${activity.ref}  ·  `}{activity.method}{activity.activityDate && `  ·  ${activity.activityDate}`}
            </p>
          )}
        </div>
      </div>

      {/* ── Main content row ── */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* ── Tab card ── */}
        <div style={{
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)',
          overflow: 'hidden',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(28,28,28,0.08)',
            padding: '0 24px',
            gap: '0',
          }}>
            {MAIN_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '16px 20px 14px',
                  cursor: 'pointer',
                  position: 'relative',
                  ...font(14, activeTab === tab ? 700 : 400, activeTab === tab ? '#1c1c1c' : 'rgba(28,28,28,0.45)'),
                  borderBottom: activeTab === tab ? '2px solid #1c1c1c' : '2px solid transparent',
                  marginBottom: '-1px',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: '24px' }}>
            {activeTab === 'Activity' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {SUB_NAV.map(item => {
                  const isActive = activeSub === item.key
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSubNav(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 18px 10px 14px',
                        borderRadius: '100px',
                        border: `1.5px solid ${isActive ? '#1c1c1c' : 'rgba(28,28,28,0.15)'}`,
                        backgroundColor: isActive ? '#1c1c1c' : '#fff',
                        cursor: 'pointer',
                        ...font(14, 500, isActive ? '#fff' : '#1c1c1c'),
                        boxShadow: isActive ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(28,28,28,0.04)'
                          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(28,28,28,0.3)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff'
                          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(28,28,28,0.15)'
                        }
                      }}
                    >
                      {/* icon tinted to match text */}
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '20px', height: '20px', flexShrink: 0,
                        filter: isActive ? 'invert(1)' : 'none',
                      }}>
                        <img src={item.icon} alt="" style={{ width: '20px', height: '20px' }} />
                      </span>
                      <span>{item.label}</span>
                      <span style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '16px', height: '16px', flexShrink: 0,
                        filter: isActive ? 'invert(1)' : 'none',
                      }}>
                        <img src={iconChevronRight} alt="" style={{ width: '16px', height: '16px' }} />
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {activeTab === 'Manage' && (
              <div style={{ padding: '12px 0' }}>
                <p style={{ ...font(14, 400, 'rgba(28,28,28,0.4)'), textAlign: 'center', padding: '32px 0' }}>
                  Manage tab content coming soon.
                </p>
              </div>
            )}
            {activeTab === 'Progress' && (
              <div style={{ padding: '12px 0' }}>
                <p style={{ ...font(14, 400, 'rgba(28,28,28,0.4)'), textAlign: 'center', padding: '32px 0' }}>
                  Progress tab content coming soon.
                </p>
              </div>
            )}
            {activeTab === 'Forms' && (
              <div style={{ padding: '12px 0' }}>
                <p style={{ ...font(14, 400, 'rgba(28,28,28,0.4)'), textAlign: 'center', padding: '32px 0' }}>
                  Forms tab content coming soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Trainer card ── */}
        <div style={{
          width: '220px',
          flexShrink: 0,
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}>
          {/* Avatar */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: '#E5E7EB',
            overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src={iconUser}
              alt="Trainer avatar"
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>

          {/* Info */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ ...font(14, 700), margin: '0 0 2px', letterSpacing: '-0.2px' }}>
              Cris Curtis
            </p>
            <p style={{ ...font(13, 400, 'rgba(28,28,28,0.55)'), margin: '0 0 8px' }}>
              Primary Trainer
            </p>
            {/* Online badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px',
              borderRadius: '20px',
              backgroundColor: 'rgba(34,197,94,0.1)',
              ...font(12, 500, '#16a34a'),
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: '#22c55e', flexShrink: 0,
              }} />
              Online
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(28,28,28,0.07)' }} />

          {/* Contact button */}
          <button
            style={{
              width: '100%',
              padding: '9px 0',
              borderRadius: '8px',
              border: '1.5px solid rgba(28,28,28,0.15)',
              backgroundColor: '#fff',
              cursor: 'pointer',
              ...font(13, 600),
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(28,28,28,0.04)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff')}
          >
            Message Trainer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── default export wrapped in Suspense (required for useSearchParams) ─ */
export default function ActivityDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
        Loading…
      </div>
    }>
      <ActivityDetailInner />
    </Suspense>
  )
}
