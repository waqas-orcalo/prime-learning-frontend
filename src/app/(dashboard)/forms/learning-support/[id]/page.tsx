'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  useLearningSupport,
  useUpdateLearningSupport,
  useDeleteLearningSupport,
  useSignLearningSupport,
} from '@/hooks/use-learning-support'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack      = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconUser      = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><circle cx="7" cy="5" r="3" stroke="#888" stroke-width="1.2"/><path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="#888" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconPaperClip = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"><path d="M11.5 6.5L6.5 11.5a3.5 3.5 0 01-5-5l5.5-5.5a2 2 0 012.83 2.83L5.33 9.33a.5.5 0 01-.7-.7L9 4.27" stroke="#888" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '20px', ...extra } as React.CSSProperties)

const SECTION_HDR: React.CSSProperties = { padding: '10px 16px', background: '#f0f0f0', ...font(13, 600), borderBottom: '1px solid rgba(28,28,28,0.08)' }
const INPUT_STYLE: React.CSSProperties = { width: '100%', padding: '8px 12px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: 6, outline: 'none', ...font(13), background: '#fff', boxSizing: 'border-box' }
const YES_NO = ['No/False', 'Yes/True'] as const

function SelectInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: 28, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1 }}
      >
        {YES_NO.map(o => <option key={o}>{o}</option>)}
      </select>
      <svg width="12" height="12" viewBox="0 0 12 12" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <path d="M2 4.5l4 4 4-4" stroke="#888" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  )
}

