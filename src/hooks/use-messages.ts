'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Contact, Message } from '@/types'
import { MOCK_CONTACTS } from '@/constants/mock-data'

const CONTACTS_KEY = ['messages', 'contacts']

export function useContacts() {
  return useQuery({
    queryKey: CONTACTS_KEY,
    queryFn: async (): Promise<Contact[]> => {
      // const { data } = await apiClient.get(API_ENDPOINTS.MESSAGES.CONTACTS)
      return MOCK_CONTACTS
    },
  })
}

export function useMessageThread(contactId: string) {
  const query = useQuery({
    queryKey: ['messages', 'thread', contactId],
    queryFn: async (): Promise<Message[]> => {
      // const { data } = await apiClient.get(API_ENDPOINTS.MESSAGES.THREAD(contactId))
      return []
    },
    enabled: !!contactId,
  })

  return query
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { receiverId: string; content: string }) => {
      const { data } = await apiClient.post(API_ENDPOINTS.MESSAGES.SEND, payload)
      return data as Message
    },
    onSuccess: (msg: Message) => {
      qc.setQueryData<Message[]>(
        ['messages', 'thread', msg.receiverId],
        (prev) => [...(prev ?? []), msg]
      )
      qc.invalidateQueries({ queryKey: CONTACTS_KEY })
    },
  })
}
