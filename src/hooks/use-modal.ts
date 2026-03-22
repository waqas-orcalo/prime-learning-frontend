'use client'

import { useState, useCallback } from 'react'

export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [data, setData] = useState<unknown>(null)

  const open = useCallback((payload?: unknown) => {
    setData(payload ?? null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setData(null)
  }, [])

  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return { isOpen, data, open, close, toggle }
}
