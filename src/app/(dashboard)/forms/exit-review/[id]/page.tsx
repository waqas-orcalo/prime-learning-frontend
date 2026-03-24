'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  useExitReview,
  useUpdateExitReview,
  useDeleteExitReview,
  useSignExitReview,
} from '@/hooks/use-exit-review'

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

function FieldSkeleton({ lines = 1 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ height: 14, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', borderRadius: 4, animation: 'shimmer 1.4s infinite', width: i === 0 ? '40%' : '75%' }} />
      ))}
    </div>
  )
}

interface EditState {
  learnersName: string
  startDate: string
  answers: Record<string, string>
  answerLast: string
}

function ViewExitReviewInner() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const { data: resp, isLoading, isError } = useExitReview(id)
  const form = resp?.data

  const updateMutation = useUpdateExitReview()
  const deleteMutation = useDeleteExitReview()
  const signMutation   = useSignExitReview()

  const [edit, setEdit] = useState<EditState | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (form && edit === null) {
      // MongoDB Map fields are serialised as plain objects over the wire
      const rawAnswers = form.answers ?? {}
      const answers: Record<string, string> = typeof rawAnswers === 'object' && !Array.isArray(rawAnswers)
        ? Object.fromEntries(Object.entries(rawAnswers))
        : {}
      setEdit({
        learnersName: form.learnersName ?? '',
        startDate:    form.startDate
          ? new Date(form.startDate).toISOString().slice(0, 10)
          : '',
        answers,
        answerLast: form.answerLast ?? '',
      })
    }
  }, [form])

  const setAnswer = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setEdit(prev => prev ? { ...prev, answers: { ...prev.answers, [key]: e.target.value } } : prev)

  const handleSave = () => {
    if (!edit) return
    setError('')
    updateMutation.mutate(
      { id, ...edit },
      {
        onSuccess: () => {},
        onError: (err) => setError(err.message || 'Failed to save.'),
      },
    )
  }

  const handleDelete = () => {
    setError('')
    deleteMutation.mutate(id, {
      onSuccess: () => router.push('/forms/exit-review'),
      onError: (err) => { setError(err.message || 'Failed to delete.'); setConfirmDelete(false) },
    })
  }

  const handleSign = (role: 'learner' | 'trainer') => {
    setError('')
    signMutation.mutate({ id, role }, {
      onError: (err) => setError(err.message || 'Failed to record signature.'),
    })
  }

  const learnerObj = form?.learnerId as any
  const trainerObj = form?.trainerId as any
  const learnerName = typeof learnerObj === 'object' && learnerObj
    ? `${learnerObj.firstName ?? ''} ${learnerObj.lastName ?? ''}`.trim()
    : ''
  const trainerName = typeof trainerObj === 'object' && trainerObj
    ? `${trainerObj.firstName ?? ''} ${trainerObj.lastName ?? ''}`.trim()
    : 'Trainer'

  const fmtDate = (d: string | null | undefined) => {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
    catch { return d }
  }

  const saving   = updateMutation.isPending
  const deleting = deleteMutation.isPending
  const signing  = signMutation.isPending

  return (
    <div style={{ padding: '24px 28px', maxWidth: 980, ...FF }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>
          {isLoading ? 'Loading…' : (form?.instanceName || 'Exit review and Programme Evaluation')}
        </h1>
      </div>

      {isError && (
        <div style={{ padding: '14px 16px', background: '#fef2f2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, marginBottom: 16 }}>
          <span style={font(13, 400, '#ef4444')}>Failed to load this form. It may have been deleted or you may not have access.</span>
        </div>
      )}

      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        {/* ── Learner Name and Date ── */}
        <div style={SECTION_HDR}>Learner Name and Date</div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ ...FIELD_WRAP, minHeight: 'auto' }}>
            <span style={FIELD_LABEL}>Learners Name*</span>
            {isLoading ? <FieldSkeleton /> : (
              <input
                value={edit?.learnersName ?? ''}
                onChange={e => setEdit(prev => prev ? { ...prev, learnersName: e.target.value } : prev)}
                placeholder="Text"
                style={{ ...FIELD_INPUT, padding: '2px 0' }}
              />
            )}
          </div>
          <div style={{ ...FIELD_WRAP, minHeight: 'auto' }}>
            <span style={FIELD_LABEL}>Start Date:</span>
            {isLoading ? <FieldSkeleton /> : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={iconCal} width={14} height={14} alt="" />
                <input
                  type="date"
                  value={edit?.startDate ?? ''}
                  onChange={e => setEdit(prev => prev ? { ...prev, startDate: e.target.value } : prev)}
                  style={{ ...FIELD_INPUT, padding: '2px 0', flex: 1 }}
                />
              </div>
            )}
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
                    {isLoading ? <FieldSkeleton lines={3} /> : (
                      <textarea
                        value={edit?.answers[key] ?? ''}
                        onChange={setAnswer(key)}
                        placeholder="Text"
                        style={{ ...FIELD_INPUT, minHeight: 48 }}
                        rows={3}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          {/* Last standalone question */}
          <div style={{ ...FIELD_WRAP, minHeight: 80 }}>
            <span style={FIELD_LABEL}>{PE_LAST}</span>
            {isLoading ? <FieldSkeleton lines={3} /> : (
              <textarea
                value={edit?.answerLast ?? ''}
                onChange={e => setEdit(prev => prev ? { ...prev, answerLast: e.target.value } : prev)}
                placeholder="Text"
                style={{ ...FIELD_INPUT, minHeight: 48 }}
                rows={3}
              />
            )}
          </div>
        </div>

        {/* ── Signature ── */}
        <div style={SECTION_HDR}>Signature</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Learner */}
          <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, padding: '12px 16px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form?.learnerSigned ?? false}
                  disabled={form?.learnerSigned || signing || isLoading}
                  onChange={() => !form?.learnerSigned && handleSign('learner')}
                  style={{ width: 14, height: 14, cursor: form?.learnerSigned ? 'default' : 'pointer' }}
                />
                <span style={font(13, 500)}>Signature</span>
                {form?.learnerSigned && <span style={{ ...font(11, 400, '#22c55e'), marginLeft: 4 }}>✓ Signed</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={iconUser} width={14} height={14} alt="" />
                <span style={font(12, 400, '#555')}>{learnerName || 'Learner'} (Learner)</span>
                {form?.learnerSignedAt && <span style={font(11, 400, '#aaa')}>{fmtDate(form.learnerSignedAt)}</span>}
              </div>
            </div>
            <p style={{ ...font(11, 400, '#888'), margin: '6px 0 0 24px' }}>I agree that the information provided here is an accurate account of what has taken place.</p>
          </div>
          {/* Trainer */}
          <div style={{ border: '1px solid rgba(28,28,28,0.08)', borderRadius: 8, padding: '12px 16px', background: '#fafafa' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form?.trainerSigned ?? false}
                  disabled={form?.trainerSigned || signing || isLoading}
                  onChange={() => !form?.trainerSigned && handleSign('trainer')}
                  style={{ width: 14, height: 14, cursor: form?.trainerSigned ? 'default' : 'pointer' }}
                />
                <span style={{ ...font(13, 500, '#888') }}>Signature</span>
                {form?.trainerSigned && <span style={{ ...font(11, 400, '#22c55e'), marginLeft: 4 }}>✓ Signed</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={iconUser} width={14} height={14} alt="" />
                <span style={font(12, 400, '#888')}>{trainerName}</span>
                {form?.trainerSignedAt && <span style={font(11, 400, '#aaa')}>{fmtDate(form.trainerSignedAt)}</span>}
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
              disabled={saving || isLoading}
              style={{ padding: '9px 22px', background: saving ? '#555' : '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: saving || isLoading ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => router.back()} style={{ padding: '9px 22px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(13, 500) }}>
              Cancel
            </button>
          </div>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleting || isLoading}
            style={{ padding: '9px 22px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(13, 500, '#fff') }}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>

        {error && <p style={{ ...font(12, 400, '#ef4444'), padding: '0 16px 12px' }}>{error}</p>}
      </div>

      {/* ── Confirm delete modal ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', maxWidth: 400, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', ...FF }}>
            <h2 style={{ ...font(18, 600), margin: '0 0 10px' }}>Delete form?</h2>
            <p style={{ ...font(13, 400, '#555'), margin: '0 0 24px' }}>
              This action cannot be undone. The exit review form will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '9px 20px', background: '#fff', color: '#1c1c1c', border: '1px solid rgba(28,28,28,0.25)', borderRadius: 8, cursor: 'pointer', ...font(13, 500) }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: '9px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', ...font(13, 500, '#fff') }}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() { return <Suspense><ViewExitReviewInner /></Suspense> }
