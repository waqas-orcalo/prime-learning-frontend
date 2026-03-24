'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  useLearnerFeedback,
  useUpdateLearnerFeedback,
  useDeleteLearnerFeedback,
  useSignLearnerFeedback,
} from '@/hooks/use-learner-feedback'

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
  trainersName: string
  keyPoint: string
  useSkillsImpact: string
  moreInfoOn: string
  completedJournal: 'Yes' | 'No' | ''
  ifNoWhyNot: string
  improvementSuggestion: string
}

function ViewLearnerFeedbackInner() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const user = session?.user as any

  const { data: resp, isLoading, isError } = useLearnerFeedback(id)
  const form = resp?.data

  const updateMutation = useUpdateLearnerFeedback()
  const deleteMutation = useDeleteLearnerFeedback()
  const signMutation   = useSignLearnerFeedback()

  const [edit, setEdit] = useState<EditState | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Populate edit state when form data loads
  useEffect(() => {
    if (form && edit === null) {
      setEdit({
        trainersName:         form.trainersName         ?? '',
        keyPoint:             form.keyPoint             ?? '',
        useSkillsImpact:      form.useSkillsImpact      ?? '',
        moreInfoOn:           form.moreInfoOn           ?? '',
        completedJournal:     (form.completedJournal as any) ?? '',
        ifNoWhyNot:           form.ifNoWhyNot           ?? '',
        improvementSuggestion: form.improvementSuggestion ?? '',
      })
    }
  }, [form])

  const set = (k: keyof EditState) => (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setEdit(prev => prev ? { ...prev, [k]: e.target.value } : prev)

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
      onSuccess: () => router.push('/forms/learner-feedback'),
      onError: (err) => { setError(err.message || 'Failed to delete.'); setConfirmDelete(false) },
    })
  }

  const handleSign = (role: 'learner' | 'trainer') => {
    setError('')
    signMutation.mutate({ id, role }, {
      onError: (err) => setError(err.message || 'Failed to record signature.'),
    })
  }

  // Derive display names from populated fields
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

  const saving  = updateMutation.isPending
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
          {isLoading ? 'Loading…' : (form?.instanceName || 'Learner feedback from teach sessions')}
        </h1>
      </div>

      {isError && (
        <div style={{ padding: '14px 16px', background: '#fef2f2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, marginBottom: 16 }}>
          <span style={font(13, 400, '#ef4444')}>Failed to load this form. It may have been deleted or you may not have access.</span>
        </div>
      )}

      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        {/* ── Training Feedback section ── */}
        <div style={SECTION_HEADER}>Training Feedback</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>Trainers Name</span>
              {isLoading ? <FieldSkeleton /> : (
                <textarea value={edit?.trainersName ?? ''} onChange={set('trainersName')} placeholder="Text" style={FIELD_INPUT} rows={2} />
              )}
            </div>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>What would you say was the key point you learned today?</span>
              {isLoading ? <FieldSkeleton lines={2} /> : (
                <textarea value={edit?.keyPoint ?? ''} onChange={set('keyPoint')} placeholder="Text" style={FIELD_INPUT} rows={2} />
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>How would you use the skills you are learning in work? and what impact would this have?</span>
              {isLoading ? <FieldSkeleton lines={3} /> : (
                <textarea value={edit?.useSkillsImpact ?? ''} onChange={set('useSkillsImpact')} placeholder="Text" style={FIELD_INPUT} rows={3} />
              )}
            </div>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>What would you like more information on?</span>
              {isLoading ? <FieldSkeleton lines={3} /> : (
                <textarea value={edit?.moreInfoOn ?? ''} onChange={set('moreInfoOn')} placeholder="Text" style={FIELD_INPUT} rows={3} />
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>Have you completed your learning journal?</span>
              {isLoading ? <FieldSkeleton /> : (
                <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                  {(['Yes', 'No'] as const).map(opt => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={edit?.completedJournal === opt}
                        onChange={() => setEdit(prev => prev ? { ...prev, completedJournal: opt } : prev)}
                        style={{ width: 14, height: 14 }}
                      />
                      <span style={font(13)}>{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div style={FIELD_WRAP}>
              <span style={FIELD_LABEL}>If you selected no why not?</span>
              {isLoading ? <FieldSkeleton lines={2} /> : (
                <textarea
                  value={edit?.ifNoWhyNot ?? ''}
                  onChange={set('ifNoWhyNot')}
                  placeholder="Text"
                  style={{ ...FIELD_INPUT, opacity: edit?.completedJournal !== 'No' ? 0.4 : 1 }}
                  rows={3}
                  disabled={edit?.completedJournal !== 'No'}
                />
              )}
            </div>
          </div>

          <div style={FIELD_WRAP}>
            <span style={FIELD_LABEL}>If you could improve just one thing in the training/lesson – what would it be, and what difference would it make?</span>
            {isLoading ? <FieldSkeleton lines={3} /> : (
              <textarea value={edit?.improvementSuggestion ?? ''} onChange={set('improvementSuggestion')} placeholder="Text" style={{ ...FIELD_INPUT, minHeight: 60 }} rows={3} />
            )}
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
                {form?.learnerSignedAt && (
                  <span style={font(11, 400, '#aaa')}>{fmtDate(form.learnerSignedAt)}</span>
                )}
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
                {form?.trainerSignedAt && (
                  <span style={font(11, 400, '#aaa')}>{fmtDate(form.trainerSignedAt)}</span>
                )}
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
              disabled={saving || isLoading}
              style={{ padding: '9px 22px', background: saving ? '#555' : '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8, cursor: saving || isLoading ? 'not-allowed' : 'pointer', ...font(13, 500, '#fff') }}
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
              This action cannot be undone. The feedback form will be permanently removed.
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

export default function Page() { return <Suspense><ViewLearnerFeedbackInner /></Suspense> }
