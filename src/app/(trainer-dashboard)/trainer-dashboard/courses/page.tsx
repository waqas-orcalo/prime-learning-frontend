'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

// ── Design tokens ────────────────────────────────────────────────────────────
const FF   = "'Inter', sans-serif"
const FEAT = "'ss01' 1, 'cv01' 1, 'cv11' 1"
const f = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}): React.CSSProperties =>
  ({ fontFamily: FF, fontSize: `${size}px`, fontWeight: weight, color, fontFeatureSettings: FEAT, lineHeight: 1.5, ...extra })

const SHADOW = '0px 2px 8px rgba(13,10,44,0.09)'
const BORDER = '1px solid rgba(28,28,28,0.10)'
const NAVY   = '#1E1B39'
const MUTED  = '#9291A5'
const GREEN  = '#22c55e'
const RED    = '#ef4444'
const AMBER  = '#f59e0b'
const INDIGO = '#6C63FF'
const BG     = '#F5F5FA'

const card: React.CSSProperties  = { background: '#fff', borderRadius: 14, boxShadow: SHADOW, padding: 20 }
const inputStyle: React.CSSProperties = { border: BORDER, borderRadius: 10, padding: '9px 12px', fontFamily: FF, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' }
const btnPrimary: React.CSSProperties = { background: NAVY, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', cursor: 'pointer', fontFamily: FF, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }
const btnSecondary: React.CSSProperties = { background: 'transparent', color: '#1c1c1c', border: BORDER, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontFamily: FF, fontSize: 13, fontWeight: 500 }
const btnDanger: React.CSSProperties = { background: RED, color: '#fff', border: 'none', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontFamily: FF, fontSize: 13, fontWeight: 500 }

// ── Types ────────────────────────────────────────────────────────────────────
interface CourseSlide { content: string }
interface QuizQuestion { question: string; options: string[]; correctIndex: number; explanation?: string }
interface CourseQuiz { passingScore: number; questions: QuizQuestion[] }
interface CourseModule { name: string; slides: CourseSlide[]; quiz?: CourseQuiz }
interface Course {
  _id: string; title: string; description?: string; category?: string
  status?: string; thumbnailEmoji?: string; enrolledUsers?: string[]
  createdAt?: string; courseModules?: CourseModule[]
  /** Annotated by backend: true if trainer created this course */
  isOwner?: boolean
  /** Annotated by backend: true if trainer has any form of access (own or assigned) */
  trainerHasAccess?: boolean
  /** Trainers explicitly given access by admin */
  assignedTrainers?: string[]
}
interface Learner { _id: string; firstName: string; lastName: string; email: string }

const emptySlide = (): CourseSlide => ({ content: '' })
const emptyQuestion = (): QuizQuestion => ({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' })
const emptyModule = (): CourseModule => ({ name: '', slides: [emptySlide()] })

// ── Helpers ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${BG}`, borderTopColor: NAVY, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Modal({ title, onClose, children, width = 640 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,10,44,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(13,10,44,0.18)', width: '100%', maxWidth: width, maxHeight: '92vh', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={f(18, 700, NAVY)}>{title}</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 22, lineHeight: 1, padding: '0 4px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ ...f(13, 500, NAVY), display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 99, padding: '3px 9px', fontSize: 12, fontWeight: 500, color, background: bg }}>{children}</span>
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TrainerCoursesPage() {
  const { data: session } = useSession()
  const token = (session as any)?.user?.accessToken

  const [courses, setCourses]     = useState<Course[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [error, setError]         = useState('')

  // My learners (for enrollment)
  const [myLearners, setMyLearners] = useState<Learner[]>([])

  // Create/Edit modal
  const [showEditor, setShowEditor]   = useState(false)
  const [editCourse, setEditCourse]   = useState<Course | null>(null)
  const [saving, setSaving]           = useState(false)
  const [courseForm, setCourseForm]   = useState({
    title: '', description: '', category: '', thumbnailEmoji: '📚', status: 'PUBLISHED',
  })
  const [courseModules, setCourseModules] = useState<CourseModule[]>([emptyModule()])

  // Enroll modal
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null)
  const [enrollSearch, setEnrollSearch] = useState('')
  const [selectedIds, setSelectedIds]   = useState<string[]>([])
  const [enrolling, setEnrolling]       = useState(false)

  // Delete confirm
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null)
  const [deleting, setDeleting]         = useState(false)

  // ── Load courses ─────────────────────────────────────────────────────────
  const loadCourses = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await apiFetch<any>('/courses?limit=100', token)
      const items: Course[] = res?.data?.items ?? res?.data ?? []
      setCourses(items)
    } catch { setError('Failed to load courses') }
    finally { setLoading(false) }
  }, [token])

  // ── Load my learners (trainer-scoped) ────────────────────────────────────
  const loadMyLearners = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiFetch<any>('/users/trainer/my-learners', token)
      setMyLearners(Array.isArray(res?.data) ? res.data : [])
    } catch { setMyLearners([]) }
  }, [token])

  useEffect(() => { loadCourses(); loadMyLearners() }, [loadCourses, loadMyLearners])

  // ── Editor helpers ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditCourse(null)
    setCourseForm({ title: '', description: '', category: '', thumbnailEmoji: '📚', status: 'PUBLISHED' })
    setCourseModules([emptyModule()])
    setShowEditor(true)
  }

  const openEdit = (c: Course) => {
    setEditCourse(c)
    setCourseForm({ title: c.title, description: c.description ?? '', category: c.category ?? '', thumbnailEmoji: c.thumbnailEmoji ?? '📚', status: c.status ?? 'PUBLISHED' })
    setCourseModules(
      c.courseModules && c.courseModules.length > 0
        ? c.courseModules.map(m => ({
            name: m.name,
            slides: m.slides.length > 0 ? m.slides.map(s => ({ content: s.content })) : [emptySlide()],
            quiz: m.quiz ? {
              passingScore: m.quiz.passingScore ?? 70,
              questions: m.quiz.questions.map(q => ({ question: q.question, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation ?? '' }))
            } : undefined,
          }))
        : [emptyModule()]
    )
    setShowEditor(true)
  }

  const handleSave = async () => {
    if (!courseForm.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        ...courseForm,
        courseModules: courseModules.map(m => ({
          name: m.name,
          slides: m.slides.filter(s => s.content.trim()),
          quiz: m.quiz ? {
            passingScore: m.quiz.passingScore,
            questions: m.quiz.questions.filter(q => q.question.trim()),
          } : undefined,
        })),
      }
      if (editCourse) {
        await apiFetch<any>(`/courses/${editCourse._id}`, token, { method: 'PATCH', body: JSON.stringify(payload) })
      } else {
        await apiFetch<any>('/courses', token, { method: 'POST', body: JSON.stringify(payload) })
      }
      setShowEditor(false); setEditCourse(null); loadCourses()
    } catch (e: any) { setError(e?.message ?? 'Save failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteCourse) return
    setDeleting(true)
    try {
      await apiFetch<any>(`/courses/${deleteCourse._id}`, token, { method: 'DELETE' })
      setDeleteCourse(null); loadCourses()
    } catch { setError('Delete failed') } finally { setDeleting(false) }
  }

  // ── Enroll helpers ────────────────────────────────────────────────────────
  const openEnroll = (c: Course) => {
    setEnrollCourse(c)
    setSelectedIds(c.enrolledUsers ?? [])
    setEnrollSearch('')
  }

  const handleEnroll = async () => {
    if (!enrollCourse || selectedIds.length === 0) return
    setEnrolling(true)
    try {
      await apiFetch<any>(`/courses/${enrollCourse._id}/enroll`, token, {
        method: 'POST', body: JSON.stringify({ userIds: selectedIds }),
      })
      setEnrollCourse(null); loadCourses()
    } catch { setError('Enrollment failed') } finally { setEnrolling(false) }
  }

  // ── Filtered display ──────────────────────────────────────────────────────
  const displayed = courses.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()))
  const filteredLearners = myLearners.filter(l =>
    !enrollSearch || `${l.firstName} ${l.lastName} ${l.email}`.toLowerCase().includes(enrollSearch.toLowerCase())
  )

  const EMOJI_OPTIONS = ['📚','💻','🎯','🧠','💼','🧪','🔬','🎨','📊','🚀','🌍','🏋️']

  return (
    <div style={{ padding: '28px 32px 48px', background: BG, minHeight: '100vh' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={f(22, 700, NAVY, { margin: 0 })}>Course Management</h1>
          <p style={f(13, 400, MUTED, { margin: '4px 0 0' })}>Create courses and enroll your learners</p>
        </div>
        <button style={btnPrimary} onClick={openCreate}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
          New Course
        </button>
      </div>

      {/* Learner assignment notice */}
      <div style={{ marginBottom: 20, padding: '12px 16px', background: myLearners.length > 0 ? 'rgba(34,197,94,0.07)' : 'rgba(245,158,11,0.07)', border: `1px solid ${myLearners.length > 0 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>{myLearners.length > 0 ? '✅' : '⚠️'}</span>
        <span style={f(13, 500, myLearners.length > 0 ? '#15803d' : '#92400e')}>
          {myLearners.length > 0
            ? `${myLearners.length} learner${myLearners.length > 1 ? 's' : ''} assigned to you and available for enrollment`
            : 'No learners assigned to you yet. Ask your admin to assign learners to your account.'}
        </span>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: `1px solid ${RED}`, borderRadius: 10, padding: '10px 14px', marginBottom: 16, ...f(13, 400, RED) }}>{error}</div>
      )}

      {/* Search + table */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG, border: BORDER, borderRadius: 10, padding: '8px 12px', flex: 1, maxWidth: 280 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={MUTED} strokeWidth="1.2"/><path d="M9.5 9.5L12 12" stroke={MUTED} strokeWidth="1.2" strokeLinecap="round"/></svg>
            <input type="text" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: FF, fontSize: 13, color: '#1c1c1c', width: '100%' }} />
          </div>
          <span style={f(12, 400, MUTED)}>{displayed.length} course{displayed.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: BORDER }}>
                  {['Course', 'Modules', 'Enrolled', 'Status', 'Access', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', ...f(11, 600, MUTED), textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', ...f(14, 400, MUTED) }}>
                    No courses yet — create your first one!
                  </td></tr>
                )}
                {displayed.map((c, i) => (
                  <tr key={c._id} style={{ borderBottom: i < displayed.length - 1 ? BORDER : 'none' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                          {c.thumbnailEmoji || '📚'}
                        </div>
                        <div>
                          <div style={f(14, 600, NAVY)}>{c.title}</div>
                          {c.description && <div style={f(12, 400, MUTED, { maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{c.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={f(13, 500, '#1c1c1c')}>{c.courseModules?.length ?? 0}</span>
                      {c.courseModules?.some(m => m.quiz && m.quiz.questions.length > 0) && (
                        <span style={{ marginLeft: 6, ...f(10, 500, INDIGO), background: 'rgba(108,99,255,0.08)', borderRadius: 99, padding: '2px 7px' }}>🧩 Quiz</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={f(13, 500, '#1c1c1c')}>{c.enrolledUsers?.length ?? 0}</span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      {c.status === 'PUBLISHED'
                        ? <Badge color="#15803d" bg="rgba(34,197,94,0.1)">Published</Badge>
                        : <Badge color={MUTED} bg="rgba(28,28,28,0.06)">{c.status ?? 'Draft'}</Badge>}
                    </td>
                    {/* Access source badge */}
                    <td style={{ padding: '14px 12px' }}>
                      {c.isOwner !== false
                        ? <Badge color="#1d4ed8" bg="rgba(59,130,246,0.09)">✏️ Created by me</Badge>
                        : <Badge color="#7c3aed" bg="rgba(124,58,237,0.09)">🔑 Admin access</Badge>}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {/* Edit/Delete only available for own courses */}
                        {c.isOwner !== false && (
                          <button style={{ ...btnSecondary, fontSize: 12, padding: '5px 10px', borderRadius: 8 }}
                            onClick={() => openEdit(c)}>Edit</button>
                        )}
                        <button style={{ ...btnSecondary, fontSize: 12, padding: '5px 10px', borderRadius: 8, color: INDIGO, borderColor: INDIGO }}
                          onClick={() => openEnroll(c)}>
                          Enroll ({myLearners.length})
                        </button>
                        {c.isOwner !== false && (
                          <button style={{ ...btnSecondary, fontSize: 12, padding: '5px 10px', borderRadius: 8, color: RED }}
                            onClick={() => setDeleteCourse(c)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create/Edit Course Modal ── */}
      {showEditor && (
        <Modal title={editCourse ? `Edit — ${editCourse.title}` : 'Create New Course'} onClose={() => { setShowEditor(false); setEditCourse(null) }} width={720}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Basic info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Course Title *">
                <input style={inputStyle} value={courseForm.title} onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Business Communication" />
              </Field>
              <Field label="Category">
                <input style={inputStyle} value={courseForm.category} onChange={e => setCourseForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Professional Skills" />
              </Field>
            </div>
            <Field label="Description">
              <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={courseForm.description}
                onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description…" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Emoji Icon">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {EMOJI_OPTIONS.map(em => (
                    <button key={em} onClick={() => setCourseForm(p => ({ ...p, thumbnailEmoji: em }))}
                      style={{ width: 36, height: 36, borderRadius: 8, border: courseForm.thumbnailEmoji === em ? `2px solid ${NAVY}` : BORDER, background: courseForm.thumbnailEmoji === em ? 'rgba(28,28,28,0.07)' : '#fff', fontSize: 18, cursor: 'pointer' }}>
                      {em}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Status">
                <select style={inputStyle} value={courseForm.status} onChange={e => setCourseForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </Field>
            </div>

            {/* Modules */}
            <div style={{ borderTop: BORDER, paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={f(14, 700, NAVY)}>Modules</div>
                <button style={{ ...btnPrimary, padding: '6px 12px', fontSize: 12 }}
                  onClick={() => setCourseModules(ms => [...ms, emptyModule()])}>+ Add Module</button>
              </div>
              {courseModules.map((mod, mi) => (
                <div key={mi} style={{ border: BORDER, borderRadius: 12, padding: 16, marginBottom: 12, background: BG }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ ...f(12, 700, '#fff'), background: NAVY, borderRadius: 6, padding: '2px 8px' }}>M{mi + 1}</div>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="Module name" value={mod.name}
                      onChange={e => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, name: e.target.value }))} />
                    {courseModules.length > 1 && (
                      <button onClick={() => setCourseModules(ms => ms.filter((_, i) => i !== mi))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
                    )}
                  </div>

                  {/* Slides */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={f(12, 600, MUTED)}>SLIDES</div>
                      <button style={{ ...btnSecondary, fontSize: 11, padding: '3px 8px', borderRadius: 6 }}
                        onClick={() => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, slides: [...m.slides, emptySlide()] }))}>+ Slide</button>
                    </div>
                    {mod.slides.map((slide, si) => (
                      <div key={si} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                        <span style={{ ...f(11, 600, MUTED), minWidth: 20, marginTop: 10 }}>S{si + 1}</span>
                        <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical', flex: 1 }} placeholder={`Slide ${si + 1} content…`}
                          value={slide.content}
                          onChange={e => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, slides: m.slides.map((s, j) => j !== si ? s : { content: e.target.value }) }))} />
                        {mod.slides.length > 1 && (
                          <button onClick={() => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, slides: m.slides.filter((_, j) => j !== si) }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: 16, marginTop: 8 }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quiz section */}
                  <div style={{ borderTop: BORDER, paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={f(13, 700, NAVY)}>🧩 Quiz after this module</span>
                        {mod.quiz && <span style={{ ...f(11, 500, '#fff'), background: INDIGO, borderRadius: 99, padding: '2px 8px' }}>{mod.quiz.questions.length} Q</span>}
                      </div>
                      {mod.quiz ? (
                        <button style={{ ...btnSecondary, fontSize: 11, padding: '3px 10px', borderRadius: 6, color: RED }}
                          onClick={() => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, quiz: undefined }))}>Remove Quiz</button>
                      ) : (
                        <button style={{ ...btnSecondary, fontSize: 11, padding: '3px 10px', borderRadius: 6, color: INDIGO, borderColor: INDIGO }}
                          onClick={() => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, quiz: { passingScore: 70, questions: [emptyQuestion()] } }))}>+ Add Quiz</button>
                      )}
                    </div>

                    {mod.quiz && (
                      <div style={{ background: '#fff', borderRadius: 10, padding: 12, border: BORDER }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <span style={f(13, 500, NAVY)}>Pass mark:</span>
                          <input type="number" min={0} max={100} style={{ ...inputStyle, width: 70 }}
                            value={mod.quiz.passingScore}
                            onChange={e => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, quiz: { ...m.quiz!, passingScore: Number(e.target.value) } }))} />
                          <span style={f(13, 400, MUTED)}>%</span>
                        </div>

                        {mod.quiz.questions.map((q, qi) => (
                          <div key={qi} style={{ border: BORDER, borderRadius: 10, padding: 12, marginBottom: 10, background: BG }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                              <span style={{ ...f(11, 700, '#fff'), background: INDIGO, borderRadius: 6, padding: '2px 8px', alignSelf: 'flex-start', marginTop: 2, flexShrink: 0 }}>Q{qi + 1}</span>
                              <input style={{ ...inputStyle, flex: 1 }} placeholder="Question text…" value={q.question}
                                onChange={e => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, quiz: { ...m.quiz!, questions: m.quiz!.questions.map((qq, j) => j !== qi ? qq : { ...qq, question: e.target.value }) } }))} />
                              <button onClick={() => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, quiz: { ...m.quiz!, questions: m.quiz!.questions.filter((_, j) => j !== qi) } }))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: RED, fontSize: 16, alignSelf: 'flex-start' }}>×</button>
                            </div>
                            {q.options.map((opt, oi) => (
                              <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <input type="radio" name={`q-${mi}-${qi}`} checked={q.correctIndex === oi}
                                  onChange={() => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, quiz: { ...m.quiz!, questions: m.quiz!.questions.map((qq, j) => j !== qi ? qq : { ...qq, correctIndex: oi }) } }))} />
                                <input style={{ ...inputStyle, flex: 1 }} placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt}
                                  onChange={e => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, quiz: { ...m.quiz!, questions: m.quiz!.questions.map((qq, j) => j !== qi ? qq : { ...qq, options: qq.options.map((o, k) => k === oi ? e.target.value : o) }) } }))} />
                                {q.correctIndex === oi && <span style={f(11, 600, GREEN)}>✓ Correct</span>}
                              </div>
                            ))}
                            <input style={{ ...inputStyle, marginTop: 4 }} placeholder="Explanation (optional)" value={q.explanation ?? ''}
                              onChange={e => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, quiz: { ...m.quiz!, questions: m.quiz!.questions.map((qq, j) => j !== qi ? qq : { ...qq, explanation: e.target.value }) } }))} />
                          </div>
                        ))}

                        <button style={{ ...btnSecondary, fontSize: 12, padding: '5px 12px', borderRadius: 8, color: INDIGO, borderColor: INDIGO, marginTop: 4 }}
                          onClick={() => setCourseModules(ms => ms.map((m, i) => i !== mi ? m : { ...m, quiz: { ...m.quiz!, questions: [...m.quiz!.questions, emptyQuestion()] } }))}>
                          + Add Question
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && <div style={{ ...f(13, 400, RED) }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={btnSecondary} onClick={() => { setShowEditor(false); setEditCourse(null) }}>Cancel</button>
              <button style={btnPrimary} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editCourse ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Enroll Modal ── */}
      {enrollCourse && (
        <Modal title={`Enroll Learners — ${enrollCourse.title}`} onClose={() => setEnrollCourse(null)} width={520}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {myLearners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                <div style={f(14, 600, NAVY)}>No learners assigned to you</div>
                <div style={f(13, 400, MUTED, { marginTop: 6 })}>Ask your admin to assign learners to your account first.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG, border: BORDER, borderRadius: 10, padding: '8px 12px' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={MUTED} strokeWidth="1.2"/><path d="M9.5 9.5L12 12" stroke={MUTED} strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <input type="text" placeholder="Search learners…" value={enrollSearch} onChange={e => setEnrollSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontFamily: FF, fontSize: 13, color: '#1c1c1c', flex: 1 }} />
                </div>

                <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {filteredLearners.map(l => {
                    const checked = selectedIds.includes(l._id)
                    const isEnrolled = (enrollCourse.enrolledUsers ?? []).some(id => String(id) === l._id)
                    return (
                      <label key={l._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: checked ? 'rgba(108,99,255,0.06)' : '#fff', border: checked ? `1px solid rgba(108,99,255,0.2)` : BORDER, transition: 'all 0.15s' }}>
                        <input type="checkbox" checked={checked}
                          onChange={() => setSelectedIds(ids => checked ? ids.filter(id => id !== l._id) : [...ids, l._id])}
                          style={{ width: 16, height: 16, accentColor: INDIGO }} />
                        <div style={{ flex: 1 }}>
                          <div style={f(13, 600, NAVY)}>{l.firstName} {l.lastName}</div>
                          <div style={f(11, 400, MUTED)}>{l.email}</div>
                        </div>
                        {isEnrolled && <span style={{ ...f(10, 600, GREEN), background: 'rgba(34,197,94,0.1)', borderRadius: 99, padding: '2px 7px' }}>Enrolled</span>}
                      </label>
                    )
                  })}
                  {filteredLearners.length === 0 && (
                    <div style={{ ...f(13, 400, MUTED), textAlign: 'center', padding: 20 }}>No learners match your search.</div>
                  )}
                </div>

                <div style={f(12, 400, MUTED)}>{selectedIds.length} selected</div>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={btnSecondary} onClick={() => setEnrollCourse(null)}>Cancel</button>
              {myLearners.length > 0 && (
                <button style={btnPrimary} onClick={handleEnroll} disabled={enrolling || selectedIds.length === 0}>
                  {enrolling ? 'Enrolling…' : `Enroll ${selectedIds.length} Learner${selectedIds.length !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteCourse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,10,44,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 400, width: '100%', boxShadow: '0 8px 40px rgba(13,10,44,0.18)' }}>
            <div style={f(17, 700, NAVY, { marginBottom: 12 })}>Delete Course</div>
            <div style={f(14, 400, '#444', { marginBottom: 24 })}>Delete <strong>{deleteCourse.title}</strong>? This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={btnSecondary} onClick={() => setDeleteCourse(null)}>Cancel</button>
              <button style={btnDanger} onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
