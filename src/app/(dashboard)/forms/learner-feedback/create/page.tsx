'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCreateLearnerFeedback } from '@/hooks/use-learner-feedback'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconUser = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><circle cx="7" cy="5" r="3" stroke="#888" stroke-width="1.2"/><path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="#888" stroke-width="1.2" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '20px', ...extra } as React.CSSProperties)

const SECTION_HEADER: React.CSSProperties = {
  padding: '12px 16px', background: '#f0f0f0', ...font(13, 600),
  borderBottom: '1px solid rgba(28,28,28,0.08)', borderTop: '1px solid rgba(28,28,28,0.08)'
}
const FIELD_WRAP: React.CSSProperties = {
  background: '#fafafa', border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8,
  padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4
}
const FIELD_LABEL: React.CSSProperties = { ...font(11, 400, '#888'), marginBottom: 2 }
const FIELD_INPUT: React.CSSProperties = {
  border: 'none', outline: 'none', ...font(13), background: 'transparent',
  resize: 'none', width: '100%', minHeight: 40, padding: 0
}

interface FormData {
  trainersName: string
  keyPoint: string
  useSkillsImpact: string
  moreInfoOn: string
  completedJournal: 'Yes' | 'No' | ''
  ifNoWhyNot: string
  improvementSuggestion: string
  learnerSigned: boolean
  trainerSigned: boolean
}

const INIT: FormData = {
  trainersName: '', keyPoint: '', useSkillsImpact: '', moreInfoOn: '',
  completedJournal: 'No', ifNoWhyNot: '', improvementSuggestion: '',
  learnerSigned: false, trainerSigned: false,
}

function CreateLearnerFeedbackInner() {
  const router = useRouter()
  const { data: session } = useSession()
  const [form, setForm] = useState<FormData>(INIT)
  const [error, setError] = useState('')

  const createMutation = useCreateLearnerFeedback()

  const user = session?.user as any
  const learnerId: string = user?._id ?? user?.id ?? ''
  const learnerName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Learner'
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setError('')
    if (!learnerId) { setError('Could not determine learner ID from session. Please re-login.'); return }

    createMutation.mutate(
      {
        learnerId,
        trainersName:         form.trainersName,
        keyPoint:             form.keyPoint,
        useSkillsImpact:      form.useSkillsImpact,
        moreInfoOn:           form.moreInfoOn,
        completedJournal:     form.completedJournal,
        ifNoWhyNot:           form.ifNoWhyNot,
        improvementSuggestion: form.improvementSuggestion,
        learnerSigned:        form.learnerSigned,
        trainerSigned:        form.trainerSigned,
      },
      {
        onSuccess: () => router.push('/forms/learner-feedback'),
        onError: (err) => setError(err.message || 'Failed to save. Please try again.'),
      },
    )
  }

  const saving = createMutation.isPending

  return (
    <div style={{ padding: '24px 28px', maxWidth: 980, ...FF }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Create Learner feedback from teach sessions</h1>
      </div>

      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        {/* ── Training Feedback section ── */}
        <div style={SECTION_HEADER}>Training Feedback</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Row 1: Trainers Name | Key point */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>Trainers Name</span>
              <textarea value={form.trainersName} onChange={set('trainersName')} placeholder="Text" style={FIELD_INPUT} rows={2} />
            </div>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>What would you say was the key point you learned today?</span>
              <textarea value={form.keyPoint} onChange={set('keyPoint')} placeholder="Text" style={FIELD_INPUT} rows={2} />
            </div>
          </div>

          {/* Row 2: Use skills | More info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>How would you use the skills you are learning in work? and what impact would this have?</span>
              <textarea value={form.useSkillsImpact} onChange={set('useSkillsImpact')} placeholder="Text" style={FIELD_INPUT} rows={3} />
            </div>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>What would you like more information on?</span>
              <textarea value={form.moreInfoOn} onChange={set('moreInfoOn')} placeholder="Text" style={FIELD_INPUT} rows={3} />
            </div>
          </div>

          {/* Row 3: Completed journal | If no why */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>Have you completed your learning journal?</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
                {(['Yes', 'No'] as const).map(opt => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.completedJournal === opt}
                      onChange={() => setForm(f => ({ ...f, completedJournal: opt }))}
                      style={{ width: 14, height: 14 }}
                    />
                    <span style={font(13)}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>If you selected no why not?</span>
              <textarea
                value={form.ifNoWhyNot}
                onChange={set('ifNoWhyNot')}
                placeholder="Text"
                style={{ ...FIELD_INPUT, opacity: form.completedJournal !== 'No' ? 0.4 : 1 }}
                rows={3}
                disabled={form.completedJournal !== 'No'}
              />
            </div>
          </div>

          {/* Row 4: Improvement suggestion (full width) */}
          <div style={FIELD_WRAP}>
            <span style={FIELD_LABEL}>If you could improve just one thing in the training/lesson – what would it be, and what difference would it make?</span>
            <textarea value={form.improvementSuggestion} onChange={set('improvementSuggestion')} placeholder="Text" style={{ ...FIELD_INPUT, minHeight: 60 }} rows={3} />
          </div>
        </div>

        {/* ── Signature section ── */}
        <div style={SECTION_HEADER}>Signature</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Learner signature */}
          <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, padding: '12px 16px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.learnerSigned}
                  onChange={e => setForm(f => ({ ...f, learnerSigned: e.target.checked }))}
                  style={{ width: 14, height: 14 }}
                />
                <span style={font(13, 500)}>Signature</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={iconUser} width={14} height={14} alt="" />
                <span style={font(12, 400, '#555')}>{learnerName} (Learner)</span>
                <span style={font(11, 400, '#aaa')}>{today}</span>
              </div>
            </div>
            <p style={{ ...font(11, 400, '#888'), margin: '6px 0 0 24px' }}>
              I agree that the information provided here is an accurate account of what has taken place.
            </p>
          </div>

          {/* Trainer signature */}
          <div style={{ border: '1px solid rgba(28,28,28,0.08)', borderRadius: 8, padding: '12px 16px', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.trainerSigned}
                  onChange={e => setForm(f => ({ ...f, trainerSigned: e.target.checked }))}
                  style={{ width: 14, height: 14 }}
                />
                <span style={{ ...font(13, 500, '#888') }}>Signature</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={iconUser} width={14} height={14} alt="" />
                <span style={font(12, 400, '#888')}>Trainer</span>
              </div>
            </div>
            <p style={{ ...font(11, 400, '#aaa'), margin: '6px 0 0 24px' }}>
              I agree that the information provided here is an accurate account of what has taken place.
            </p>
          </div>
        </div>

        {/* ── Footer buttons ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid rgba(28,28,28,0.08)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '9px 22px', background: saving ? '#555' : '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => router.back()}
              style={{ padding: '9px 22px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(13, 500) }}
            >
              Cancel
            </button>
          </div>
        </div>

        {error && <p style={{ ...font(12, 400, '#ef4444'), padding: '0 16px 12px' }}>{error}</p>}
      </div>
    </div>
  )
}

export default function Page() { return <Suspense><CreateLearnerFeedbackInner /></Suspense> }
