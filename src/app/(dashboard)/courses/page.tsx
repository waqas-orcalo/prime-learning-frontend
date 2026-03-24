'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

// ── Font / style helpers ───────────────────────────────────────────────────
const FF = {
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
} as const
const font = (
  size: number,
  weight = 400,
  color = '#1c1c1c',
  extra: React.CSSProperties = {}
): React.CSSProperties => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

// ── Data types ─────────────────────────────────────────────────────────────
interface Course {
  _id: string
  title: string
  description?: string
  category?: string
  modules?: number
  duration?: string
  status?: string
  thumbnailEmoji?: string
  enrolledUsers?: string[]
  createdAt?: string
}

const ORDER_OPTIONS = ['Name Ascending', 'Name Descending', 'Date Added']

// ── SVG icons ─────────────────────────────────────────────────────────────
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
      <path d="M3 6h14" stroke="#9CA3AF" strokeWidth="1.5" />
      <path d="M7 2v4" stroke="#9CA3AF" strokeWidth="1.5" />
    </svg>
  )
}

function ChevronDown({ color = '#1c1c1c' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3.5 5.25l3.5 3.5 3.5-3.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="4.5" stroke="rgba(28,28,28,0.4)" strokeWidth="1.2" />
      <path d="M9.5 9.5L12 12" stroke="rgba(28,28,28,0.4)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// ── Empty-state illustration ───────────────────────────────────────────────
function EmptyIllustration() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
      {/* Main hat / drum */}
      <ellipse cx="60" cy="62" rx="26" ry="8" fill="none" stroke="#1c1c1c" strokeWidth="1.5" />
      <rect x="34" y="46" width="52" height="16" rx="2" fill="none" stroke="#1c1c1c" strokeWidth="1.5" />
      <ellipse cx="60" cy="46" rx="26" ry="8" fill="none" stroke="#1c1c1c" strokeWidth="1.5" />
      {/* Wand */}
      <line x1="82" y1="68" x2="96" y2="82" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="96" cy="83" r="3" fill="none" stroke="#1c1c1c" strokeWidth="1.5" />
      {/* Stars / sparkles */}
      <path d="M45 28 L46.2 31.8 L50 33 L46.2 34.2 L45 38 L43.8 34.2 L40 33 L43.8 31.8 Z" fill="#1c1c1c" opacity="0.8" />
      <path d="M72 20 L72.8 22.4 L75.2 23.2 L72.8 24 L72 26.4 L71.2 24 L68.8 23.2 L71.2 22.4 Z" fill="#1c1c1c" opacity="0.5" />
      <path d="M85 38 L85.6 39.8 L87.4 40.4 L85.6 41 L85 42.8 L84.4 41 L82.6 40.4 L84.4 39.8 Z" fill="#1c1c1c" opacity="0.4" />
      {/* Spiral */}
      <path d="M56 16 C56 14 58 12 60 12 C62 12 64 14 64 16 C64 18 62 20 60 20 C59 20 58 19 58 18" stroke="#1c1c1c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="60" y1="20" x2="60" y2="46" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" />
      {/* orbit ring */}
      <ellipse cx="60" cy="20" rx="10" ry="4" fill="none" stroke="#1c1c1c" strokeWidth="1" opacity="0.3" transform="rotate(-20 60 20)" />
    </svg>
  )
}

