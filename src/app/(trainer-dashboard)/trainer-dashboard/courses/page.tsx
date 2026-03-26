'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'
import * as XLSX from 'xlsx'

// ── Design System ─────────────────────────────────────────────────────────────
const FF = "'Inter', 'SF Pro Display', -apple-system, sans-serif"
const f = (size: number, weight = 400, color = '#111827', extra: React.CSSProperties = {}): React.CSSProperties =>
  ({ fontFamily: FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: 1.5, ...extra })

// Palette
const NAVY   = '#1E1B39'
const INDIGO = '#6366F1'
const INDIGO_LIGHT = '#EEF2FF'
const PURPLE = '#8B5CF6'
const GREEN  = '#10B981'
const RED    = '#EF4444'
const AMBER  = '#F59E0B'
const TEAL   = '#06B6D4'
const GRAY50 = '#F9FAFB'
const GRAY100= '#F3F4F6'
const GRAY200= '#E5E7EB'
const GRAY400= '#9CA3AF'
const GRAY600= '#4B5563'
const GRAY900= '#111827'
const WHITE  = '#FFFFFF'

// Shadows
const SH_SM  = '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)'
const SH_MD  = '0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)'
const SH_LG  = '0 20px 48px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)'
const SH_INDIGO = '0 4px 14px rgba(99,102,241,0.35)'

