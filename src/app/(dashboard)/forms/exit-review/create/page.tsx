'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCreateExitReview } from '@/hooks/use-exit-review'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconUser = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><circle cx="7" cy="5" r="3" stroke="#888" stroke-width="1.2"/><path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="#888" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconCal  = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><rect x="1" y="2" width="12" height="11" rx="1.5" stroke="#888" stroke-width="1.2"/><path d="M1 5.5h12M4.5 1v2M9.5 1v2" stroke="#888" stroke-width="1.2" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '20px', ...extra } as React.CSSProperties)

const SECTION_HDR: React.CSSProperties = { padding: '12px 16px', background: '#f0f0f0', ...font(13, 600), borderBottom: '1px solid rgba(28,28,28,0.08)', borderTop: '1px solid rgba(28,28,28,0.08)' }
const FIELD_WRAP: React.CSSProperties = { background: '#fafafa', border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4, minHeight: 80 }
const FIELD_LABEL: React.CSSProperties = { ...font(11, 400, '#888'), marginBottom: 2, lineHeight: '16px' }
const FIELD_INPUT: React.CSSProperties = { border: 'none', outline: 'none', ...font(13), background: 'transparent', resize: 'none', width: '100%', padding: 0 }

const PE_QUESTIONS_PAIRS = [
  [
    "Can you describe any specific skills or knowledge you've acquired during your apprenticeship that you didn't have before?",
    "How has your apprenticeship contributed to your understanding of your chosen field or industry?",
  ],
  [
    "In what ways has your apprenticeship experience influenced your career goals or aspirations?",
    "How has your confidence grown in your ability to perform tasks related to your apprenticeship since you started?",
  ],
  [
    "How has your confidence grown in your ability to perform tasks related to your apprenticeship since you started?",
    "How has your interaction with mentors, supervisors, or colleagues during your apprenticeship impacted your learning and professional development?",
  ],
  [
    "Can you identify any challenges you've overcome during your apprenticeship and how they've contributed to your growth?",
    "Have you developed any new perspectives or insights into your chosen field or industry as a result of your apprenticeship experience?",
  ],
  [
    "Looking back on your time as an apprentice, what do you believe has been the most significant impact of this experience on your personal and professional development?",
    "Have you considered any further education or training opportunities to enhance your skills and qualifications? If yes, what areas are you interested in pursuing?",
  ],
]
const PE_LAST = 'How do you plan to stay informed about relevant industry trends, opportunities, and resources to support your ongoing growth and development?'

interface FormState {
  learnersName: string
  startDate: string
  answers: Record<string, string>
  answerLast: string
  learnerSigned: boolean
  trainerSigned: boolean
}

const INIT: FormState = { learnersName: '', startDate: '', answers: {}, answerLast: '', learnerSigned: false, trainerSigned: false }

