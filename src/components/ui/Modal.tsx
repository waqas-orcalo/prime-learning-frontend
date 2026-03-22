'use client'

import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  width?: number | string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, width = 600, children }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          width: typeof width === 'number' ? `${width}px` : width,
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0px 20px 60px rgba(13,10,44,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #e4e7ec',
            flexShrink: 0,
          }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: '1px solid #e4e7ec', background: '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', color: '#475569',
              }}
            >×</button>
          </div>
        )}
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
