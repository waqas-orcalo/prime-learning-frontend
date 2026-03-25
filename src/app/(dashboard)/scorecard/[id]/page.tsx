'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaret = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"><path d="M2 4.5l4 4 4-4" stroke="#1c1c1c" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

const GRADING = [
  { range: '1-3:', label: 'Little', color: '#ef4444', bg: '#fee2e2' },
  { range: '4-6', label: 'Some experience', color: '#92400e', bg: '#fef3c7' },
  { range: '7-8:', label: 'Experienced', color: '#0f766e', bg: '#ccfbf1' },
  { range: '9-10:', label: 'Very Experienced', color: '#166534', bg: '#dcfce7' },
]

const SECTIONS = [
  {
    id: 'skills', label: 'Skills', expanded: true,
    subSections: [
      {
        id: '1', label: '1. IT',
        criteria: [
          '1.1a - Skilled in the use of multiple IT packages and systems relevant to the organization in order to:',
          '1.1b - Create proposals',
          '1.1c - Perform financial processes',
          '1.1d - Record and analyse data',
          '1.2 - Examples include ms office or equivalent packages',
          '1.3 - Able to choose the most appropriate IT solution to suit the business problem',
          '1.4 - Able to update and review databases, record information and produce data analysis where required',
        ]
      },
      {
        id: '2', label: '2. Record and Document Production',
        criteria: [
          '2.1a - Produces accurate records and documents',
          '2.1b - Follows procedures for creation and storage of records',
          '2.2 - Uses appropriate software to produce documents',
        ]
      },
      {
        id: '3', label: '3. Decision Making',
        criteria: [
          '3.1 - Exercises proactivity and good judgement',
          '3.2 - Identifies and coordinates solutions to problems',
        ]
      },
    ]
  },
  {
    id: 'knowledge', label: 'Knowledge', expanded: false,
    subSections: [
      {
        id: 'k1', label: 'K1. Organisational Purpose',
        criteria: [
          'K1.1 - Understands organisational purpose and its culture',
          'K1.2 - Business aims and objectives',
        ]
      },
    ]
  },
  {
    id: 'behaviours', label: 'Behaviours', expanded: false,
    subSections: [
      {
        id: 'b1', label: 'B1. Professional',
        criteria: [
          'B1.1 - Acts professionally at all times',
          'B1.2 - Manages self effectively',
        ]
      },
    ]
  },
]

function StarRating({ value, onChange, previous }: { value: number; onChange: (v: number) => void; previous?: number }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const starVal = i + 1
        const filled = starVal <= display
        return (
          <button
            key={i}
            onMouseEnter={() => setHovered(starVal)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(starVal)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 1,
              fontSize: 14, lineHeight: 1,
              color: filled ? '#10b981' : '#d1d5db'
            }}
          >★</button>
        )
      })}
    </div>
  )
}

