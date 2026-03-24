'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
interface CourseSlide { content: string }
interface CourseModule { name: string; slides: CourseSlide[] }
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
  courseModules?: CourseModule[]
}
interface ProgressData {
  completedSlideKeys: string[]
  completedCount: number
  totalSlides: number
  percentage: number
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
function CourseCard({ course, progress, onStart }: {
  course: Course
  progress: ProgressData | null
  onStart: () => void
}) {
  const pct = progress?.percentage ?? 0
  const isCompleted = pct >= 100
  const hasStarted = pct > 0

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
          width: '32px', height: '32px', borderRadius: '6px',
          background: 'rgba(28,28,28,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <BookIcon />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={font(12, 700, '#1c1c1c', {
            textTransform: 'uppercase', letterSpacing: '0.04em',
            lineHeight: '16px', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          })}>
            {course.title}
          </p>
          <p style={font(11, 400, 'rgba(28,28,28,0.5)', { margin: '2px 0 0 0', lineHeight: '15px' })}>
            {isCompleted ? '✓ Completed' : hasStarted ? `${progress?.completedCount}/${progress?.totalSlides} slides read` : 'You have not started this course'}
          </p>
        </div>
      </div>

      {/* Start/Continue/Review button + progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <button
          onClick={onStart}
          style={{
            ...font(12, 600, '#fff'),
            padding: '5px 14px',
            background: isCompleted ? '#22c55e' : '#1c1c1c',
            border: 'none', borderRadius: '6px', cursor: 'pointer', outline: 'none', height: '28px',
          }}
        >
          {isCompleted ? 'Review' : hasStarted ? 'Continue' : 'Start'}
        </button>

        {/* Course Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <span style={font(10, 400, 'rgba(28,28,28,0.5)', { lineHeight: '13px' })}>Course Progress</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '60px', height: '4px', background: 'rgba(28,28,28,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: isCompleted ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #a78bfa, #818cf8)',
                borderRadius: '2px', transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={font(11, 600, isCompleted ? '#22c55e' : '#8b5cf6', { lineHeight: '14px' })}>
              {pct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Slide Viewer Modal ─────────────────────────────────────────────────────
function SlideViewer({
  course, token, initialProgress, onClose, onProgressUpdate,
}: {
  course: Course
  token: string
  initialProgress: ProgressData | null
  onClose: () => void
  onProgressUpdate: (p: ProgressData) => void
}) {
  const modules = course.courseModules ?? []

  // Build a flat list of all slides with their keys
  const allSlides: { moduleIdx: number; slideIdx: number; key: string; moduleName: string; content: string }[] = []
  modules.forEach((mod, mi) => {
    mod.slides.forEach((slide, si) => {
      allSlides.push({ moduleIdx: mi, slideIdx: si, key: `${mi}-${si}`, moduleName: mod.name, content: slide.content })
    })
  })

  const totalSlides = allSlides.length
  const [currentIdx, setCurrentIdx] = useState(() => {
    // Start from the first unread slide
    if (!initialProgress || initialProgress.completedSlideKeys.length === 0) return 0
    const firstUnread = allSlides.findIndex(s => !initialProgress.completedSlideKeys.includes(s.key))
    return firstUnread >= 0 ? firstUnread : 0
  })
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(initialProgress?.completedSlideKeys ?? [])
  )

  const currentSlide = allSlides[currentIdx]

  // Mark current slide as read when viewed
  useEffect(() => {
    if (!currentSlide || completed.has(currentSlide.key)) return
    apiFetch<any>(`/courses/${course._id}/complete-slide`, token, {
      method: 'POST', body: JSON.stringify({ slideKey: currentSlide.key }),
    })
      .then(d => {
        const p = d?.data
        if (p) {
          setCompleted(new Set(p.completedSlideKeys))
          onProgressUpdate(p)
        }
      })
      .catch(() => {})
  }, [currentIdx])

  const pct = totalSlides > 0 ? Math.round((completed.size / totalSlides) * 100) : 0

  if (totalSlides === 0) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center' as const }}>
          <p style={font(15, 500)}>This course has no slides yet.</p>
          <button onClick={onClose} style={{ ...font(13, 600, '#fff'), marginTop: 16, padding: '8px 24px', background: '#1c1c1c', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '760px', background: '#fff', borderRadius: '16px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
          maxHeight: '90vh', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(28,28,28,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={font(11, 500, 'rgba(28,28,28,0.45)', { margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' })}>
              {currentSlide?.moduleName}
            </p>
            <h2 style={font(18, 700, '#1c1c1c', { margin: '2px 0 0 0', lineHeight: '24px' })}>{course.title}</h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid rgba(28,28,28,0.2)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="#1c1c1c" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'rgba(28,28,28,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#a78bfa,#818cf8)', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
          <span style={font(12, 600, '#8b5cf6')}>{pct}%</span>
          <span style={font(12, 400, 'rgba(28,28,28,0.4)')}>Slide {currentIdx + 1} of {totalSlides}</span>
        </div>

        {/* Slide content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {/* Slide header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: completed.has(currentSlide?.key ?? '') ? 'rgba(34,197,94,0.12)' : 'rgba(151,71,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {completed.has(currentSlide?.key ?? '') ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <span style={font(11, 700, '#8b5cf6')}>{currentIdx + 1}</span>
              )}
            </div>
            <span style={font(13, 600, 'rgba(28,28,28,0.6)')}>Slide {currentIdx + 1}</span>
          </div>

          {/* Slide text */}
          <div style={{
            ...font(15, 400, '#1c1c1c'),
            lineHeight: '26px',
            whiteSpace: 'pre-wrap',
            background: 'rgba(28,28,28,0.02)',
            border: '1px solid rgba(28,28,28,0.07)',
            borderRadius: 12,
            padding: '24px 28px',
            minHeight: 160,
          }}>
            {currentSlide?.content || <span style={{ color: 'rgba(28,28,28,0.3)' }}>No content for this slide.</span>}
          </div>
        </div>

        {/* Navigation footer */}
        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid rgba(28,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Slide dots / module map */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: '60%' }}>
            {allSlides.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setCurrentIdx(i)}
                title={`${s.moduleName} — Slide ${s.slideIdx + 1}`}
                style={{
                  width: 10, height: 10, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer',
                  background: i === currentIdx ? '#1c1c1c' : completed.has(s.key) ? '#22c55e' : 'rgba(28,28,28,0.15)',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              style={{ ...font(13, 600, currentIdx === 0 ? 'rgba(28,28,28,0.3)' : '#1c1c1c'), padding: '8px 20px', background: 'rgba(28,28,28,0.06)', border: 'none', borderRadius: 8, cursor: currentIdx === 0 ? 'default' : 'pointer' }}
            >
              ← Prev
            </button>
            {currentIdx < totalSlides - 1 ? (
              <button
                onClick={() => setCurrentIdx(i => Math.min(totalSlides - 1, i + 1))}
                style={{ ...font(13, 600, '#fff'), padding: '8px 20px', background: '#1c1c1c', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{ ...font(13, 600, '#fff'), padding: '8px 20px', background: '#22c55e', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Finish ✓
              </button>
            )}
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

  // Progress map: courseId → ProgressData
  const [progressMap, setProgressMap] = useState<Record<string, ProgressData>>({})

  // Slide viewer state
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null)

  const fetchCourses = useCallback(() => {
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
        // Fetch progress for all enrolled courses
        enrolled.forEach(c => {
          apiFetch<any>(`/courses/${c._id}/my-progress`, token)
            .then(pd => { if (pd?.data) setProgressMap(prev => ({ ...prev, [c._id]: pd.data })) })
            .catch(() => {})
        })
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [token, userId])

  useEffect(() => { fetchCourses() }, [fetchCourses])

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
                <CourseCard
                  key={course._id}
                  course={course}
                  progress={progressMap[course._id] ?? null}
                  onStart={() => setViewingCourse(course)}
                />
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

      {/* Slide Viewer */}
      {viewingCourse && token && (
        <SlideViewer
          course={viewingCourse}
          token={token}
          initialProgress={progressMap[viewingCourse._id] ?? null}
          onClose={() => setViewingCourse(null)}
          onProgressUpdate={p => setProgressMap(prev => ({ ...prev, [viewingCourse._id]: p }))}
        />
      )}
    </div>
  )
}
