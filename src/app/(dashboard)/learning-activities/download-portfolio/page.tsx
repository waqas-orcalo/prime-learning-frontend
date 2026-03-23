'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'

/* ── SVG icons ── */
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBack = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

function DownloadPortfolioInner() {
  const router = useRouter()
  const [includeAttachments, setIncludeAttachments] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)

  const handleRequestDownload = async () => {
    setLoading(true)
    // TODO: wire to API when endpoint is available
    await new Promise(r => setTimeout(r, 800))
    setRequested(true)
    setLoading(false)
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 960, ...FF }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, flexShrink: 0 }}
        >
          <img src={iconBack} width={32} height={32} alt="Back" />
        </button>
        <h1 style={font(22, 600)}>Download Portfolio</h1>
      </div>

      {/* Instructions card */}
      <div style={{ border: '1px solid rgba(28,28,28,0.15)', borderRadius: 12, overflow: 'hidden' }}>

        {/* Card header row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', background: '#f8f9fa',
          borderBottom: '1px solid rgba(28,28,28,0.1)'
        }}>
          <span style={font(14, 600)}>Instructions</span>
          <span style={font(13, 400, '#555')}>
            This feature allows you to download a read-only copy of your current portfolio.
          </span>
        </div>

        {/* Card body */}
        <div style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Step 1 */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={font(14)}>1.</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ ...font(14), margin: 0 }}>
                Decide whether you want to include file attachments with the download.
              </p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includeAttachments}
                  onChange={e => setIncludeAttachments(e.target.checked)}
                  style={{ width: 15, height: 15, marginTop: 2, flexShrink: 0 }}
                />
                <span style={font(14, 600)}>
                  Include file attachments. Selecting this option may result in a longer processing and download time
                </span>
              </label>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={font(14)}>2.</span>
            <p style={{ ...font(14), margin: 0, lineHeight: '22px' }}>
              Click the &lsquo;Request New Download&rsquo; button below to request a download. The request will be put in a queue
              and an email will be sent to you when the portfolio is ready for download. This could take up to 12 business
              hours to process during peak usage times.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: 12, padding: '4px 0',
            borderTop: '1px solid rgba(28,28,28,0.08)',
            borderBottom: '1px solid rgba(28,28,28,0.08)',
            paddingTop: 16, paddingBottom: 16
          }}>
            {requested ? (
              <button
                style={{
                  background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 22px', cursor: 'pointer', ...font(14, 500, '#fff')
                }}
              >
                Download ZIP File
              </button>
            ) : (
              <button
                onClick={handleRequestDownload}
                disabled={loading}
                style={{
                  background: loading ? '#555' : '#1c1c1c', color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 22px', cursor: loading ? 'not-allowed' : 'pointer',
                  ...font(14, 500, '#fff')
                }}
              >
                {loading ? 'Requesting…' : 'Request New Download'}
              </button>
            )}
            <button
              style={{
                background: '#fff', color: '#1c1c1c',
                border: '1px solid rgba(28,28,28,0.3)', borderRadius: 8,
                padding: '10px 22px', cursor: 'pointer', ...font(14, 500)
              }}
            >
              Cancel Download request
            </button>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={font(14)}>3.</span>
            <p style={{ ...font(14), margin: 0, lineHeight: '22px' }}>
              When your portfolio is ready to download, the &lsquo;Download ZIP File&rsquo; button will appear above.
              Click the button to download the ZIP file within 7 days. After this time, it will be deleted and a new
              request will have to be made.
            </p>
          </div>

          {/* Step 4 */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={font(14)}>4.</span>
            <p style={{ ...font(14), margin: 0, lineHeight: '22px' }}>
              Once downloaded, locate the ZIP file and extract it before viewing the contents. Do not attempt to open any
              of the files directly from the ZIP file. Please consult your operating system (e.g. Windows) documentation
              or third-party software instructions for extracting ZIP files.
            </p>
          </div>

          {/* NB notice */}
          <p style={{ ...font(14, 700), margin: 0, lineHeight: '22px' }}>
            NB. The current unzipped size of this portfolio is approximately 5 megabytes.
            There is a limit of 25 download requests per day.
          </p>

        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <DownloadPortfolioInner />
    </Suspense>
  )
}