function FieldSkeleton() {
  return <div style={{ height: 36, background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', borderRadius: 6, animation: 'shimmer 1.4s infinite' }} />
}

interface EditState {
  attachmentName: string
  monthlyReview: string
  threeMonthlyReview: string
  changesNotes: string
  activityTracker: string
  reasonForStopping: string
  tutorConfirmationA: string
  tutorConfirmationB: string
  learnerConfirmation: string
}

function ViewLearningSupportInner() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const { data: resp, isLoading, isError } = useLearningSupport(id)
  const form = resp?.data

  const updateMutation = useUpdateLearningSupport()
  const deleteMutation = useDeleteLearningSupport()
  const signMutation   = useSignLearningSupport()

  const [edit, setEdit] = useState<EditState | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (form && edit === null) {
      setEdit({
        attachmentName:     form.attachmentName     ?? '',
        monthlyReview:      form.monthlyReview      ?? 'No/False',
        threeMonthlyReview: form.threeMonthlyReview ?? 'No/False',
        changesNotes:       form.changesNotes       ?? '',
        activityTracker:    form.activityTracker    ?? '',
        reasonForStopping:  form.reasonForStopping  ?? '',
        tutorConfirmationA: form.tutorConfirmationA ?? 'No/False',
        tutorConfirmationB: form.tutorConfirmationB ?? 'No/False',
        learnerConfirmation: form.learnerConfirmation ?? 'No/False',
      })
    }
  }, [form])

  const set = (k: keyof EditState) => (val: string) =>
    setEdit(prev => prev ? { ...prev, [k]: val } : prev)

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
      onSuccess: () => router.push('/forms/learning-support'),
      onError: (err) => { setError(err.message || 'Failed to delete.'); setConfirmDelete(false) },
    })
  }

  const handleSign = (role: 'learner' | 'trainer') => {
    setError('')
    signMutation.mutate({ id, role }, {
      onError: (err) => setError(err.message || 'Failed to record signature.'),
    })
  }

  const learnerObj  = form?.learnerId as any
  const trainerObj  = form?.trainerId as any
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
    <div style={{ padding: '24px 28px', maxWidth: 860, ...FF }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}>
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>
          {isLoading ? 'Loading…' : (form?.instanceName || '5.Learning Support Form')}
        </h1>
      </div>

      {isError && (
        <div style={{ padding: '14px 16px', background: '#fef2f2', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, marginBottom: 16 }}>
          <span style={font(13, 400, '#ef4444')}>Failed to load this form. It may have been deleted or you may not have access.</span>
        </div>
      )}

      <div style={{ border: '1px solid rgba(28,28,28,0.12)', borderRadius: 12, overflow: 'hidden' }}>

        {/* ── Section 1 ── */}
        <div style={SECTION_HDR}>1) Learning Support Documents</div>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', background: '#fafafa', border: '1px dashed rgba(28,28,28,0.15)', borderRadius: 8 }}>
            <img src={iconPaperClip} width={14} height={14} alt="" />
            <span style={font(12, 400, '#888')}>
              {isLoading ? 'Loading…' : (edit?.attachmentName || 'Nothing is attached. Please Attach Learning Support Plan')}
            </span>
            {form?.attachmentUrl && (
              <a href={form.attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', padding: '5px 14px', background: '#1c1c1c', color: '#fff', borderRadius: 6, cursor: 'pointer', textDecoration: 'none', ...font(12, 500, '#fff') }}>
                View file
              </a>
            )}
          </div>
        </div>

        {/* ── Section 2 ── */}
        <div style={SECTION_HDR}>2) When will the support plan be reviewed?</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <div style={{ padding: '0 0 12px', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 4px', lineHeight: '18px' }}>Regular Learning Support reviews to take place with the learner</p>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 4px', lineHeight: '18px' }}>Normal expectation would be to update the learning support plan on a monthly basis if support is being provided.</p>
            <p style={{ ...font(12, 400, '#555'), margin: 0, lineHeight: '18px' }}>If a learner refuses additional Learning Support then the plan will need to be reviewed every three month to take into account any changes in the learners circumstances.</p>
          </div>
          <div>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>Monthly support review</label>
            {isLoading ? <FieldSkeleton /> : (
              <SelectInput value={edit?.monthlyReview ?? 'No/False'} onChange={set('monthlyReview')} />
            )}
          </div>
          <div>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>3 monthly support review</label>
            {isLoading ? <FieldSkeleton /> : (
              <SelectInput value={edit?.threeMonthlyReview ?? 'No/False'} onChange={set('threeMonthlyReview')} />
            )}
          </div>
        </div>

        {/* ── Section 3 ── */}
        <div style={SECTION_HDR}>3) Monthly Support Review</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <div>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>Have there been any changes to the plan?</label>
            {isLoading ? <FieldSkeleton /> : (
              <input value={edit?.changesNotes ?? ''} onChange={e => set('changesNotes')(e.target.value)} style={INPUT_STYLE} />
            )}
          </div>
          <div>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 4px', lineHeight: '18px' }}>Additional Learning Support given to learners must be logged below on the Activity Tracker</p>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 8px', lineHeight: '18px' }}>To use the tracker, click on the green + button to add a new entry</p>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>Activity Tracker</label>
            {isLoading ? <FieldSkeleton /> : (
              <input value={edit?.activityTracker ?? ''} onChange={e => set('activityTracker')(e.target.value)} style={INPUT_STYLE} />
            )}
          </div>
          <div>
            <label style={{ ...font(12, 500), display: 'block', marginBottom: 6 }}>Reason for stopping support</label>
            {isLoading ? <FieldSkeleton /> : (
              <input value={edit?.reasonForStopping ?? ''} onChange={e => set('reasonForStopping')(e.target.value)} style={INPUT_STYLE} />
            )}
          </div>
        </div>

        {/* ── Section 4 ── */}
        <div style={SECTION_HDR}>4) Tutor Confirmation of the plan</div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16, borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <div>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 8px', lineHeight: '18px' }}>
              a) I am satisfied the adjustments made to the learner's programme are required and deemed reasonable in order to address their barriers to learning and that there is a delivery cost in providing these. Without the support above it is thought the learner would be unlikely to achieve or would face significant difficulties achieving or remaining on programme. Learning Support Funding (LSF) to be claimed
            </p>
            {isLoading ? <FieldSkeleton /> : (
              <SelectInput value={edit?.tutorConfirmationA ?? 'No/False'} onChange={set('tutorConfirmationA')} />
            )}
          </div>
          <div>
            <p style={{ ...font(12, 400, '#555'), margin: '0 0 8px', lineHeight: '18px' }}>
              b) I am satisfied that the planned adjustments would be beneficial to the learner though these will not result in additional costs being incurred and / or the needs affected would not have material impact on ability to successfully engage in learning day to day. LSF Funding will not be claimed.
            </p>
            {isLoading ? <FieldSkeleton /> : (
              <SelectInput value={edit?.tutorConfirmationB ?? 'No/False'} onChange={set('tutorConfirmationB')} />
            )}
          </div>
        </div>

        {/* ── Section 5 ── */}
        <div style={SECTION_HDR}>5) Learner confirmation of the plan</div>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
          <p style={{ ...font(12, 400, '#555'), margin: '0 0 8px', lineHeight: '18px' }}>
            I agree that the adjustments identified are necessary and without which I believe the completion of my apprenticeship would be at risk and that the activities identified are reasonable in order to address my barriers to learning. I agree that this information can be shared with The Prime College and my Employer.
          </p>
          {isLoading ? <FieldSkeleton /> : (
            <SelectInput value={edit?.learnerConfirmation ?? 'No/False'} onChange={set('learnerConfirmation')} />
          )}
        </div>

        {/* ── Signatures ── */}
        <div style={{ padding: '10px 16px', background: '#f0f0f0', ...font(13, 600), borderBottom: '1px solid rgba(28,28,28,0.08)', borderTop: '1px solid rgba(28,28,28,0.08)' }}>
          Signature
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <div style={{ display: 'flex', gap: 12 }}>
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

        {error && <p style={{ ...font(12, 400, '#ef4444'), padding: '0 16px 12px', textAlign: 'center' }}>{error}</p>}
      </div>

      {/* ── Confirm delete modal ── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px 32px', maxWidth: 400, width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', ...FF }}>
            <h2 style={{ ...font(18, 600), margin: '0 0 10px' }}>Delete form?</h2>
            <p style={{ ...font(13, 400, '#555'), margin: '0 0 24px' }}>
              This action cannot be undone. The learning support form will be permanently removed.
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

export default function Page() { return <Suspense><ViewLearningSupportInner /></Suspense> }
