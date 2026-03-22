'use client'

interface SignatureBlockProps {
  name: string
  role: string
  signed?: boolean
  date?: string | null
  onSign?: () => void
}

export default function SignatureBlock({ name, role, signed = false, date = null, onSign = () => {} }: SignatureBlockProps) {
  return (
    <div style={{ borderLeft: '3px solid #e8eaed', paddingLeft: '12px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1a1d2e', margin: 0 }}>{name}</h4>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>{role}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {signed ? (
            <>
              <div style={{ width: '24px', height: '24px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>✓</div>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>Signed {date}</span>
            </>
          ) : (
            <button onClick={onSign} style={{ padding: '6px 12px', backgroundColor: '#e8eaed', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#1a1d2e', cursor: 'pointer' }}>Sign</button>
          )}
        </div>
      </div>
    </div>
  )
}
