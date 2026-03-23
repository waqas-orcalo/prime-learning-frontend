'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

/* ── SVG icons ── */
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

interface ShowcaseItem {
  _id: string
  ref: string
  assessmentDate: string
  title: string
  titleLink?: string
  method: string
  dateTrainerSigned: string
  dateLearnerSigned: string
  evidenceSizeMb: number
  downloadRequested?: boolean
}

const TH_STYLE: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'left', ...font(12, 500, '#555'),
  borderBottom: '1px solid rgba(28,28,28,0.1)', background: '#fafafa',
  whiteSpace: 'nowrap'
}
const TD_STYLE: React.CSSProperties = {
  padding: '11px 12px', ...font(12), borderBottom: '1px solid rgba(28,28,28,0.07)'
}

/* Mock data matching the Figma design */
const MOCK_ITEMS: ShowcaseItem[] = [
  {
    _id: '1',
    ref: 'AS1',
    assessmentDate: '2025-01-03',
    title: 'UI UX Deisgn for onefile',
    method: 'Assignment',
    dateTrainerSigned: '2025-10-02T19:28:00',
    dateLearnerSigned: '2025-01-03T05:02:00',
    evidenceSizeMb: 4.41,
    downloadRequested: true,
  },
  {
    _id: '2',
    ref: 'AS1',
    assessmentDate: '2025-01-03',
    title: 'UX Design',
    method: 'Assignment',
    dateTrainerSigned: '2025-10-02T19:28:00',
    dateLearnerSigned: '2025-01-03T05:02:00',
    evidenceSizeMb: 0.97,
    downloadRequested: false,
  },
]

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

function fmtDateTime(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return `${date} ${time}`
}

function ShowcaseInner() {
  const router = useRouter()
  const { data: session } = useSession()
  const [items, setItems] = useState<ShowcaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    const token = (session?.user as any)?.accessToken
    if (!token) return

    apiFetch<any>('/learning-activities/showcase/list', token)
      .then(resp => {
        const data = Array.isArray(resp?.data) ? resp.data : (resp?.data?.data ?? [])
        setItems(data.length > 0 ? data : MOCK_ITEMS)
      })
      .catch(() => setItems(MOCK_ITEMS))
      .finally(() => setLoading(false))
  }, [session])

  const handleDownload = async (id: string) => {
    setDownloadingId(id)
    // TODO: wire to API
    await new Promise(r => setTimeout(r, 800))
    setItems(prev => prev.map(item => item._id === id ? { ...item, downloadRequested: true } : item))
    setDownloadingId(null)
  }

  const handleCancelRequest = async (id: string) => {
    setItems(prev => prev.map(item => item._id === id ? { ...item, downloadRequested: false } : item))
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, ...FF }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, flexShrink: 0 }}
        >
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Showcase</h1>
      </div>

      {/* Showcase card */}
      <div style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: 12, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', background: '#f8f9fa',
          borderBottom: '1px solid rgba(28,28,28,0.1)'
        }}>
          <span style={font(14, 600)}>Portfolio Showcase</span>
          <span style={font(13, 400, '#555')}>This feature allows you to download your portfolio showcase.</span>
        </div>

        {/* Instructions */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div style={{ display: 'flex', gap: 8 }}>
            <span style={font(13)}>1.</span>
            <p style={{ ...font(13), margin: 0, lineHeight: '20px' }}>
              Decide which learning activities to include in your portfolio showcase. You can right click and open in a new window to preview the learning activity.
            </p>
          </div>

          {/* Table */}
          <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 10, overflow: 'hidden', margin: '4px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH_STYLE}>Ref</th>
                  <th style={TH_STYLE}>Assessment Date</th>
                  <th style={TH_STYLE}>Title</th>
                  <th style={TH_STYLE}>Method</th>
                  <th style={TH_STYLE}>Date Trainer Signed</th>
                  <th style={TH_STYLE}>Date Learner Signed</th>
                  <th style={{ ...TH_STYLE, textAlign: 'right' }}>Evidence Size (Mb)</th>
                  <th style={{ ...TH_STYLE, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ ...TD_STYLE, textAlign: 'center', color: '#888', padding: '24px' }}>
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ ...TD_STYLE, textAlign: 'center', color: '#888', padding: '24px' }}>
                      No learning activities available for showcase.
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <tr key={item._id || i}>
                      <td style={TD_STYLE}>{item.ref}</td>
                      <td style={TD_STYLE}>{fmtDate(item.assessmentDate)}</td>
                      <td style={TD_STYLE}>
                        <span style={{ color: '#6366f1', textDecoration: 'underline', cursor: 'pointer' }}>
                          {item.title}
                        </span>
                      </td>
                      <td style={TD_STYLE}>{item.method}</td>
                      <td style={TD_STYLE}>{fmtDateTime(item.dateTrainerSigned)}</td>
                      <td style={TD_STYLE}>{fmtDateTime(item.dateLearnerSigned)}</td>
                      <td style={{ ...TD_STYLE, textAlign: 'right' }}>{item.evidenceSizeMb.toFixed(2)}</td>
                      <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            onClick={() => handleDownload(item._id)}
                            disabled={downloadingId === item._id}
                            style={{
                              background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 6,
                              padding: '6px 14px', cursor: 'pointer', ...font(12, 500, '#fff')
                            }}
                          >
                            {downloadingId === item._id ? '…' : 'Download'}
                          </button>
                          <button
                            onClick={() => handleCancelRequest(item._id)}
                            style={{
                              background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 6,
                              padding: '6px 14px', cursor: 'pointer', ...font(12, 500, '#fff')
                            }}
                          >
                            Cancel request
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <span style={font(13)}>2.</span>
            <p style={{ ...font(13), margin: 0, lineHeight: '20px' }}>
              Click the &lsquo;Download&rsquo; button below to request a download. The request will be put in a queue and an email
              will be sent to you when the portfolio is ready for download. This could take up to 12 business hours to process during
              peak usage times.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <span style={font(13)}>3.</span>
            <p style={{ ...font(13), margin: 0, lineHeight: '20px' }}>
              When the portfolio showcase is ready to download, the &lsquo;Download ZIP File&rsquo; button will appear above.
              Click the button to download the ZIP file within 7 days. After this time, it will be deleted and a new request will
              have to be made.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <span style={font(13)}>4.</span>
            <p style={{ ...font(13), margin: 0, lineHeight: '20px' }}>
              Once downloaded, locate the ZIP file and extract it before viewing the contents. Do not attempt to open any of the
              files directly from the ZIP file. Please consult your operating system (e.g. Windows) documentation or third-party
              software instructions for extracting ZIP files.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <ShowcaseInner />
    </Suspense>
  )
}