// Shared styles
const input: React.CSSProperties = {
  border: `1.5px solid ${GRAY200}`, borderRadius: 10, padding: '10px 14px',
  fontFamily: FF, fontSize: 14, outline: 'none', width: '100%',
  boxSizing: 'border-box', color: GRAY900, background: WHITE,
  transition: 'border-color 0.15s, box-shadow 0.15s',
}
const btnPrimary: React.CSSProperties = {
  background: `linear-gradient(135deg, ${INDIGO} 0%, ${PURPLE} 100%)`,
  color: WHITE, border: 'none', borderRadius: 10, padding: '10px 20px',
  cursor: 'pointer', fontFamily: FF, fontSize: 13, fontWeight: 600,
  display: 'inline-flex', alignItems: 'center', gap: 7,
  boxShadow: SH_INDIGO, transition: 'opacity 0.15s, transform 0.15s',
}
const btnSecondary: React.CSSProperties = {
  background: WHITE, color: GRAY600, border: `1.5px solid ${GRAY200}`,
  borderRadius: 10, padding: '9px 16px', cursor: 'pointer',
  fontFamily: FF, fontSize: 13, fontWeight: 500,
  display: 'inline-flex', alignItems: 'center', gap: 6,
  transition: 'background 0.15s, border-color 0.15s',
}
const btnDanger: React.CSSProperties = {
  background: RED, color: WHITE, border: 'none', borderRadius: 10,
  padding: '9px 18px', cursor: 'pointer', fontFamily: FF, fontSize: 13, fontWeight: 600,
}
const btnGhost: React.CSSProperties = {
  background: 'transparent', color: GRAY600, border: `1.5px solid ${GRAY200}`,
  borderRadius: 8, padding: '5px 11px', cursor: 'pointer',
  fontFamily: FF, fontSize: 12, fontWeight: 500,
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface CourseSlide  { content: string }
interface QuizQuestion { question: string; options: string[]; correctIndex: number; explanation?: string }
interface CourseQuiz   { passingScore: number; questions: QuizQuestion[] }
interface CourseModule { name: string; slides: CourseSlide[]; quiz?: CourseQuiz }
interface Course {
  _id: string; title: string; description?: string; category?: string
  status?: string; thumbnailEmoji?: string; enrolledUsers?: string[]
  createdAt?: string; courseModules?: CourseModule[]
  isOwner?: boolean; trainerHasAccess?: boolean; assignedTrainers?: string[]
}
interface Learner { _id: string; firstName: string; lastName: string; email: string }
interface ParsedExcel {
  courseInfo: { title: string; description: string; category: string; emoji: string; status: string }
  modules: CourseModule[]
}

const emptySlide    = (): CourseSlide   => ({ content: '' })
const emptyQuestion = (): QuizQuestion  => ({ question: '', options: ['','','',''], correctIndex: 0, explanation: '' })
const emptyModule   = (): CourseModule  => ({ name: '', slides: [emptySlide()] })

// ── Gradient chip ─────────────────────────────────────────────────────────────
function Chip({ label, color, bg, dot }: { label: React.ReactNode; color: string; bg: string; dot?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 600, color, background: bg, fontFamily: FF }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
      {label}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, gradient }: { icon: string; label: string; value: number | string; gradient: string }) {
  return (
    <div style={{ background: WHITE, borderRadius: 16, boxShadow: SH_SM, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={f(22, 700, GRAY900)}>{value}</div>
        <div style={f(12, 500, GRAY400)}>{label}</div>
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 0', gap: 14 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${GRAY100}`, borderTopColor: INDIGO, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <div style={f(13, 500, GRAY400)}>Loading courses…</div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children, width = 680 }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; width?: number
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: WHITE, borderRadius: 24, boxShadow: SH_LG, width: '100%', maxWidth: width, maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Modal header */}
        <div style={{ padding: '24px 28px 0', position: 'sticky', top: 0, background: WHITE, zIndex: 1, borderRadius: '24px 24px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={f(19, 700, GRAY900)}>{title}</div>
              {subtitle && <div style={f(13, 400, GRAY400, { marginTop: 3 })}>{subtitle}</div>}
            </div>
            <button onClick={onClose} style={{ background: GRAY100, border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: GRAY400, fontSize: 16, flexShrink: 0, marginLeft: 12 }}>✕</button>
          </div>
        </div>
        {/* Modal body */}
        <div style={{ padding: '20px 28px 28px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={f(13, 600, GRAY600)}>{label}</label>
      {hint && <span style={f(11, 400, GRAY400)}>{hint}</span>}
      {children}
    </div>
  )
}

// ── Step indicator ────────────────────────────────────────────────────────────
function Stepper({ step }: { step: number }) {
  const steps = [
    { label: 'Course Info', icon: '📋' },
    { label: 'Modules & Content', icon: '📦' },
    { label: 'Review & Save', icon: '✅' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, padding: '16px 20px', background: GRAY50, borderRadius: 14 }}>
      {steps.map(({ label, icon }, i) => {
        const active = i + 1 === step
        const done   = i + 1 < step
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: done ? `linear-gradient(135deg,${GREEN},#059669)` : active ? `linear-gradient(135deg,${INDIGO},${PURPLE})` : WHITE,
                border: `2px solid ${done ? GREEN : active ? INDIGO : GRAY200}`,
                boxShadow: active ? SH_INDIGO : 'none',
                fontSize: done ? 13 : 13,
                color: done || active ? WHITE : GRAY400,
                fontWeight: 700,
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : active ? icon : i + 1}
              </div>
              <div>
                <div style={f(12, done || active ? 600 : 400, done ? GREEN : active ? INDIGO : GRAY400)}>{label}</div>
                {active && <div style={f(10, 400, GRAY400)}>Current step</div>}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, marginLeft: 14, marginRight: 14, background: done ? `linear-gradient(90deg,${GREEN},${GREEN})` : GRAY200, borderRadius: 2, transition: 'background 0.3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Excel helpers ─────────────────────────────────────────────────────────────
function downloadSampleTemplate() {
  const wb = XLSX.utils.book_new()
  const info = XLSX.utils.aoa_to_sheet([
    ['Field', 'Value', 'Notes'],
    ['Course Title',  'Workplace Safety Fundamentals', 'Required'],
    ['Description',   'Learn essential safety procedures and emergency response protocols.', 'Optional'],
    ['Category',      'Health & Safety', 'Optional'],
    ['Emoji',         '🛡️', 'Any single emoji'],
    ['Status',        'PUBLISHED', 'PUBLISHED or DRAFT'],
  ])
  info['!cols'] = [{ wch: 18 }, { wch: 52 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, info, 'Course Info')

  const data = XLSX.utils.aoa_to_sheet([
    ['Module Name','Slide Content (optional)','Question','Option A','Option B','Option C','Option D','Correct (A/B/C/D)','Explanation','Pass %'],
    ['Intro to Safety','Safety means being protected from harm. Always assess before acting.','First step in an emergency?','Call 911','Assess situation','Evacuate','Sound alarm','B','Always assess first to avoid escalating.', 70],
    ['Intro to Safety','','PPE stands for?','Personal Protective Equipment','Planned Protection Exercise','Primary Protective Element','Personnel Enforcement','A','',70],
    ['Intro to Safety','','Fire extinguisher color?','Blue','Yellow','Red','Green','C','Fire extinguishers are universally red.',70],
    ['Communication Skills','Clear communication reduces errors and builds team trust.','Active listening involves?','Talking more','Focusing on speaker','Planning your reply','Checking phone','B','Give full attention to the speaker.',75],
    ['Communication Skills','','Key element of clear communication?','Using jargon','Being concise','Speaking fast','Avoiding eye contact','B','',75],
  ])
  data['!cols'] = [{ wch: 24 },{ wch: 44 },{ wch: 36 },{ wch: 22 },{ wch: 22 },{ wch: 22 },{ wch: 22 },{ wch: 16 },{ wch: 34 },{ wch: 8 }]
  XLSX.utils.book_append_sheet(wb, data, 'Modules & Quizzes')
  XLSX.writeFile(wb, 'course_bulk_import_template.xlsx')
}

async function parseFullExcel(file: File): Promise<ParsedExcel> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = e => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target!.result as ArrayBuffer), { type: 'array' })
        const courseInfo = { title: '', description: '', category: '', emoji: '📚', status: 'PUBLISHED' }
        const infoName = wb.SheetNames.find(n => n.toLowerCase().includes('info'))
        if (infoName) {
          const rows = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[infoName], { header: 1, defval: '' }) as string[][]
          for (const r of rows) {
            const k = String(r[0]||'').toLowerCase().trim(), v = String(r[1]||'').trim()
            if (!v) continue
            if (k.includes('title'))  courseInfo.title       = v
            if (k.includes('desc'))   courseInfo.description = v
            if (k.includes('categ'))  courseInfo.category    = v
            if (k.includes('emoji') || k.includes('icon')) courseInfo.emoji = v
            if (k.includes('status')) courseInfo.status = v.toUpperCase() === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'
          }
        }
        const dataName = wb.SheetNames.find(n => !n.toLowerCase().includes('info')) ?? wb.SheetNames[0]
        const raw = XLSX.utils.sheet_to_json<string[]>(wb.Sheets[dataName], { header: 1, defval: '' }) as string[][]
        const moduleMap = new Map<string, CourseModule>()
        const order: string[] = []
        for (let i = 1; i < raw.length; i++) {
          const r = raw[i]; if (!r || r.every(c => !c)) continue
          const mName = String(r[0]||'').trim(); if (!mName) continue
          const slide = String(r[1]||'').trim(), q = String(r[2]||'').trim()
          if (!moduleMap.has(mName)) { moduleMap.set(mName, { name: mName, slides: [], quiz: { passingScore: r[9] ? Number(r[9]) : 70, questions: [] } }); order.push(mName) }
          const mod = moduleMap.get(mName)!
          if (slide && !mod.slides.some(s => s.content === slide)) mod.slides.push({ content: slide })
          if (r[9]) mod.quiz!.passingScore = Number(r[9])
          if (q) {
            const ansMap: Record<string,number> = { A:0,B:1,C:2,D:3 }
            mod.quiz!.questions.push({ question: q, options: [String(r[3]||''),String(r[4]||''),String(r[5]||''),String(r[6]||'')], correctIndex: ansMap[String(r[7]||'').trim().toUpperCase()]??0, explanation: String(r[8]||'') })
          }
        }
        for (const mod of moduleMap.values()) if (mod.slides.length === 0) mod.slides.push(emptySlide())
        resolve({ courseInfo, modules: order.map(n => moduleMap.get(n)!) })
      } catch(err) { reject(err) }
    }
    reader.readAsArrayBuffer(file)
  })
}

// ── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({ onParsed }: { onParsed: (r: ParsedExcel) => void }) {
  const [drag, setDrag]     = useState(false)
  const [st, setSt]         = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [sum, setSum]       = useState<{modules:number;questions:number;hasCourseInfo:boolean}|null>(null)
  const [err, setErr]       = useState('')
  const ref = useRef<HTMLInputElement>(null)

  const go = async (file: File) => {
    if (!file.name.match(/\.xlsx?$/i)) { setErr('Please upload a .xlsx file'); setSt('error'); return }
    setSt('loading'); setErr('')
    try {
      const r = await parseFullExcel(file)
      setSum({ modules: r.modules.length, questions: r.modules.reduce((s,m) => s+(m.quiz?.questions.length??0),0), hasCourseInfo: !!r.courseInfo.title })
      setSt('done'); onParsed(r)
    } catch { setErr('Could not read file — please use the template format.'); setSt('error') }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#06B6D4,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📤</div>
          <div>
            <div style={f(14, 700, GRAY900)}>Bulk Upload from Excel</div>
            <div style={f(11, 400, GRAY400)}>Auto-fills course info, modules, slides & quizzes</div>
          </div>
          <span style={{ ...f(10, 700, AMBER), background: 'rgba(245,158,11,0.12)', borderRadius: 99, padding: '3px 9px', border: '1px solid rgba(245,158,11,0.25)' }}>⚡ Recommended</span>
        </div>
        <button onClick={downloadSampleTemplate} style={{ ...btnSecondary, borderColor: TEAL, color: TEAL, fontSize: 12, padding: '7px 13px' }}>
          <span>⬇</span> Download Template
        </button>
      </div>

      {/* Format cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {/* Sheet 1 */}
        <div style={{ background: GRAY50, borderRadius: 12, padding: 12, border: `1px solid ${GRAY200}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={f(11, 700, GRAY600)}>Sheet 1 — "Course Info"</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: FF }}>
            <tbody>
              {[['Course Title','My Course'],['Description','…'],['Category','IT'],['Emoji','📚'],['Status','PUBLISHED']].map(([k,v],i) => (
                <tr key={i}>
                  <td style={{ padding: '3px 8px', fontWeight: 600, color: GRAY600, borderBottom: `1px solid ${GRAY200}`, background: i%2===0?GRAY50:WHITE }}>{k}</td>
                  <td style={{ padding: '3px 8px', color: GRAY400, borderBottom: `1px solid ${GRAY200}`, background: i%2===0?GRAY50:WHITE }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Sheet 2 */}
        <div style={{ background: GRAY50, borderRadius: 12, padding: 12, border: `1px solid ${GRAY200}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>🗂️</span>
            <span style={f(11, 700, GRAY600)}>Sheet 2 — "Modules & Quizzes"</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 10, fontFamily: FF, whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: `linear-gradient(90deg,${INDIGO},${PURPLE})` }}>
                  {['Module','Slide','Question','A','B','C','D','✓','Expl','%'].map(h => (
                    <th key={h} style={{ padding: '4px 7px', color: WHITE, fontWeight: 600, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 7px', color: INDIGO, fontWeight: 600, background: GRAY50 }}>Safety</td>
                  <td style={{ padding: '3px 7px', color: GRAY400 }}>PPE is…</td>
                  <td style={{ padding: '3px 7px', color: GRAY600 }}>First step?</td>
                  <td style={{ padding: '3px 7px', color: GRAY400 }}>Call 911</td>
                  <td style={{ padding: '3px 7px', color: GRAY400 }}>Assess</td>
                  <td style={{ padding: '3px 7px', color: GRAY400 }}>Run</td>
                  <td style={{ padding: '3px 7px', color: GRAY400 }}>Alarm</td>
                  <td style={{ padding: '3px 7px', color: GREEN, fontWeight: 700 }}>B</td>
                  <td style={{ padding: '3px 7px', color: GRAY400 }}>…</td>
                  <td style={{ padding: '3px 7px', color: GRAY400 }}>70</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={f(10, 400, GRAY400, { marginTop: 6 })}>Same module name = grouped. Each row = one question.</div>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f=e.dataTransfer.files[0]; if(f) go(f) }}
        onClick={() => st!=='loading' && ref.current?.click()}
        style={{
          border: `2px dashed ${drag ? INDIGO : st==='done' ? GREEN : st==='error' ? RED : GRAY200}`,
          borderRadius: 16, padding: '28px 24px', textAlign: 'center', cursor: 'pointer',
          background: drag ? INDIGO_LIGHT : st==='done' ? 'rgba(16,185,129,0.05)' : st==='error' ? 'rgba(239,68,68,0.04)' : GRAY50,
          transition: 'all 0.2s',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Decorative blob */}
        {st === 'idle' && <div style={{ position:'absolute',width:160,height:160,borderRadius:'50%',background:'rgba(99,102,241,0.05)',top:-40,right:-40,pointerEvents:'none' }} />}
        <input ref={ref} type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={e => { const f=e.target.files?.[0]; if(f) go(f); e.target.value='' }} />

        {st==='loading' && <div><div style={{ fontSize:32,marginBottom:10 }}>⏳</div><div style={f(14,600,GRAY600)}>Parsing your spreadsheet…</div></div>}
        {st==='done' && sum && (
          <div>
            <div style={{ width:52,height:52,borderRadius:'50%',background:'linear-gradient(135deg,#10B981,#059669)',margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,boxShadow:'0 4px 12px rgba(16,185,129,0.4)' }}>✓</div>
            <div style={f(15,700,'#059669')}>Imported successfully!</div>
            <div style={{ display:'flex',justifyContent:'center',gap:8,marginTop:10,flexWrap:'wrap' }}>
              {sum.hasCourseInfo && <Chip label="Course info filled" color={TEAL} bg="rgba(6,182,212,0.1)" />}
              <Chip label={`${sum.modules} modules`} color={INDIGO} bg={INDIGO_LIGHT} />
              <Chip label={`${sum.questions} questions`} color={PURPLE} bg="rgba(139,92,246,0.1)" />
            </div>
            <div style={f(11,400,GRAY400,{marginTop:10})}>Click to upload a different file</div>
          </div>
        )}
        {st==='error' && <div><div style={{ fontSize:32,marginBottom:10 }}>❌</div><div style={f(13,600,RED)}>{err}</div><div style={f(11,400,GRAY400,{marginTop:6})}>Click to try again</div></div>}
        {st==='idle' && (
          <div>
            <div style={{ fontSize:40,marginBottom:10 }}>📂</div>
            <div style={f(15,600,GRAY900)}>Drop your .xlsx file here</div>
            <div style={f(13,400,GRAY400,{marginTop:4})}>or click to browse your computer</div>
            <div style={{ marginTop:14,display:'inline-flex',alignItems:'center',gap:6,background:INDIGO_LIGHT,borderRadius:99,padding:'5px 14px' }}>
              <span style={f(11,600,INDIGO)}>Fills in everything automatically — title, modules, slides & quiz questions</span>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ display:'flex',alignItems:'center',gap:12,marginTop:20,marginBottom:8 }}>
        <div style={{ flex:1,height:1,background:GRAY200 }} />
        <span style={f(11,500,GRAY400)}>or build manually below</span>
        <div style={{ flex:1,height:1,background:GRAY200 }} />
      </div>
    </div>
  )
}

// ── Module Card ───────────────────────────────────────────────────────────────
function ModuleCard({ mod, mi, total, onChange, onRemove }: {
  mod: CourseModule; mi: number; total: number
  onChange: (u: CourseModule) => void; onRemove: () => void
}) {
  const [open, setOpen] = useState(true)
  const slidesFilled = mod.slides.filter(s=>s.content.trim()).length
  const qCount       = mod.quiz?.questions.length ?? 0

  const updQ = (qi:number, u:Partial<QuizQuestion>) => onChange({ ...mod, quiz: { ...mod.quiz!, questions: mod.quiz!.questions.map((q,j)=>j===qi?{...q,...u}:q) } })

  // Accent color per module index
  const accent = [INDIGO, PURPLE, TEAL, AMBER, GREEN][mi % 5]

  return (
    <div style={{ marginBottom: 14, borderRadius: 16, overflow: 'hidden', boxShadow: SH_SM, border: open ? `1.5px solid ${accent}22` : `1.5px solid ${GRAY200}`, transition: 'border-color 0.2s' }}>
      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:12,padding:'14px 18px',background: open ? `linear-gradient(135deg,${accent}0F,${accent}05)` : WHITE, cursor:'pointer' }}
        onClick={()=>setOpen(o=>!o)}>
        <div style={{ width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${accent},${accent}BB)`,color:WHITE,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0,boxShadow:`0 2px 8px ${accent}44` }}>
          M{mi+1}
        </div>
        <div style={{ flex:1,minWidth:0 }} onClick={e=>e.stopPropagation()}>
          <input
            style={{ border:'none',background:'transparent',padding:0,fontSize:14,fontWeight:600,color:GRAY900,outline:'none',fontFamily:FF,width:'100%' }}
            placeholder="Module name (e.g. Introduction to Safety)"
            value={mod.name} onChange={e=>onChange({...mod,name:e.target.value})}
          />
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:6,flexShrink:0 }}>
          {slidesFilled>0 && <Chip label={`📄 ${slidesFilled}`} color={GRAY600} bg={GRAY100} />}
          {qCount>0 && <Chip label={`🧩 ${qCount}`} color={PURPLE} bg="rgba(139,92,246,0.1)" />}
          <div style={{ width:24,height:24,borderRadius:6,background:GRAY100,display:'flex',alignItems:'center',justifyContent:'center',color:GRAY400,fontSize:11 }}>{open?'▲':'▼'}</div>
          {total>1 && <button onClick={e=>{e.stopPropagation();onRemove()}} style={{ background:'rgba(239,68,68,0.08)',border:'none',cursor:'pointer',width:24,height:24,borderRadius:6,color:RED,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>}
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding:'4px 18px 18px',background:WHITE }}>
          {/* Slides */}
          <div style={{ marginTop:14 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ fontSize:14 }}>📄</span>
                <span style={f(13,700,GRAY900)}>Slides</span>
                <span style={{ ...f(11,600,accent),background:`${accent}15`,borderRadius:99,padding:'2px 8px' }}>{mod.slides.length}</span>
              </div>
              <button style={{ ...btnGhost,color:accent,borderColor:`${accent}44` }} onClick={()=>onChange({...mod,slides:[...mod.slides,emptySlide()]})}>+ Add Slide</button>
            </div>
            {mod.slides.map((sl,si)=>(
              <div key={si} style={{ display:'flex',gap:10,marginBottom:8,alignItems:'flex-start' }}>
                <div style={{ width:24,height:24,borderRadius:7,background:`${accent}15`,color:accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,marginTop:10 }}>S{si+1}</div>
                <textarea style={{ ...input,minHeight:72,resize:'vertical',flex:1,fontSize:13 }}
                  placeholder={`Slide ${si+1} content — text, bullet points, key concepts…`}
                  value={sl.content} onChange={e=>onChange({...mod,slides:mod.slides.map((s,j)=>j===si?{content:e.target.value}:s)})} />
                {mod.slides.length>1 && <button onClick={()=>onChange({...mod,slides:mod.slides.filter((_,j)=>j!==si)})} style={{ background:'transparent',border:'none',cursor:'pointer',color:RED,fontSize:18,marginTop:8,flexShrink:0 }}>×</button>}
              </div>
            ))}
          </div>

          {/* Quiz */}
          <div style={{ borderTop:`1.5px solid ${GRAY100}`,marginTop:16,paddingTop:16 }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ fontSize:14 }}>🧩</span>
                <span style={f(13,700,GRAY900)}>Quiz</span>
                {mod.quiz && <span style={{ ...f(11,600,PURPLE),background:'rgba(139,92,246,0.1)',borderRadius:99,padding:'2px 8px' }}>{mod.quiz.questions.length} questions</span>}
              </div>
              {mod.quiz
                ? <button style={{ ...btnGhost,color:RED,borderColor:'rgba(239,68,68,0.3)' }} onClick={()=>onChange({...mod,quiz:undefined})}>Remove Quiz</button>
                : <button style={{ ...btnGhost,color:PURPLE,borderColor:'rgba(139,92,246,0.3)' }} onClick={()=>onChange({...mod,quiz:{passingScore:70,questions:[emptyQuestion()]}})}>+ Add Quiz</button>}
            </div>

            {mod.quiz && (
              <div style={{ background:GRAY50,borderRadius:12,padding:14,border:`1px solid ${GRAY200}` }}>
                {/* Passing score */}
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16,padding:'10px 14px',background:WHITE,borderRadius:10,border:`1px solid ${GRAY200}` }}>
                  <span style={f(13,500,GRAY600)}>Passing score</span>
                  <input type="number" min={0} max={100} style={{ ...input,width:68,textAlign:'center',padding:'7px 10px' }}
                    value={mod.quiz.passingScore} onChange={e=>onChange({...mod,quiz:{...mod.quiz!,passingScore:Number(e.target.value)}})} />
                  <span style={f(13,400,GRAY400)}>%</span>
                  <span style={{ ...f(11,500,GRAY400),marginLeft:'auto' }}>Recommended: 70%</span>
                </div>

                {mod.quiz.questions.map((q,qi)=>(
                  <div key={qi} style={{ background:WHITE,borderRadius:12,padding:14,marginBottom:10,border:`1px solid ${GRAY200}`,boxShadow:SH_SM }}>
                    <div style={{ display:'flex',gap:10,marginBottom:12 }}>
                      <div style={{ width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${PURPLE},${INDIGO})`,color:WHITE,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0 }}>Q{qi+1}</div>
                      <input style={{ ...input,flex:1,fontWeight:500 }} placeholder="Type your question here…"
                        value={q.question} onChange={e=>updQ(qi,{question:e.target.value})} />
                      <button onClick={()=>onChange({...mod,quiz:{...mod.quiz!,questions:mod.quiz!.questions.filter((_,j)=>j!==qi)}})}
                        style={{ background:'rgba(239,68,68,0.08)',border:'none',cursor:'pointer',width:30,height:30,borderRadius:8,color:RED,fontSize:16,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
                    </div>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10 }}>
                      {q.options.map((opt,oi)=>(
                        <label key={oi} style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:10,border:`1.5px solid ${q.correctIndex===oi?GREEN:GRAY200}`,background:q.correctIndex===oi?'rgba(16,185,129,0.06)':WHITE,cursor:'pointer',transition:'all 0.15s' }}>
                          <input type="radio" name={`q-${mi}-${qi}`} checked={q.correctIndex===oi} onChange={()=>updQ(qi,{correctIndex:oi})} style={{ accentColor:GREEN,flexShrink:0 }} />
                          <span style={{ ...f(10,700,q.correctIndex===oi?GREEN:GRAY400),minWidth:14 }}>{String.fromCharCode(65+oi)}</span>
                          <input style={{ border:'none',background:'transparent',outline:'none',fontFamily:FF,fontSize:13,flex:1,minWidth:0,color:GRAY900 }}
                            placeholder={`Option ${String.fromCharCode(65+oi)}`}
                            value={opt} onChange={e=>updQ(qi,{options:q.options.map((o,k)=>k===oi?e.target.value:o)})} />
                          {q.correctIndex===oi && <span style={{ fontSize:13,color:GREEN,flexShrink:0 }}>✓</span>}
                        </label>
                      ))}
                    </div>
                    <input style={{ ...input,fontSize:12,background:GRAY50,color:GRAY400 }}
                      placeholder="💬 Explanation (optional) — shown to learner after answering"
                      value={q.explanation??''} onChange={e=>updQ(qi,{explanation:e.target.value})} />
                  </div>
                ))}

                <button style={{ ...btnSecondary,fontSize:12,padding:'7px 14px',borderRadius:8,color:PURPLE,borderColor:'rgba(139,92,246,0.3)',marginTop:4 }}
                  onClick={()=>onChange({...mod,quiz:{...mod.quiz!,questions:[...mod.quiz!.questions,emptyQuestion()]}})}>
                  + Add Question
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Course Row ────────────────────────────────────────────────────────────────
function CourseRow({ course, myLearners, onEdit, onEnroll, onDelete, isLast }: {
  course: Course; myLearners: number; onEdit:()=>void; onEnroll:()=>void; onDelete:()=>void; isLast:boolean
}) {
  const [hover, setHover] = useState(false)
  const quizCount = course.courseModules?.filter(m=>m.quiz && m.quiz.questions.length>0).length ?? 0
  return (
    <tr onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{ borderBottom: isLast ? 'none' : `1px solid ${GRAY100}`, background: hover ? GRAY50 : WHITE, transition: 'background 0.15s' }}>
      <td style={{ padding:'16px 20px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:14 }}>
          <div style={{ width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${INDIGO_LIGHT},rgba(139,92,246,0.1))`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,border:`1px solid ${GRAY200}` }}>
            {course.thumbnailEmoji||'📚'}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={f(14,600,GRAY900)}>{course.title}</div>
            {course.description && <div style={f(12,400,GRAY400,{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:2})}>{course.description}</div>}
            {course.category && <Chip label={course.category} color={INDIGO} bg={INDIGO_LIGHT} />}
          </div>
        </div>
      </td>
      <td style={{ padding:'16px 12px' }}>
        <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
          <span style={f(13,600,GRAY900)}>{course.courseModules?.length??0} modules</span>
          {quizCount>0 && <Chip label={`🧩 ${quizCount} quiz${quizCount>1?'zes':''}`} color={PURPLE} bg="rgba(139,92,246,0.1)" />}
        </div>
      </td>
      <td style={{ padding:'16px 12px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:6 }}>
          <div style={{ width:28,height:28,borderRadius:8,background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>👥</div>
          <span style={f(14,600,GRAY900)}>{course.enrolledUsers?.length??0}</span>
        </div>
      </td>
      <td style={{ padding:'16px 12px' }}>
        {course.status==='PUBLISHED'
          ? <Chip label="Published" color="#059669" bg="rgba(16,185,129,0.1)" dot="#10B981" />
          : <Chip label={course.status??'Draft'} color={GRAY400} bg={GRAY100} dot={GRAY400} />}
      </td>
      <td style={{ padding:'16px 12px' }}>
        {course.isOwner!==false
          ? <Chip label="Created by me" color="#1d4ed8" bg="rgba(59,130,246,0.08)" />
          : <Chip label="Admin access" color={PURPLE} bg="rgba(139,92,246,0.08)" />}
      </td>
      <td style={{ padding:'16px 20px' }}>
        <div style={{ display:'flex',gap:6 }}>
          {course.isOwner!==false && (
            <button onClick={onEdit} style={{ ...btnGhost,color:INDIGO,borderColor:`${INDIGO}33` }}>✏️ Edit</button>
          )}
          <button onClick={onEnroll} style={{ ...btnGhost,color:PURPLE,borderColor:'rgba(139,92,246,0.3)' }}>
            👥 Enroll
          </button>
          {course.isOwner!==false && (
            <button onClick={onDelete} style={{ ...btnGhost,color:RED,borderColor:'rgba(239,68,68,0.3)' }}>🗑️</button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TrainerCoursesPage() {
  const { data: session } = useSession()
  const token = (session as any)?.user?.accessToken

  const [courses, setCourses]     = useState<Course[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [error, setError]         = useState('')
  const [myLearners, setMyLearners] = useState<Learner[]>([])

  // Editor
  const [showEditor, setShowEditor]       = useState(false)
  const [editorStep, setEditorStep]       = useState(1)
  const [editCourse, setEditCourse]       = useState<Course|null>(null)
  const [saving, setSaving]               = useState(false)
  const [courseForm, setCourseForm]       = useState({ title:'',description:'',category:'',thumbnailEmoji:'📚',status:'PUBLISHED' })
  const [courseModules, setCourseModules] = useState<CourseModule[]>([emptyModule()])

  // Enroll
  const [enrollCourse, setEnrollCourse] = useState<Course|null>(null)
  const [enrollSearch, setEnrollSearch] = useState('')
  const [selectedIds, setSelectedIds]   = useState<string[]>([])
  const [enrolling, setEnrolling]       = useState(false)

  // Delete
  const [deleteCourse, setDeleteCourse] = useState<Course|null>(null)
  const [deleting, setDeleting]         = useState(false)

  const loadCourses = useCallback(async () => {
    if (!token) return; setLoading(true)
    try { const res=await apiFetch<any>('/courses?limit=100',token); setCourses((res?.data?.items??res?.data??[]) as Course[]) }
    catch { setError('Failed to load courses') } finally { setLoading(false) }
  }, [token])

  const loadLearners = useCallback(async () => {
    if (!token) return
    try { const res=await apiFetch<any>('/users/trainer/my-learners',token); setMyLearners(Array.isArray(res?.data)?res.data:[]) }
    catch { setMyLearners([]) }
  }, [token])

  useEffect(()=>{ loadCourses(); loadLearners() },[loadCourses,loadLearners])

  const openCreate = () => {
    setEditCourse(null); setCourseForm({title:'',description:'',category:'',thumbnailEmoji:'📚',status:'PUBLISHED'})
    setCourseModules([emptyModule()]); setEditorStep(1); setShowEditor(true)
  }
  const openEdit = (c: Course) => {
    setEditCourse(c)
    setCourseForm({title:c.title,description:c.description??'',category:c.category??'',thumbnailEmoji:c.thumbnailEmoji??'📚',status:c.status??'PUBLISHED'})
    setCourseModules(c.courseModules&&c.courseModules.length>0
      ? c.courseModules.map(m=>({name:m.name,slides:m.slides.length>0?m.slides.map(s=>({content:s.content})):[emptySlide()],quiz:m.quiz?{passingScore:m.quiz.passingScore??70,questions:m.quiz.questions.map(q=>({...q,options:[...q.options],explanation:q.explanation??''}))}:undefined}))
      : [emptyModule()])
    setEditorStep(1); setShowEditor(true)
  }
  const handleBulkParsed = (r: ParsedExcel) => {
    if (r.courseInfo.title) setCourseForm(p=>({title:r.courseInfo.title||p.title,description:r.courseInfo.description||p.description,category:r.courseInfo.category||p.category,thumbnailEmoji:r.courseInfo.emoji||p.thumbnailEmoji,status:r.courseInfo.status||p.status}))
    if (r.modules.length>0) setCourseModules(r.modules)
  }
  const handleSave = async () => {
    if (!courseForm.title.trim()) { setError('Course title is required'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...courseForm, courseModules: courseModules.map(m=>({ name:m.name, slides:m.slides.filter(s=>s.content.trim()), quiz:m.quiz?{passingScore:m.quiz.passingScore,questions:m.quiz.questions.filter(q=>q.question.trim())}:undefined })) }
      if (editCourse) await apiFetch<any>(`/courses/${editCourse._id}`,token,{method:'PATCH',body:JSON.stringify(payload)})
      else            await apiFetch<any>('/courses',token,{method:'POST',body:JSON.stringify(payload)})
      setShowEditor(false); setEditCourse(null); loadCourses()
    } catch(e:any) { setError(e?.message??'Save failed') } finally { setSaving(false) }
  }
  const handleDelete = async () => {
    if (!deleteCourse) return; setDeleting(true)
    try { await apiFetch<any>(`/courses/${deleteCourse._id}`,token,{method:'DELETE'}); setDeleteCourse(null); loadCourses() }
    catch { setError('Delete failed') } finally { setDeleting(false) }
  }
  const openEnroll = (c: Course) => { setEnrollCourse(c); setSelectedIds(c.enrolledUsers??[]); setEnrollSearch('') }
  const handleEnroll = async () => {
    if (!enrollCourse||selectedIds.length===0) return; setEnrolling(true)
    try { await apiFetch<any>(`/courses/${enrollCourse._id}/enroll`,token,{method:'POST',body:JSON.stringify({userIds:selectedIds})}); setEnrollCourse(null); loadCourses() }
    catch { setError('Enrollment failed') } finally { setEnrolling(false) }
  }

  const displayed = courses.filter(c=>!search||c.title.toLowerCase().includes(search.toLowerCase()))
  const filtered  = myLearners.filter(l=>!enrollSearch||`${l.firstName} ${l.lastName} ${l.email}`.toLowerCase().includes(enrollSearch.toLowerCase()))
  const stepOk    = editorStep===1 ? !!courseForm.title.trim() : true
  const EMOJIS    = ['📚','💻','🎯','🧠','💼','🧪','🔬','🎨','📊','🚀','🌍','🏋️','🔐','⚡','🗂️','🎓','🛡️','🔧','🌐','🧩']

  // Stats
  const totalEnrolled = courses.reduce((s,c)=>s+(c.enrolledUsers?.length??0),0)
  const totalQuizzes  = courses.reduce((s,c)=>s+(c.courseModules?.filter(m=>m.quiz&&m.quiz.questions.length>0).length??0),0)

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#F0F4FF 0%,#F9FAFB 40%,#F5F0FF 100%)', padding:'32px 36px 64px' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        input:focus,textarea:focus,select:focus{border-color:${INDIGO}!important;box-shadow:0 0 0 3px rgba(99,102,241,0.12)!important;outline:none}
        .course-btn-primary:hover{opacity:0.9;transform:translateY(-1px)}
        .course-btn-secondary:hover{background:${GRAY50}!important;border-color:${GRAY400}!important}
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,animation:'fadeIn 0.4s ease' }}>
        <div>
          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:6 }}>
            <div style={{ width:42,height:42,borderRadius:14,background:'linear-gradient(135deg,#6366F1,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:SH_INDIGO }}>🎓</div>
            <div>
              <h1 style={f(24,800,GRAY900,{margin:0,letterSpacing:'-0.3px'})}>Course Management</h1>
              <p style={f(13,400,GRAY400,{margin:0})}>Create courses, manage modules, and enroll learners</p>
            </div>
          </div>
        </div>
        <button className="course-btn-primary" style={btnPrimary} onClick={openCreate}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v11M2 7.5h11" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
          New Course
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24,animation:'fadeIn 0.5s ease' }}>
        <StatCard icon="📚" label="Total Courses"    value={courses.length}   gradient="linear-gradient(135deg,#EEF2FF,#C7D2FE)" />
        <StatCard icon="✅" label="Published"        value={courses.filter(c=>c.status==='PUBLISHED').length} gradient="linear-gradient(135deg,#ECFDF5,#A7F3D0)" />
        <StatCard icon="👥" label="Total Enrolled"   value={totalEnrolled}    gradient="linear-gradient(135deg,#EFF6FF,#BFDBFE)" />
        <StatCard icon="🧩" label="Quizzes Created"  value={totalQuizzes}     gradient="linear-gradient(135deg,#F5F3FF,#DDD6FE)" />
      </div>

      {/* ── Learner banner ── */}
      {myLearners.length === 0 && (
        <div style={{ marginBottom:20,padding:'12px 18px',background:'rgba(245,158,11,0.08)',border:'1.5px solid rgba(245,158,11,0.25)',borderRadius:12,display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:32,height:32,borderRadius:10,background:'rgba(245,158,11,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>⚠️</div>
          <span style={f(13,500,'#92400e')}>No learners assigned to you yet — ask your admin to assign learners to your account.</span>
        </div>
      )}

      {error && <div style={{ background:'rgba(239,68,68,0.07)',border:`1.5px solid rgba(239,68,68,0.25)`,borderRadius:12,padding:'11px 16px',marginBottom:16,...f(13,500,RED) }}>⚠ {error}</div>}

      {/* ── Courses Table Card ── */}
      <div style={{ background:WHITE,borderRadius:20,boxShadow:SH_MD,overflow:'hidden',animation:'fadeIn 0.6s ease' }}>
        {/* Table toolbar */}
        <div style={{ padding:'18px 20px',borderBottom:`1px solid ${GRAY100}`,display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ flex:1,maxWidth:320,display:'flex',alignItems:'center',gap:10,background:GRAY50,border:`1.5px solid ${GRAY200}`,borderRadius:12,padding:'9px 14px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={GRAY400} strokeWidth="1.5"/><path d="M9.5 9.5 12 12" stroke={GRAY400} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input type="text" placeholder="Search courses…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ border:'none',background:'transparent',outline:'none',fontFamily:FF,fontSize:13,color:GRAY900,flex:1 }} />
          </div>
          <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:8 }}>
            <span style={{ ...f(12,500,GRAY400),background:GRAY100,borderRadius:99,padding:'4px 10px' }}>{displayed.length} course{displayed.length!==1?'s':''}</span>
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:GRAY50,borderBottom:`1px solid ${GRAY200}` }}>
                  {['Course','Modules','Enrolled','Status','Access','Actions'].map(h=>(
                    <th key={h} style={{ padding:'10px 20px',textAlign:'left',...f(11,700,GRAY400),textTransform:'uppercase',letterSpacing:'0.6px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length===0 && (
                  <tr><td colSpan={6}>
                    <div style={{ padding:'72px 20px',textAlign:'center' }}>
                      <div style={{ width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,#EEF2FF,#F5F3FF)',margin:'0 auto 18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:34 }}>📚</div>
                      <div style={f(17,700,GRAY900,{marginBottom:8})}>No courses yet</div>
                      <div style={f(13,400,GRAY400,{marginBottom:20})}>Create your first course to get started with training your learners</div>
                      <button style={btnPrimary} onClick={openCreate}>+ Create Your First Course</button>
                    </div>
                  </td></tr>
                )}
                {displayed.map((c,i)=>(
                  <CourseRow key={c._id} course={c} myLearners={myLearners.length}
                    onEdit={()=>openEdit(c)} onEnroll={()=>openEnroll(c)} onDelete={()=>setDeleteCourse(c)}
                    isLast={i===displayed.length-1} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Course Editor Modal ── */}
      {showEditor && (
        <Modal
          title={editCourse ? '✏️ Edit Course' : '✨ Create New Course'}
          subtitle={editCourse ? editCourse.title : 'Fill in the details and build your module content'}
          onClose={()=>{ setShowEditor(false); setEditCourse(null); setError('') }}
          width={820}
        >
          <Stepper step={editorStep} />

          {/* Step 1 */}
          {editorStep===1 && (
            <div style={{ display:'flex',flexDirection:'column',gap:18,animation:'fadeIn 0.3s ease' }}>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                <Field label="Course Title *" hint="Learners will see this name"><input style={input} value={courseForm.title} onChange={e=>setCourseForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Workplace Safety Fundamentals" autoFocus /></Field>
                <Field label="Category" hint="Helps learners filter and discover"><input style={input} value={courseForm.category} onChange={e=>setCourseForm(p=>({...p,category:e.target.value}))} placeholder="e.g. Health & Safety, IT…" /></Field>
              </div>
              <Field label="Description" hint="What will learners gain from this course?">
                <textarea style={{ ...input,minHeight:88,resize:'vertical' }} value={courseForm.description} onChange={e=>setCourseForm(p=>({...p,description:e.target.value}))} placeholder="Describe the goals, topics, and target audience…" />
              </Field>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16 }}>
                <Field label="Course Icon">
                  <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginTop:2 }}>
                    {EMOJIS.map(em=>(
                      <button key={em} onClick={()=>setCourseForm(p=>({...p,thumbnailEmoji:em}))}
                        style={{ width:40,height:40,borderRadius:10,border:`2px solid ${courseForm.thumbnailEmoji===em?INDIGO:GRAY200}`,background:courseForm.thumbnailEmoji===em?INDIGO_LIGHT:WHITE,fontSize:20,cursor:'pointer',transition:'all 0.15s',boxShadow:courseForm.thumbnailEmoji===em?SH_INDIGO:SH_SM }}>
                        {em}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Publish Status">
                  <select style={{ ...input,cursor:'pointer',color:GRAY900 }} value={courseForm.status} onChange={e=>setCourseForm(p=>({...p,status:e.target.value}))}>
                    <option value="PUBLISHED">✅ Published — visible to learners</option>
                    <option value="DRAFT">🔒 Draft — hidden from learners</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {editorStep===2 && (
            <div style={{ animation:'fadeIn 0.3s ease' }}>
              <UploadZone onParsed={handleBulkParsed} />
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
                <div style={f(14,700,GRAY900)}>Modules <span style={{ ...f(12,500,GRAY400),marginLeft:4 }}>({courseModules.length})</span></div>
                <button style={btnPrimary} onClick={()=>setCourseModules(ms=>[...ms,emptyModule()])}>+ Add Module</button>
              </div>
              {courseModules.map((mod,mi)=>(
                <ModuleCard key={mi} mod={mod} mi={mi} total={courseModules.length}
                  onChange={u=>setCourseModules(ms=>ms.map((m,i)=>i===mi?u:m))}
                  onRemove={()=>setCourseModules(ms=>ms.filter((_,i)=>i!==mi))} />
              ))}
            </div>
          )}

          {/* Step 3 */}
          {editorStep===3 && (
            <div style={{ animation:'fadeIn 0.3s ease' }}>
              <div style={{ background:`linear-gradient(135deg,${INDIGO_LIGHT},rgba(139,92,246,0.08))`,border:`1px solid rgba(99,102,241,0.2)`,borderRadius:14,padding:18,marginBottom:20 }}>
                <div style={f(14,700,GRAY900,{marginBottom:4})}>✅ Review your course</div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:10 }}>
                  <div style={{ background:WHITE,borderRadius:10,padding:'10px 14px',border:`1px solid ${GRAY200}` }}>
                    <div style={f(11,600,GRAY400,'')}>Title</div>
                    <div style={f(13,700,GRAY900)}>{courseForm.title||'—'}</div>
                  </div>
                  <div style={{ background:WHITE,borderRadius:10,padding:'10px 14px',border:`1px solid ${GRAY200}` }}>
                    <div style={f(11,600,GRAY400,'')}>Modules</div>
                    <div style={f(13,700,GRAY900)}>{courseModules.length} module{courseModules.length!==1?'s':''}</div>
                  </div>
                  <div style={{ background:WHITE,borderRadius:10,padding:'10px 14px',border:`1px solid ${GRAY200}` }}>
                    <div style={f(11,600,GRAY400,'')}>Quiz questions</div>
                    <div style={f(13,700,GRAY900)}>{courseModules.reduce((s,m)=>s+(m.quiz?.questions.length??0),0)} total</div>
                  </div>
                </div>
              </div>
              {courseModules.map((mod,mi)=>(
                <ModuleCard key={mi} mod={mod} mi={mi} total={courseModules.length}
                  onChange={u=>setCourseModules(ms=>ms.map((m,i)=>i===mi?u:m))}
                  onRemove={()=>setCourseModules(ms=>ms.filter((_,i)=>i!==mi))} />
              ))}
            </div>
          )}

          {error && <div style={{ ...f(13,500,RED),background:'rgba(239,68,68,0.06)',borderRadius:10,padding:'10px 14px',marginTop:12 }}>⚠ {error}</div>}

          {/* Footer */}
          <div style={{ display:'flex',justifyContent:'space-between',marginTop:24,paddingTop:20,borderTop:`1px solid ${GRAY100}` }}>
            <div>{editorStep>1 && <button style={btnSecondary} onClick={()=>setEditorStep(s=>s-1)}>← Back</button>}</div>
            <div style={{ display:'flex',gap:10 }}>
              <button style={btnSecondary} onClick={()=>{ setShowEditor(false); setEditCourse(null); setError('') }}>Cancel</button>
              {editorStep<3
                ? <button className="course-btn-primary" style={{ ...btnPrimary,opacity:stepOk?1:0.5 }} disabled={!stepOk} onClick={()=>setEditorStep(s=>s+1)}>Continue →</button>
                : <button className="course-btn-primary" style={btnPrimary} onClick={handleSave} disabled={saving}>{saving?'⏳ Saving…':editCourse?'💾 Save Changes':'🚀 Create Course'}</button>}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Enroll Modal ── */}
      {enrollCourse && (
        <Modal title="👥 Enroll Learners" subtitle={enrollCourse.title} onClose={()=>setEnrollCourse(null)} width={520}>
          <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
            {myLearners.length===0 ? (
              <div style={{ textAlign:'center',padding:'32px 0' }}>
                <div style={{ width:64,height:64,borderRadius:18,background:GRAY100,margin:'0 auto 14px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>👤</div>
                <div style={f(15,700,GRAY900)}>No learners assigned</div>
                <div style={f(13,400,GRAY400,{marginTop:6})}>Ask your admin to assign learners to your account first.</div>
              </div>
            ):(
              <>
                <div style={{ display:'flex',alignItems:'center',gap:10,background:GRAY50,border:`1.5px solid ${GRAY200}`,borderRadius:12,padding:'9px 14px' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke={GRAY400} strokeWidth="1.5"/><path d="M9.5 9.5 12 12" stroke={GRAY400} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <input type="text" placeholder="Search learners…" value={enrollSearch} onChange={e=>setEnrollSearch(e.target.value)} style={{ border:'none',background:'transparent',outline:'none',fontFamily:FF,fontSize:13,flex:1 }} />
                </div>
                <div style={{ maxHeight:300,overflowY:'auto',display:'flex',flexDirection:'column',gap:6 }}>
                  {filtered.map(l=>{
                    const checked=selectedIds.includes(l._id)
                    const enrolled=(enrollCourse.enrolledUsers??[]).some(id=>String(id)===l._id)
                    return (
                      <label key={l._id} style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:12,cursor:'pointer',background:checked?INDIGO_LIGHT:WHITE,border:`1.5px solid ${checked?INDIGO:GRAY200}`,transition:'all 0.15s' }}>
                        <div style={{ width:20,height:20,borderRadius:6,border:`2px solid ${checked?INDIGO:GRAY200}`,background:checked?INDIGO:WHITE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                          <input type="checkbox" checked={checked} onChange={()=>setSelectedIds(ids=>checked?ids.filter(id=>id!==l._id):[...ids,l._id])} style={{ opacity:0,position:'absolute' }} />
                          {checked && <span style={{ color:WHITE,fontSize:12,fontWeight:700 }}>✓</span>}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={f(13,600,GRAY900)}>{l.firstName} {l.lastName}</div>
                          <div style={f(11,400,GRAY400)}>{l.email}</div>
                        </div>
                        {enrolled && <Chip label="Enrolled" color="#059669" bg="rgba(16,185,129,0.1)" dot={GREEN} />}
                      </label>
                    )
                  })}
                  {filtered.length===0 && <div style={{ ...f(13,400,GRAY400),textAlign:'center',padding:24 }}>No learners match your search.</div>}
                </div>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 4px' }}>
                  <span style={f(12,500,GRAY400)}>{selectedIds.length} learner{selectedIds.length!==1?'s':''} selected</span>
                </div>
              </>
            )}
            <div style={{ display:'flex',gap:10,justifyContent:'flex-end',paddingTop:8,borderTop:`1px solid ${GRAY100}` }}>
              <button style={btnSecondary} onClick={()=>setEnrollCourse(null)}>Cancel</button>
              {myLearners.length>0 && (
                <button style={{ ...btnPrimary,opacity:selectedIds.length===0?0.5:1 }} onClick={handleEnroll} disabled={enrolling||selectedIds.length===0}>
                  {enrolling?'Enrolling…':`Enroll ${selectedIds.length} Learner${selectedIds.length!==1?'s':''}`}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteCourse && (
        <div style={{ position:'fixed',inset:0,background:'rgba(17,24,39,0.55)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <div style={{ background:WHITE,borderRadius:20,padding:32,maxWidth:400,width:'100%',boxShadow:SH_LG,animation:'fadeIn 0.2s ease' }}>
            <div style={{ width:60,height:60,borderRadius:18,background:'rgba(239,68,68,0.1)',margin:'0 auto 18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>🗑️</div>
            <div style={f(18,700,GRAY900,{marginBottom:8,textAlign:'center'})}>Delete this course?</div>
            <div style={f(14,400,GRAY400,{marginBottom:28,textAlign:'center'})}>
              <strong style={{ color:GRAY900 }}>{deleteCourse.title}</strong> will be permanently deleted. This action cannot be undone.
            </div>
            <div style={{ display:'flex',gap:10,justifyContent:'center' }}>
              <button style={{ ...btnSecondary,padding:'10px 24px' }} onClick={()=>setDeleteCourse(null)}>Cancel</button>
              <button style={{ ...btnDanger,padding:'10px 24px' }} onClick={handleDelete} disabled={deleting}>{deleting?'Deleting…':'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