function ScoreEntryInner() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const { data: session } = useSession()

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['skills']))
  const [expandedSubSections, setExpandedSubSections] = useState<Set<string>>(new Set(['1', '2', '3', 'k1', 'b1']))
  const [scores, setScores] = useState<Record<string, number>>({})
  const [previousScores, setPreviousScores] = useState<Record<string, number>>({})
  const [scorecardTitle, setScorecardTitle] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [changed, setChanged] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load existing scorecard data
  useEffect(() => {
    const token = (session?.user as any)?.accessToken
    if (!token || !id) return
    apiFetch<any>(`/scorecard/${id}`, token)
      .then(resp => {
        const sc = resp?.data
        if (!sc) return
        setScorecardTitle(sc.title || '')
        setIsSubmitted(sc.submitted || false)
        // Restore saved scores
        const savedScores: Record<string, number> = {}
        const prevScores: Record<string, number> = {}
        ;(sc.scores ?? []).forEach((entry: any) => {
          savedScores[entry.criterionKey] = entry.currentScore
          prevScores[entry.criterionKey] = entry.previousScore
        })
        setScores(savedScores)
        setPreviousScores(prevScores)
      })
      .catch(err => console.error('Failed to load scorecard:', err))
  }, [id, session])

  const saveScores = async () => {
    const token = (session?.user as any)?.accessToken
    if (!token) return
    setSaving(true)
    // Build scores array from current state
    const scoresArray = Object.entries(scores).map(([key, currentScore]) => {
      // Parse key: "subSectionId-criterionIndex"
      const [subSection, ciStr] = key.split('-')
      // Find section for this subSection
      const section = SECTIONS.find(s => s.subSections.some(ss => ss.id === subSection))
      const sub = section?.subSections.find(ss => ss.id === subSection)
      const criterionLabel = sub?.criteria[parseInt(ciStr)] ?? key
      return {
        criterionKey: key,
        criterionLabel,
        section: section?.id ?? '',
        subSection,
        previousScore: previousScores[key] ?? 0,
        currentScore,
      }
    })
    try {
      await apiFetch(`/scorecard/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ scores: scoresArray }),
      })
      setChanged(false)
    } catch (err) {
      console.error('Failed to save scores:', err)
    } finally {
      setSaving(false)
    }
  }

  const submitScorecard = async () => {
    await saveScores()
    const token = (session?.user as any)?.accessToken
    if (!token) return
    try {
      await apiFetch(`/scorecard/${id}/submit`, token, { method: 'POST' })
      setIsSubmitted(true)
      router.push('/scorecard')
    } catch (err) {
      console.error('Failed to submit:', err)
    }
  }

  const toggleSection = (id: string) => setExpandedSections(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSubSection = (id: string) => setExpandedSubSections(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const setScore = (key: string, val: number) => {
    setScores(s => ({ ...s, [key]: val }))
    setChanged(true)
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 980, ...FF }}>
      {/* Grading instructions */}
      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <span style={font(13, 600)}>Grading Instructions</span>
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {GRADING.map(g => (
            <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={font(12, 400, '#666')}>{g.range}</span>
              <span style={{ padding: '3px 10px', borderRadius: 12, background: g.bg, ...font(12, 600, g.color) }}>
                {g.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scorecard card */}
      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Card header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
            <img src={iconBack} width={24} height={24} alt="Back" />
          </button>
          <div>
            <p style={{ ...font(14, 600), margin: 0 }}>{scorecardTitle || `Scorecard ${id}`}</p>
            <p style={{ ...font(12, 400, '#888'), margin: 0 }}>
              The current scores have been copied from the previous scorecard. Criteria with new journal entries will be highlighted
            </p>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(section => {
          const sExp = expandedSections.has(section.id)
          return (
            <div key={section.id} style={{ borderTop: '1px solid rgba(28,28,28,0.08)' }}>
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '12px 16px', background: '#fff', border: 'none',
                  cursor: 'pointer', justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', border: '1.5px solid rgba(28,28,28,0.3)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    ...font(13, 500), flexShrink: 0
                  }}>{sExp ? '−' : '+'}</span>
                  <span style={font(14, 500)}>{section.label}</span>
                </div>
                <img src={iconCaret} width={14} height={14} alt="" style={{ transform: sExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {sExp && section.subSections.map(sub => {
                const subExp = expandedSubSections.has(sub.id)
                return (
                  <div key={sub.id} style={{ borderTop: '1px solid rgba(28,28,28,0.05)' }}>
                    <button
                      onClick={() => toggleSubSection(sub.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 16px 10px 40px', background: '#fafafa', border: 'none',
                        cursor: 'pointer', justifyContent: 'space-between'
                      }}
                    >
                      <span style={font(13, 600)}>{sub.label}</span>
                      <img src={iconCaret} width={12} height={12} alt="" style={{ transform: subExp ? 'rotate(180deg)' : 'none' }} />
                    </button>

                    {subExp && (
                      <div style={{ borderTop: '1px solid rgba(28,28,28,0.04)' }}>
                        {/* Column headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 200px', padding: '8px 16px 8px 56px', background: '#f5f5f5', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                          <span style={font(11, 500, '#888')}></span>
                          <span style={{ ...font(11, 500, '#888'), textAlign: 'center' }}>Previous</span>
                          <span style={{ ...font(11, 500, '#888'), textAlign: 'center' }}>Current</span>
                        </div>
                        {sub.criteria.map((c, ci) => {
                          const key = `${sub.id}-${ci}`
                          return (
                            <div key={ci} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 200px', padding: '10px 16px 10px 56px', borderBottom: '1px solid rgba(28,28,28,0.04)', alignItems: 'center' }}>
                              <span style={{ ...font(12), lineHeight: '18px', paddingRight: 16 }}>{c}</span>
                              {/* Previous score */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                {previousScores[key] ? (
                                  <>
                                    <span style={{ color: '#10b981', fontSize: 14 }}>★</span>
                                    <span style={font(12, 500)}>{previousScores[key].toFixed(2)}</span>
                                  </>
                                ) : (
                                  <span style={font(12, 400, '#aaa')}>—</span>
                                )}
                              </div>
                              {/* Current score */}
                              <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <StarRating
                                  value={scores[key] || 0}
                                  onChange={v => setScore(key, v)}
                                  previous={9}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Footer */}
        <div style={{
          padding: '14px 16px', borderTop: '1px solid rgba(28,28,28,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#f8f9fa'
        }}>
          <span style={font(12, 400, '#888')}>
            {changed
              ? 'You have made changes to your scores.'
              : 'You have not made any changes to your scores. Are you ready to submit your scorecard?'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => router.push('/scorecard')}
              style={{ padding: '8px 16px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(12, 500) }}
            >Cancel</button>
            <button
              onClick={async () => { await saveScores(); router.push('/scorecard') }}
              disabled={saving || isSubmitted}
              style={{ padding: '8px 16px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(12, 500, '#fff'), opacity: saving || isSubmitted ? 0.6 : 1 }}
            >{saving ? 'Saving…' : 'Save & Quit'}</button>
            <button
              onClick={submitScorecard}
              disabled={saving || isSubmitted}
              style={{ padding: '8px 16px', background: isSubmitted ? '#22c55e' : '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(12, 500, '#fff'), opacity: saving ? 0.6 : 1 }}
            >{isSubmitted ? '✓ Submitted' : saving ? 'Submitting…' : 'Submit Scorecard'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return <Suspense><ScoreEntryInner /></Suspense>
}
