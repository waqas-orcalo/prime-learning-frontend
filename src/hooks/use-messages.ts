'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'
import type { Contact, Message } from '@/types'
import { MOCK_CONTACTS } from '@/constants/mock-data'

const CONTACTS_KEY = ['messages', 'contacts']

export function useContacts() {
  return useQuery({
    queryKey: CONTACTS_KEY,
    queryFn: async (): Promise<Contact[]> => {
      // TODO: replace mock with real API: apiFetch('/messages/contacts', token)
      return MOCK_CONTACTS
    },
  })
}

export function useMessageThread(contactId: string) {
  return useQuery({
    queryKey: ['messages', 'thread', contactId],
    queryFn: async (): Promise<Message[]> => {
      // TODO: replace mock with: apiFetch(`/messages/thread/${contactId}`, token)
      return []
    },
    enabled: !!contactId,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation({
    mutationFn: async (payload: { receiverId: string; content: string }) =>
      apiFetch('/messages/send', token, { method: 'POST', body: JSON.stringify(payload) }) as Promise<Message>,
    onSuccess: (msg: Message) => {
      qc.setQueryData<Message[]>(['messages', 'thread', msg.receiverId], (prev) => [...(prev ?? []), msg])
      qc.invalidateQueries({ queryKey: CONTACTS_KEY })
    },
  })
}
