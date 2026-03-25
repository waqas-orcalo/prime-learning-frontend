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
interface QuizQuestion { question: string; options: string[]; correctIndex: number; explanation?: string }
interface CourseQuiz { passingScore?: number; questions: QuizQuestion[] }
interface CourseModule { name: string; slides: CourseSlide[]; quiz?: CourseQuiz }
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
  const hasQuiz = course.courseModules?.some(m => m.quiz && m.quiz.questions.length > 0)

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
          {hasQuiz && (
            <span style={{
              ...font(10, 500, '#6C63FF', { lineHeight: '13px', marginTop: '3px', display: 'inline-block' }),
              background: 'rgba(108,99,255,0.08)',
              borderRadius: 99,
              padding: '1px 7px',
            }}>🧩 Includes Quiz</span>
          )}
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

// ── Quiz Screen ────────────────────────────────────────────────────────────
type QuizMode = 'taking' | 'result'

function QuizScreen({
  moduleName,
  quiz,
  courseTitle,
  onPass,
  onClose,
}: {
  moduleName: string
  quiz: CourseQuiz
  courseTitle: string
  onPass: () => void
  onClose: () => void
}) {
  const passingScore = quiz.passingScore ?? 70
  const questions = quiz.questions ?? []
  const [mode, setMode] = useState<QuizMode>('taking')
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)

  const q = questions[currentQ]
  const isLastQ = currentQ === questions.length - 1

  const handleConfirm = () => {
    if (selected === null) return
    setRevealed(true)
  }

  const handleNext = () => {
    const newAnswers = [...answers, selected!]
    if (isLastQ) {
      // Calculate score
      const correct = newAnswers.filter((a, i) => a === questions[i].correctIndex).length
      const pct = Math.round((correct / questions.length) * 100)
      setScore(pct)
      setAnswers(newAnswers)
      setMode('result')
    } else {
      setAnswers(newAnswers)
      setCurrentQ(q => q + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  const handleRetry = () => {
    setMode('taking')
    setCurrentQ(0)
    setSelected(null)
    setAnswers([])
    setRevealed(false)
    setScore(0)
  }

  const passed = score >= passingScore

  // Option colors
  const optionStyle = (idx: number): React.CSSProperties => {
    if (!revealed) {
      return {
        background: selected === idx ? 'rgba(108,99,255,0.10)' : '#fff',
        border: selected === idx ? '2px solid #6C63FF' : '2px solid rgba(28,28,28,0.10)',
        borderRadius: 12,
        padding: '14px 18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.15s ease',
        outline: 'none',
        width: '100%',
      }
    }
    if (idx === q.correctIndex) {
      return {
        background: 'rgba(34,197,94,0.10)',
        border: '2px solid #22c55e',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        cursor: 'default',
      }
    }
    if (idx === selected && selected !== q.correctIndex) {
      return {
        background: 'rgba(239,68,68,0.08)',
        border: '2px solid #ef4444',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        cursor: 'default',
      }
    }
    return {
      background: '#fff',
      border: '2px solid rgba(28,28,28,0.08)',
      borderRadius: 12,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      cursor: 'default',
      opacity: 0.6,
    }
  }

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(13,10,44,0.60)',
        zIndex: 1000, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '680px',
          background: '#fff', borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(13,10,44,0.24)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '92vh', overflow: 'hidden',
        }}
      >
        {/* ── Quiz header ── */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(28,28,28,0.08)',
          background: 'linear-gradient(135deg, #1E1B39 0%, #3B3772 100%)',
          borderRadius: '20px 20px 0 0',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>🧩</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={font(11, 500, 'rgba(255,255,255,0.55)', { margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' })}>
              {moduleName}
            </p>
            <h2 style={font(17, 700, '#fff', { margin: '2px 0 0 0', lineHeight: '22px' })}>
              Module Quiz
            </h2>
          </div>
          {mode === 'taking' && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={font(12, 500, 'rgba(255,255,255,0.65)')}>Question</span>
              <div style={font(20, 700, '#fff', { lineHeight: '24px' })}>
                {currentQ + 1}<span style={{ ...font(14, 400, 'rgba(255,255,255,0.5)') }}>/{questions.length}</span>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* ── Progress strip ── */}
        {mode === 'taking' && (
          <div style={{ height: 4, background: 'rgba(28,28,28,0.07)', flexShrink: 0 }}>
            <div style={{
              height: '100%',
              width: `${((currentQ + (revealed ? 1 : 0)) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #6C63FF, #a78bfa)',
              transition: 'width 0.35s ease',
            }} />
          </div>
        )}

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 24px' }}>

          {/* ── TAKING mode ── */}
          {mode === 'taking' && q && (
            <>
              {/* Passing score chip */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(108,99,255,0.08)', borderRadius: 99,
                padding: '4px 12px', marginBottom: 20,
              }}>
                <span style={{ fontSize: 12 }}>🎯</span>
                <span style={font(12, 500, '#6C63FF')}>Pass mark: {passingScore}%</span>
              </div>

              {/* Question */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(108,99,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={font(13, 700, '#6C63FF')}>{currentQ + 1}</span>
                  </div>
                  <p style={font(16, 600, '#1c1c1c', { margin: 0, lineHeight: '24px', flex: 1 })}>
                    {q.question}
                  </p>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => { if (!revealed) setSelected(oi) }}
                      style={optionStyle(oi)}
                    >
                      {/* Letter badge */}
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: revealed
                          ? oi === q.correctIndex ? '#22c55e' : oi === selected && selected !== q.correctIndex ? '#ef4444' : 'rgba(28,28,28,0.08)'
                          : selected === oi ? '#6C63FF' : 'rgba(28,28,28,0.08)',
                        transition: 'background 0.2s',
                      }}>
                        <span style={font(12, 700, revealed
                          ? oi === q.correctIndex ? '#fff' : oi === selected && selected !== q.correctIndex ? '#fff' : 'rgba(28,28,28,0.5)'
                          : selected === oi ? '#fff' : 'rgba(28,28,28,0.5)')}>
                          {optionLetters[oi]}
                        </span>
                      </div>
                      <span style={font(14, selected === oi || (revealed && oi === q.correctIndex) ? 600 : 400,
                        revealed
                          ? oi === q.correctIndex ? '#15803d' : oi === selected && selected !== q.correctIndex ? '#b91c1c' : 'rgba(28,28,28,0.6)'
                          : selected === oi ? '#1c1c1c' : '#1c1c1c',
                        { flex: 1, textAlign: 'left' })}>
                        {opt}
                      </span>
                      {/* Tick / cross */}
                      {revealed && oi === q.correctIndex && (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                          <circle cx="9" cy="9" r="9" fill="#22c55e"/>
                          <path d="M5 9l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {revealed && oi === selected && selected !== q.correctIndex && (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                          <circle cx="9" cy="9" r="9" fill="#ef4444"/>
                          <path d="M6 6l6 6M12 6l-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              {revealed && q.explanation && (
                <div style={{
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 10, padding: '14px 16px',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                  <p style={font(13, 400, '#166534', { margin: 0, lineHeight: '20px' })}>{q.explanation}</p>
                </div>
              )}

              {/* Correct / wrong flash */}
              {revealed && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10, marginBottom: 4,
                  background: selected === q.correctIndex ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.07)',
                }}>
                  <span style={{ fontSize: 16 }}>{selected === q.correctIndex ? '🎉' : '😕'}</span>
                  <span style={font(13, 600, selected === q.correctIndex ? '#15803d' : '#b91c1c')}>
                    {selected === q.correctIndex ? 'Correct!' : `Incorrect — the right answer is "${q.options[q.correctIndex]}"`}
                  </span>
                </div>
              )}
            </>
          )}

          {/* ── RESULT mode ── */}
          {mode === 'result' && (
            <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
              {/* Big score circle */}
              <div style={{
                width: 130, height: 130, borderRadius: '50%', margin: '0 auto 24px',
                background: passed
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: passed
                  ? '0 12px 40px rgba(34,197,94,0.35)'
                  : '0 12px 40px rgba(239,68,68,0.30)',
              }}>
                <span style={font(36, 800, '#fff', { lineHeight: '40px' })}>{score}%</span>
                <span style={font(11, 500, 'rgba(255,255,255,0.8)', { lineHeight: '16px' })}>Your Score</span>
              </div>

              {/* Pass / fail heading */}
              <h3 style={font(22, 700, passed ? '#15803d' : '#b91c1c', { margin: '0 0 8px 0' })}>
                {passed ? '🎉 Congratulations!' : '😕 Not Quite There'}
              </h3>
              <p style={font(14, 400, 'rgba(28,28,28,0.6)', { margin: '0 0 24px 0', lineHeight: '22px' })}>
                {passed
                  ? `You passed the quiz with ${score}% — well done!`
                  : `You scored ${score}%. You need at least ${passingScore}% to pass.`}
              </p>

              {/* Score breakdown */}
              <div style={{
                display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28,
              }}>
                {[
                  { label: 'Correct', value: answers.filter((a, i) => a === questions[i].correctIndex).length, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
                  { label: 'Wrong', value: answers.filter((a, i) => a !== questions[i].correctIndex).length, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
                  { label: 'Total Qs', value: questions.length, color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
                ].map(item => (
                  <div key={item.label} style={{
                    flex: 1, padding: '14px 10px',
                    background: item.bg, borderRadius: 12,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                    <span style={font(24, 700, item.color, { lineHeight: '28px' })}>{item.value}</span>
                    <span style={font(11, 500, item.color, { opacity: 0.8 })}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Q&A review */}
              <div style={{ textAlign: 'left', borderTop: '1px solid rgba(28,28,28,0.08)', paddingTop: 20 }}>
                <p style={font(13, 600, 'rgba(28,28,28,0.5)', { marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' })}>Answer Review</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {questions.map((qq, i) => {
                    const isCorrect = answers[i] === qq.correctIndex
                    return (
                      <div key={i} style={{
                        borderRadius: 10, padding: '12px 14px',
                        background: isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                        border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                        display: 'flex', gap: 10,
                      }}>
                        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{isCorrect ? '✅' : '❌'}</span>
                        <div>
                          <p style={font(13, 600, '#1c1c1c', { margin: '0 0 4px' })}>{qq.question}</p>
                          <p style={font(12, 400, isCorrect ? '#15803d' : '#b91c1c', { margin: 0 })}>
                            Your answer: <strong>{qq.options[answers[i]] ?? '—'}</strong>
                            {!isCorrect && <span style={{ color: '#15803d' }}> · Correct: <strong>{qq.options[qq.correctIndex]}</strong></span>}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div style={{
          padding: '16px 24px 20px',
          borderTop: '1px solid rgba(28,28,28,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fafafa',
        }}>
          {mode === 'taking' ? (
            <>
              <span style={font(12, 400, 'rgba(28,28,28,0.4)')}>
                {revealed ? (isLastQ ? 'Last question' : `${questions.length - currentQ - 1} more to go`) : 'Select an answer to continue'}
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                {!revealed ? (
                  <button
                    onClick={handleConfirm}
                    disabled={selected === null}
                    style={{
                      ...font(13, 600, selected === null ? 'rgba(255,255,255,0.5)' : '#fff'),
                      padding: '9px 24px', border: 'none', borderRadius: 10, cursor: selected === null ? 'default' : 'pointer',
                      background: selected === null ? 'rgba(28,28,28,0.15)' : 'linear-gradient(135deg, #6C63FF, #8b5cf6)',
                      boxShadow: selected === null ? 'none' : '0 4px 14px rgba(108,99,255,0.35)',
                      transition: 'all 0.2s',
                    }}
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    style={{
                      ...font(13, 600, '#fff'),
                      padding: '9px 24px', border: 'none', borderRadius: 10, cursor: 'pointer',
                      background: isLastQ ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #6C63FF, #8b5cf6)',
                      boxShadow: isLastQ ? '0 4px 14px rgba(34,197,94,0.35)' : '0 4px 14px rgba(108,99,255,0.35)',
                    }}
                  >
                    {isLastQ ? 'See Results' : 'Next Question →'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleRetry}
                style={{
                  ...font(13, 600, '#1c1c1c'),
                  padding: '9px 20px', background: 'rgba(28,28,28,0.07)',
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                }}
              >
                🔄 Retry Quiz
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={onClose}
                  style={{
                    ...font(13, 600, '#1c1c1c'),
                    padding: '9px 20px', background: 'rgba(28,28,28,0.07)',
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                {passed && (
                  <button
                    onClick={onPass}
                    style={{
                      ...font(13, 600, '#fff'),
                      padding: '9px 24px', border: 'none', borderRadius: 10, cursor: 'pointer',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      boxShadow: '0 4px 14px rgba(34,197,94,0.35)',
                    }}
                  >
                    Continue Course →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Slide Viewer Modal ─────────────────────────────────────────────────────
type ViewerMode = 'slides' | 'quiz'

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
  const [viewerMode, setViewerMode] = useState<ViewerMode>('slides')
  const [quizModuleIdx, setQuizModuleIdx] = useState<number>(0)

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

  // Check if we're on the last slide of a module that has a quiz
  const isLastSlideOfModule = (idx: number) => {
    if (idx < 0 || idx >= allSlides.length) return false
    const slide = allSlides[idx]
    const mod = modules[slide.moduleIdx]
    const lastSlideOfMod = mod.slides.length - 1
    return slide.slideIdx === lastSlideOfMod
  }

  const currentModuleHasQuiz = () => {
    if (!currentSlide) return false
    const mod = modules[currentSlide.moduleIdx]
    return !!(mod?.quiz && mod.quiz.questions && mod.quiz.questions.length > 0)
  }

  const handleNextOrQuiz = () => {
    if (currentIdx < totalSlides - 1) {
      const nextSlide = allSlides[currentIdx + 1]
      // Check if we just finished all slides of this module and next is a new module
      if (isLastSlideOfModule(currentIdx) && currentModuleHasQuiz()) {
        setQuizModuleIdx(currentSlide.moduleIdx)
        setViewerMode('quiz')
      } else {
        setCurrentIdx(i => i + 1)
      }
    } else {
      // Last slide overall — check for quiz
      if (currentModuleHasQuiz()) {
        setQuizModuleIdx(currentSlide.moduleIdx)
        setViewerMode('quiz')
      } else {
        onClose()
      }
    }
  }

  const handleFinishOrQuiz = () => {
    if (currentModuleHasQuiz()) {
      setQuizModuleIdx(currentSlide!.moduleIdx)
      setViewerMode('quiz')
    } else {
      onClose()
    }
  }

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

  // ── Quiz mode overlay ──
  if (viewerMode === 'quiz' && modules[quizModuleIdx]?.quiz) {
    return (
      <QuizScreen
        moduleName={modules[quizModuleIdx].name}
        quiz={modules[quizModuleIdx].quiz!}
        courseTitle={course.title}
        onPass={() => {
          setViewerMode('slides')
          // If there are more slides in subsequent modules, advance to first slide of next module
          if (currentIdx < totalSlides - 1) {
            setCurrentIdx(i => i + 1)
          } else {
            onClose()
          }
        }}
        onClose={() => {
          setViewerMode('slides')
        }}
      />
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
          {/* Quiz badge if current module has quiz */}
          {currentModuleHasQuiz() && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(108,99,255,0.08)', borderRadius: 99,
              padding: '4px 10px', flexShrink: 0,
            }}>
              <span style={{ fontSize: 12 }}>🧩</span>
              <span style={font(11, 600, '#6C63FF')}>Quiz after module</span>
            </div>
          )}
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

          {/* Quiz coming up banner — show on last slide of module with quiz */}
          {isLastSlideOfModule(currentIdx) && currentModuleHasQuiz() && (
            <div style={{
              marginTop: 20,
              background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(167,139,250,0.06))',
              border: '1px solid rgba(108,99,255,0.18)',
              borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>🧩</span>
              <div>
                <p style={font(13, 700, '#6C63FF', { margin: '0 0 2px' })}>Quiz time after this slide!</p>
                <p style={font(12, 400, 'rgba(108,99,255,0.75)', { margin: 0 })}>
                  Complete the module quiz before moving on. Pass mark: {modules[currentSlide.moduleIdx]?.quiz?.passingScore ?? 70}%
                </p>
              </div>
            </div>
          )}
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

          {/* Prev / Next / Quiz */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              style={{ ...font(13, 600, currentIdx === 0 ? 'rgba(28,28,28,0.3)' : '#1c1c1c'), padding: '8px 20px', background: 'rgba(28,28,28,0.06)', border: 'none', borderRadius: 8, cursor: currentIdx === 0 ? 'default' : 'pointer' }}
            >
              ← Prev
            </button>
            {currentIdx < totalSlides - 1 ? (
              // More slides ahead
              isLastSlideOfModule(currentIdx) && currentModuleHasQuiz() ? (
                <button
                  onClick={handleNextOrQuiz}
                  style={{ ...font(13, 600, '#fff'), padding: '8px 20px', background: 'linear-gradient(135deg, #6C63FF, #8b5cf6)', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,99,255,0.35)' }}
                >
                  Take Quiz 🧩
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIdx(i => Math.min(totalSlides - 1, i + 1))}
                  style={{ ...font(13, 600, '#fff'), padding: '8px 20px', background: '#1c1c1c', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                >
                  Next →
                </button>
              )
            ) : (
              // Last slide
              currentModuleHasQuiz() ? (
                <button
                  onClick={handleFinishOrQuiz}
                  style={{ ...font(13, 600, '#fff'), padding: '8px 20px', background: 'linear-gradient(135deg, #6C63FF, #8b5cf6)', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 4px 12px rgba(108,99,255,0.35)' }}
                >
                  Take Quiz 🧩
                </button>
              ) : (
                <button
                  onClick={onClose}
                  style={{ ...font(13, 600, '#fff'), padding: '8px 20px', background: '#22c55e', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                >
                  Finish ✓
                </button>
              )
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
            <div className="l-courses-grid" style={{
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
