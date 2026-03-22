'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBackCircle = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaretDownDark = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCalendar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconUploadCloud = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 26V14m0 0l-5 5m5-5l5 5" stroke="#9291A5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 22a8 8 0 0 1 .5-2.8A7 7 0 0 1 24 16a6 6 0 0 1 6 6v.5" stroke="#9291A5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconFileWarning = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#E74C3C" stroke-width="1.5"/><path d="M10 6v5M10 13.5v.5" stroke="#E74C3C" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconInfo = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#1c1c1c" stroke-width="1.2"/><path d="M8 7v4M8 5.5v.5" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconClose = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14.5" stroke="#1c1c1c" stroke-width="1.5"/><path d="M11 11l10 10M21 11l-10 10" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconPlus = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: Record<string, unknown> = {}) => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

const TABLE_DATA = [
  { title: 'Approved-courses-May-2021', date: '03/01/2025 05:01', folder: 'Sheba XYZ', type: 'Png', size: '312KB', links: ['AS1', 'AS2'] },
  { title: 'Approved-courses-May-2021', date: '03/01/2025 05:01', folder: 'Sheba XYZ', type: 'Png', size: '312KB', links: ['PRJ1'] },
  { title: 'Approved-courses-May-2021', date: '03/01/2025 05:01', folder: 'Sheba XYZ', type: 'Png', size: '312KB', links: ['PRJ1'] },
]
const FOLDERS = ['Abc Radio', 'Sheba XYZ', 'My Folder']

