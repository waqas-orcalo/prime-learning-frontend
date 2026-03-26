'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const TABS = [
  'Unit 01 Unit Summary',
  'Mock Knowledge Test',
  'Portfolio Based Mock Interview',
  'Project/Improvement Presentation',
  'EPA Confirmation',
]

interface ProgressReviewEntry {
  _id: string
  notes?: string
  reviewDate: string
  trainerId: string
  signatures?: Array<{ role: string; name: string; date: string; signed: boolean }>
}

interface Activity {
  _id: string
  title: string
  status: string
  method?: string
  activityDate?: string
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

function getTrainerName(review: ProgressReviewEntry): string {
  const trainerSig = review.signatures?.find(s =>
    s.role?.toUpperCase() === 'TRAINER' && s.signed
  )
  return trainerSig?.name || 'Trainer'
}

function formatMethod(method: string): string {
  return (method || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

function ProgressUnitDetailsInner() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const token = (session?.user as any)?.accessToken
  const [activeTab, setActiveTab] = useState(0)
  const [selectedUnit, setSelectedUnit] = useState(1)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState<ProgressReviewEntry[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isSigned, setIsSigned] = useState(false)
  const [loading, setLoading] = useState(true)

  const learnerName =
    [(session?.user as any)?.firstName, (session?.user as any)?.lastName].filter(Boolean).join(' ') || 'Learner'

  useEffect(() => {
    if (status === 'loading') return
    if (!token) { setLoading(false); return }

    let cancelled = false

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [reviewResp, actResp] = await Promise.all([
          apiFetch<any>('/progress-review?limit=10&page=1', token),
          apiFetch<any>('/learning-activities?limit=200&page=1', token),
        ])

        if (cancelled) return

        // reviews — paginatedResponse wraps array in resp.data directly
        const rawReviews = reviewResp?.data
        const reviewList: ProgressReviewEntry[] = Array.isArray(rawReviews)
          ? rawReviews
          : (rawReviews?.data ?? [])
        setReviews(reviewList)
        setIsSigned(reviewList.some(r => r.signatures && r.signatures.some(s => s.signed)))

        // activities
        const rawActs = actResp?.data
        const actList: Activity[] = Array.isArray(rawActs) ? rawActs : (rawActs?.data ?? [])
        setActivities(actList)
      } catch (err) {
        if (!cancelled) console.error('Unit detail fetch error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [token, status])

  const feedbackReviews = reviews.filter(r => r.notes && r.notes.trim())

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1060, ...FF }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Progress Unit Details</h1>
      </div>

      {/* Unit selector + signed badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: '#f8f9fa', borderRadius: 10,
        border: '1px solid rgba(28,28,28,0.08)', marginBottom: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={font(13, 500)}>Unit: {selectedUnit}</span>
          <select
            value={selectedUnit}
            onChange={e => setSelectedUnit(Number(e.target.value))}
            style={{ padding: '3px 10px', border: '1px solid rgba(28,28,28,0.2)', borderRadius: 6, ...font(12), background: '#fff', cursor: 'pointer' }}
          >
            {[1, 2, 3, 4, 5].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        {isSigned && (
          <span style={font(12, 500, '#16a34a')}>This plan of activity/action has already been signed.</span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(28,28,28,0.1)', marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '10px 16px', background: 'none', border: 'none',
              borderBottom: activeTab === i ? '2px solid #1c1c1c' : '2px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1,
              ...font(13, activeTab === i ? 600 : 400, activeTab === i ? '#1c1c1c' : '#888')
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Meta row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Learner Name', value: learnerName },
              { label: 'Learning Aim', value: 'Business Administrator Gateway to End Point' },
              { label: 'Awarding Body Reg.', value: 'Pending' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ ...font(11, 400, '#888'), margin: '0 0 3px' }}>{label}</p>
                <p style={{ ...font(13), margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Unit heading */}
          <h3 style={{ ...font(14, 600), margin: 0 }}>[Unit 01] Gateway to End Point Assessment</h3>

          {/* Sub-items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              '[1] Mock Knowledge Test',
              '[2] Portfolio Based Mock Interview',
              '[3] Project/Improvement Presentation',
              '[4] EPA Confirmation',
            ].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(28,28,28,0.05)' }}>
                <span style={font(13)}>{label}</span>
                <span style={font(12, 400, '#888')}>Progress: 0%</span>
              </div>
            ))}
          </div>

          {/* Related Learning Activities */}
          <div>
            <h4 style={{ ...font(13, 600), margin: '0 0 6px' }}>Related Learning Activities</h4>
            <p style={{ ...font(12, 400, '#888'), margin: '0 0 6px', lineHeight: '18px' }}>
              NB. Secondary methods are encapsulated with square brackets, e.g. [OB1]
            </p>
            {loading ? (
              <p style={font(12, 400, '#aaa')}>Loading activities...</p>
            ) : activities.length === 0 ? (
              <p style={{ ...font(12, 400, '#888'), margin: 0, lineHeight: '18px' }}>
                There are no related learning activities for this Unit - pending learning activities are not included in your portfolio.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {activities.slice(0, 8).map(act => (
                  <div key={act._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px', background: '#f8f9fa', borderRadius: 6,
                    border: '1px solid rgba(28,28,28,0.06)'
                  }}>
                    <span style={font(12)}>{act.title}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {act.method && <span style={font(11, 400, '#888')}>{formatMethod(act.method)}</span>}
                      <span style={{
                        padding: '2px 7px', borderRadius: 10, ...font(11, 500),
                        background: act.status === 'COMPLETED' ? '#dcfce7' : act.status === 'IN_PROGRESS' ? '#fef3c7' : '#f3f4f6',
                        color: act.status === 'COMPLETED' ? '#16a34a' : act.status === 'IN_PROGRESS' ? '#d97706' : '#888',
                      }}>{act.status}</span>
                    </div>
                  </div>
                ))}
                {activities.length > 8 && (
                  <p style={{ ...font(11, 400, '#888'), margin: '4px 0 0' }}>
                    +{activities.length - 8} more activities
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <h4 style={{ ...font(13, 600), margin: '0 0 6px' }}>Attachments</h4>
            <p style={font(12, 400, '#aaa')}>Nothing is attached</p>
          </div>

          {/* Feedback & Comments */}
          <div>
            <h4 style={{ ...font(13, 600), margin: '0 0 12px' }}>Feedback &amp; Comments</h4>

            {loading ? (
              <p style={{ ...font(12, 400, '#aaa'), margin: '0 0 12px' }}>Loading feedback...</p>
            ) : feedbackReviews.length === 0 ? (
              <p style={{ ...font(12, 400, '#aaa'), margin: '0 0 12px' }}>No feedback yet.</p>
            ) : (
              <div style={{ marginBottom: 16 }}>
                {feedbackReviews.map(review => (
                  <div key={review._id} style={{ padding: '12px 0', borderTop: '1px solid rgba(28,28,28,0.07)' }}>
                    <p style={{ ...font(12, 400, '#555'), margin: '0 0 5px' }}>
                      {`From: ${getTrainerName(review)} (Trainer) on ${formatDateTime(review.reviewDate)} To: ${learnerName} (Learner) Unread`}
                    </p>
                    <p style={{ ...font(13), margin: 0, lineHeight: '20px' }}>{review.notes}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply area */}
            <div style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: 8, overflow: 'hidden' }}>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write here"
                rows={4}
                style={{
                  width: '100%', padding: '12px', border: 'none', outline: 'none',
                  resize: 'none', ...font(13), background: '#fff', boxSizing: 'border-box'
                }}
              />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
                borderTop: '1px solid rgba(28,28,28,0.08)', background: '#fafafa', flexWrap: 'wrap'
              }}>
                {['14 ▾', 'T', 'B', 'I', 'U', 'S', '≡', '≡', '≡', '⊡'].map((btn, i) => (
                  <button key={i} style={{ padding: '3px 6px', background: 'none', border: 'none', cursor: 'pointer', ...font(12), borderRadius: 4, color: '#444' }}>
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Send/Cancel */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setComment('')}
              style={{ padding: '9px 20px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(13, 500, '#fff') }}
            >
              Send
            </button>
            <button
              onClick={() => setComment('')}
              style={{ padding: '9px 20px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(13, 500) }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeTab > 0 && (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <p style={font(14, 400, '#aaa')}>{TABS[activeTab]} — content coming soon</p>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <Suspense><ProgressUnitDetailsInner /></Suspense>
}