function CreateExitReviewInner() {
  const router = useRouter()
  const { data: session } = useSession()
  const [form, setForm] = useState<FormState>(INIT)
  const [error, setError] = useState('')

  const createMutation = useCreateExitReview()

  const user = session?.user as any
  const learnerId: string = user?._id ?? user?.id ?? ''
  const learnerName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Learner'
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const setAnswer = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, answers: { ...f.answers, [key]: e.target.value } }))

  const handleSave = () => {
    setError('')
    if (!learnerId) { setError('Could not determine learner ID from session. Please re-login.'); return }

    createMutation.mutate(
      {
        learnerId,
        learnersName:  form.learnersName,
        startDate:     form.startDate || undefined,
        answers:       form.answers,
        answerLast:    form.answerLast,
        learnerSigned: form.learnerSigned,
        trainerSigned: form.trainerSigned,
      },
      {
        onSuccess: () => router.push('/forms/exit-review'),
        onError: (err) => setError(err.message || 'Failed to save. Please try again.'),
      },
    )
  }

  const saving = createMutation.isPending

  return (
    <div style={{ padding: '24px 28px', maxWidth: 980, ...FF }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Create Exit review and Programme Evaluation</h1>
      </div>

      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        {/* ── Learner Name and Date ── */}
        <div style={SECTION_HDR}>Learner Name and Date</div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ ...FIELD_WRAP, minHeight: 'auto' }}>
            <span style={FIELD_LABEL}>Learners Name*</span>
            <input
              value={form.learnersName}
              onChange={e => setForm(f => ({ ...f, learnersName: e.target.value }))}
              placeholder="Text"
              style={{ ...FIELD_INPUT, padding: '2px 0' }}
            />
          </div>
          <div style={{ ...FIELD_WRAP, minHeight: 'auto' }}>
            <span style={FIELD_LABEL}>Start Date:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <img src={iconCal} width={14} height={14} alt="" />
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                style={{ ...FIELD_INPUT, padding: '2px 0', flex: 1 }}
              />
            </div>
          </div>
        </div>

        {/* ── Programme Evaluation ── */}
        <div style={SECTION_HDR}>Programme Evaluation</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PE_QUESTIONS_PAIRS.map((pair, pi) => (
            <div key={pi} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {pair.map((q, qi) => {
                const key = `pe_${pi}_${qi}`
                return (
                  <div key={key} style={FIELD_WRAP}>
                    <span style={FIELD_LABEL}>{q}</span>
                    <textarea
                      value={form.answers[key] || ''}
                      onChange={setAnswer(key)}
                      placeholder="Text"
                      style={{ ...FIELD_INPUT, minHeight: 48 }}
                      rows={3}
                    />
                  </div>
                )
              })}
            </div>
          ))}
          {/* Last standalone question */}
          <div style={{ ...FIELD_WRAP, minHeight: 80 }}>
            <span style={FIELD_LABEL}>{PE_LAST}</span>
            <textarea
              value={form.answerLast}
              onChange={e => setForm(f => ({ ...f, answerLast: e.target.value }))}
              placeholder="Text"
              style={{ ...FIELD_INPUT, minHeight: 48 }}
              rows={3}
            />
          </div>
        </div>

        {/* ── Signature ── */}
        <div style={SECTION_HDR}>Signature</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Learner */}
          <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, padding: '12px 16px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={form.learnerSigned} onChange={e => setForm(f => ({ ...f, learnerSigned: e.target.checked }))} style={{ width: 14, height: 14 }} />
                <span style={font(13, 500)}>Signature</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={iconUser} width={14} height={14} alt="" />
                <span style={font(12, 400, '#555')}>{learnerName} (Learner)</span>
                <span style={font(11, 400, '#aaa')}>{today}</span>
              </div>
            </div>
            <p style={{ ...font(11, 400, '#888'), margin: '6px 0 0 24px' }}>I agree that the information provided here is an accurate account of what has taken place.</p>
          </div>
          {/* Trainer */}
          <div style={{ border: '1px solid rgba(28,28,28,0.08)', borderRadius: 8, padding: '12px 16px', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={form.trainerSigned} onChange={e => setForm(f => ({ ...f, trainerSigned: e.target.checked }))} style={{ width: 14, height: 14 }} />
                <span style={{ ...font(13, 500, '#888') }}>Signature</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={iconUser} width={14} height={14} alt="" />
                <span style={font(12, 400, '#888')}>Trainer</span>
              </div>
            </div>
            <p style={{ ...font(11, 400, '#aaa'), margin: '6px 0 0 24px' }}>I agree that the information provided here is an accurate account of what has taken place.</p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid rgba(28,28,28,0.08)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '9px 22px', background: saving ? '#555' : '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => router.back()} style={{ padding: '9px 22px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(13, 500) }}>
              Cancel
            </button>
          </div>
        </div>

        {error && <p style={{ ...font(12, 400, '#ef4444'), padding: '0 16px 12px' }}>{error}</p>}
      </div>
    </div>
  )
}

export default function Page() { return <Suspense><CreateExitReviewInner /></Suspense> }