function ManageFolderModal({ onClose }: { onClose: () => void }) {
  const [showCreate, setShowCreate] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '510px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ backgroundColor: '#f4f4f4', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderRadius: '12px 12px 0 0' }}>
          <span style={{ ...font(18, 700, '#000'), letterSpacing: '-0.36px' }}>{showCreate ? 'Create a folder' : 'Manage folder'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <img src={iconClose} alt="Close" style={{ width: '32px', height: '32px' }} />
          </button>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '24px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {showCreate && <p style={{ ...font(14, 400, 'rgba(28,28,28,0.6)'), margin: 0, textAlign: 'center' as const }}>Give your folder a name and save it or cancel</p>}
            {!showCreate && (
              <button onClick={() => setShowCreate(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#000', border: 'none', borderRadius: '8px', height: '28px', padding: '4px 8px', cursor: 'pointer', alignSelf: 'flex-start' as const }}>
                <span style={{ ...font(14, 400, '#fff') }}>Create Folder</span>
                <img src={iconPlus} alt="+" style={{ width: '16px', height: '16px' }} />
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                <div style={{ flex: 1, padding: '8px 16px' }}><span style={{ ...font(14, 400, 'rgba(28,28,28,0.6)') }}>Folders</span></div>
                <div style={{ flex: 1, padding: '8px 16px', textAlign: 'right' as const }}><span style={{ ...font(14, 400, 'rgba(28,28,28,0.6)') }}>Action</span></div>
              </div>
              {showCreate && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                  <div style={{ flex: 1, padding: '8px 16px' }}>
                    <input autoFocus type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid rgba(28,28,28,0.2)', borderRadius: '6px', padding: '4px 8px', ...font(14, 400, '#1c1c1c'), outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '4px', padding: '0 16px', justifyContent: 'flex-end' }}>
                    <button style={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', padding: '4px 12px', cursor: 'pointer', ...font(14, 400, '#fff'), height: '32px', display: 'flex', alignItems: 'center' }}>Save</button>
                    <button onClick={() => { setShowCreate(false); setNewFolderName('') }} style={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', padding: '4px 12px', cursor: 'pointer', ...font(14, 400, '#fff'), height: '32px', display: 'flex', alignItems: 'center' }}>Cancel</button>
                  </div>
                </div>
              )}
              {FOLDERS.map((folder, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(28,28,28,0.1)', opacity: showCreate ? 0.4 : 1 }}>
                  <div style={{ flex: 1, padding: '8px 16px' }}><span style={{ ...font(14, 400, '#1c1c1c') }}>{folder}</span></div>
                  <div style={{ display: 'flex', gap: '4px', padding: '0 16px', justifyContent: 'flex-end' }}>
                    <button style={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', padding: '4px 12px', cursor: showCreate ? 'default' : 'pointer', ...font(14, 400, '#fff'), height: '32px', display: 'flex', alignItems: 'center' }}>Edit</button>
                    <button style={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', padding: '4px 12px', cursor: showCreate ? 'default' : 'pointer', ...font(14, 400, '#fff'), height: '32px', display: 'flex', alignItems: 'center' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateLinkModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '28px', width: '460px', boxShadow: '0px 8px 32px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ ...font(20, 700, '#1c1c1c'), margin: 0 }}>Create a link</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <img src={iconClose} alt="Close" style={{ width: '24px', height: '24px' }} />
          </button>
        </div>
        <p style={{ ...font(14, 400, '#1c1c1c'), margin: '0 0 10px 0', lineHeight: '20px' }}>Type the full web address (URL) of the website or page to link to:</p>
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(28,28,28,0.2)', ...font(14, 400, '#1c1c1c'), outline: 'none', marginBottom: '16px' }} autoFocus />
        <div style={{ marginBottom: '28px' }}>
          <p style={{ ...font(14, 700, '#1c1c1c'), margin: '0 0 4px 0' }}>Examples:</p>
          <p style={{ ...font(13, 400, '#615E83'), margin: '0 0 2px 0' }}>http://www.google.co.uk</p>
          <p style={{ ...font(13, 400, '#615E83'), margin: 0 }}>http://myintranet/somepage.htm</p>
        </div>
        <div style={{ height: '1px', backgroundColor: 'rgba(28,28,28,0.1)', marginBottom: '20px' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 24px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Create</button>
          <button onClick={onClose} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 24px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function EvidencePage() {
  const router = useRouter()
  const [showCreateLink, setShowCreateLink] = useState(false)
  const [showManageFolders, setShowManageFolders] = useState(false)

  return (
    <div>
      {showManageFolders && <ManageFolderModal onClose={() => setShowManageFolders(false)} />}
      {showCreateLink && <CreateLinkModal onClose={() => setShowCreateLink(false)} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <img src={iconBackCircle} alt="Back" style={{ width: '32px', height: '32px', cursor: 'pointer' }} onClick={() => router.back()} />
        <h1 style={{ ...font(24, 700, '#1c1c1c'), margin: 0, lineHeight: '32px' }}>Learning Activity Evidence</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ ...font(14, 400, '#615E83') }}>Show uploaded files from:</span>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '7px 14px', cursor: 'pointer', ...font(14, 500, '#fff') }}>
            All folder <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
          </button>
          <button onClick={() => setShowManageFolders(true)} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '7px 14px', cursor: 'pointer', ...font(14, 500, '#fff') }}>Manage folders</button>
          <button onClick={() => setShowCreateLink(true)} style={{ backgroundColor: '#fff', border: '1.5px solid #1c1c1c', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', ...font(14, 500, '#1c1c1c') }}>Create link</button>
        </div>
        <button onClick={() => router.push('/supported-file-format')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span style={{ ...font(14, 400, '#1c1c1c') }}>View supported file types</span>
          <img src={iconInfo} alt="" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      <div style={{ border: '1.5px dashed rgba(28,28,28,0.2)', borderRadius: '12px', padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px', backgroundColor: '#fff' }}>
        <img src={iconUploadCloud} alt="" style={{ width: '40px', height: '40px' }} />
        <div>
          <div style={{ ...font(15, 500, '#1c1c1c'), marginBottom: '2px' }}>Select a file or drag and drop here</div>
          <div style={{ ...font(13, 400, '#9291A5') }}>JPG, PNG or PDF, file size no more than 10MB</div>
        </div>
        <button style={{ backgroundColor: '#fff', border: '1.5px solid #1c1c1c', borderRadius: '6px', padding: '8px 20px', cursor: 'pointer', marginLeft: '20px', ...font(14, 600, '#1c1c1c') }}>SELECT FILE</button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.04)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ ...font(15, 700, '#1c1c1c') }}>Uploaded Files in All folders (1 - 4 of 4)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ ...font(14, 400, '#615E83') }}>Page number:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', backgroundColor: '#fff' }}>
                <span style={{ ...font(14, 400, '#1c1c1c') }}>1</span>
                <img src={iconCaretDownDark} alt="" style={{ width: '14px', height: '14px' }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...font(14, 400, '#615E83') }}>Records per page:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', backgroundColor: '#fff' }}>
              <span style={{ ...font(14, 400, '#1c1c1c') }}>50</span>
              <img src={iconCaretDownDark} alt="" style={{ width: '14px', height: '14px' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {['Date From:', 'Date To:'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ ...font(14, 400, '#615E83') }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '6px 10px', backgroundColor: '#fff' }}>
                <span style={{ ...font(14, 400, '#1c1c1c') }}>{i === 0 ? '12/12/2025' : '18/12/2025'}</span>
                <img src={iconCalendar} alt="" style={{ width: '16px', height: '16px', opacity: 0.6 }} />
              </div>
            </div>
          ))}
          <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '7px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Submit</button>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                {['Title','Folder','Type','Size','Used in Learning Activities','Action'].map((h, i) => (
                  <th key={h} style={{ ...font(14, 400, 'rgba(28,28,28,0.5)'), padding: '12px', textAlign: (i === 5 ? 'right' : 'left') as 'left' | 'right', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TABLE_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={iconFileWarning} alt="" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      <div>
                        <div style={{ ...font(14, 600, '#1c1c1c'), lineHeight: '20px' }}>{row.title}</div>
                        <div style={{ ...font(12, 400, '#9291A5'), lineHeight: '18px' }}>Date uploaded: {row.date}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '14px 12px' }}>{row.folder}</td>
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '14px 12px' }}>{row.type}</td>
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '14px 12px' }}>{row.size}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {row.links.map((link, j) => <span key={j} style={{ ...font(14, 500, '#2A78B7'), cursor: 'pointer' }}>[{link}]</span>)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {['Copy Link','Edit','Delete'].map(btn => (
                        <button key={btn} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', ...font(12, 500, '#fff') }}>{btn}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