// ── Order dropdown ─────────────────────────────────────────────────────────
function OrderDropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...font(12, 400, '#1c1c1c'),
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          height: '26px',
          border: '1px solid rgba(28,28,28,0.12)',
          borderRadius: '6px',
          backgroundColor: '#fff',
          cursor: 'pointer',
          outline: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
        <ChevronDown />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '30px',
          left: 0,
          zIndex: 100,
          backgroundColor: '#fff',
          border: '1px solid rgba(28,28,28,0.1)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: '160px',
          overflow: 'hidden',
        }}>
          {options.map(o => (
            <button
              key={o}
              onClick={() => { onChange(o); setOpen(false) }}
              style={{
                ...font(13, value === o ? 500 : 400, value === o ? '#1c1c1c' : 'rgba(28,28,28,0.7)'),
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                background: value === o ? 'rgba(28,28,28,0.04)' : 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Single course card ─────────────────────────────────────────────────────
function CourseCard({ course }: { course: Course }) {
  const progress = 0 // no progress tracking yet

  return (
    <div style={{
      flex: '1 1 calc(33.333% - 12px)',
      minWidth: '200px',
      maxWidth: 'calc(33.333% - 12px)',
      background: 'rgba(28,28,28,0.04)',
      borderRadius: '10px',
      padding: '14px 16px 14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {/* Icon + title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: 'rgba(28,28,28,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <BookIcon />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={font(12, 700, '#1c1c1c', {
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: '16px',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}>
            {course.title}
          </p>
          <p style={font(11, 400, 'rgba(28,28,28,0.5)', { margin: '2px 0 0 0', lineHeight: '15px' })}>
            You have not started this course
          </p>
        </div>
      </div>

      {/* Start button + progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <button style={{
          ...font(12, 600, '#fff'),
          padding: '5px 14px',
          background: '#1c1c1c',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          outline: 'none',
          height: '28px',
        }}>
          Start
        </button>

        {/* Course Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <span style={font(10, 400, 'rgba(28,28,28,0.5)', { lineHeight: '13px' })}>Course Progress</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'rgba(28,28,28,0.08)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={font(11, 600, '#8b5cf6', { lineHeight: '14px' })}>
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const { data: session } = useSession()
  const token = (session as any)?.user?.accessToken
  const userId = (session as any)?.user?.id

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [order, setOrder] = useState('Name Ascending')

  useEffect(() => {
    if (!token || !userId) return
    setLoading(true)
    apiFetch<any>('/courses?limit=100', token)
      .then(d => {
        const all: Course[] = d?.data?.items ?? d?.data ?? []
        const enrolled = all.filter(c =>
          Array.isArray(c.enrolledUsers) &&
          c.enrolledUsers.some((uid: any) => String(uid) === String(userId))
        )
        setCourses(enrolled)
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [token, userId])

  // Apply search + sort
  const displayed = courses
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (order === 'Name Ascending') return a.title.localeCompare(b.title)
      if (order === 'Name Descending') return b.title.localeCompare(a.title)
      if (order === 'Date Added') return (a.createdAt ?? '') < (b.createdAt ?? '') ? 1 : -1
      return 0
    })

  const hasNoCourses = !loading && courses.length === 0

  return (
    <div style={{
      padding: '32px 32px 48px 32px',
      background: '#f9f9fb',
      minHeight: '100vh',
    }}>
      {/* ── Page title ── */}
      <h1 style={font(22, 600, '#1c1c1c', {
        margin: '0 0 24px 0',
        lineHeight: '28px',
        letterSpacing: '-0.3px',
      })}>
        Courses
      </h1>

      {/* ── Empty state banner ── */}
      {hasNoCourses && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '16px',
          minHeight: '220px',
        }}>
          <EmptyIllustration />
          <p style={font(15, 500, '#1c1c1c', { margin: '8px 0 0 0', textAlign: 'center' })}>
            You currently have no courses assigned to you.
          </p>
          <p style={font(13, 400, 'rgba(28,28,28,0.5)', { margin: '0', textAlign: 'center' })}>
            Courses will appear when your tutor assigns them to you!
          </p>
        </div>
      )}

      {/* ── Courses list card ── */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)',
        overflow: 'hidden',
      }}>
        {/* Card header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(28,28,28,0.06)',
          flexWrap: 'wrap',
        }}>
          <span style={font(13, 600, '#1c1c1c')}>Courses</span>
          <span style={font(12, 400, 'rgba(28,28,28,0.5)')}>Order:</span>
          <OrderDropdown value={order} options={ORDER_OPTIONS} onChange={setOrder} />

          {/* spacer */}
          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            border: '1px solid rgba(28,28,28,0.12)',
            borderRadius: '6px',
            background: '#fff',
            height: '26px',
            minWidth: '180px',
          }}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search for courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                ...font(12, 400, '#1c1c1c'),
                border: 'none',
                outline: 'none',
                background: 'transparent',
                flex: 1,
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* ── Content area ── */}
        <div style={{ padding: '20px' }}>
          {loading ? (
            // Loading skeleton
            <div style={{ display: 'flex', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  flex: '1 1 calc(33.333% - 12px)',
                  height: '110px',
                  background: 'rgba(28,28,28,0.04)',
                  borderRadius: '10px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            // No results
            <div style={{
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={font(14, 400, 'rgba(28,28,28,0.4)')}>
                {search ? 'No courses match your search.' : 'No courses enrolled yet.'}
              </span>
            </div>
          ) : (
            // Course grid
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
            }}>
              {displayed.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        input::placeholder { color: rgba(28,28,28,0.35); }
      `}</style>
    </div>
  )
}
