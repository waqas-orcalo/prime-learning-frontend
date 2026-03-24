'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface LearningSupportForm {
  _id: string
  formName: string
  instanceName: string
  learnerId: string | { _id: string; firstName: string; lastName: string; email: string }
  trainerId: string | { _id: string; firstName: string; lastName: string; email: string } | null
  // shaped by backend for list view
  learner?: { _id: string; firstName: string; lastName: string; email: string }
  trainer?: { _id: string; firstName: string; lastName: string; email: string }
  learnerName?: string
  dateCreated?: string
  dateModified?: string
  signed?: boolean
  // form fields
  attachmentUrl: string
  attachmentName: string
  monthlyReview: string
  threeMonthlyReview: string
  changesNotes: string
  activityTracker: string
  reasonForStopping: string
  tutorConfirmationA: string
  tutorConfirmationB: string
  learnerConfirmation: string
  // signatures
  learnerSigned: boolean
  learnerSignedAt: string | null
  trainerSigned: boolean
  trainerSignedAt: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLearningSupportPayload {
  learnerId: string
  trainerId?: string
  attachmentUrl?: string
  attachmentName?: string
  monthlyReview?: string
  threeMonthlyReview?: string
  changesNotes?: string
  activityTracker?: string
  reasonForStopping?: string
  tutorConfirmationA?: string
  tutorConfirmationB?: string
  learnerConfirmation?: string
  learnerSigned?: boolean
  trainerSigned?: boolean
}

export interface ListLearningSupportParams {
  page?: number
  limit?: number
  learnerId?: string
  trainerId?: string
  dateFrom?: string
  dateTo?: string
}

interface PaginatedResponse {
  statusCode: number
  message: string
  data: LearningSupportForm[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

interface SingleResponse {
  statusCode: number
  message: string
  data: LearningSupportForm
}

// ── Query keys ────────────────────────────────────────────────────────────────
const KEY = ['learning-support'] as const

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** List all learning support form instances */
export function useLearningSupportList(params: ListLearningSupportParams = {}) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useQuery<PaginatedResponse>({
    queryKey: [...KEY, params],
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.page)      qs.set('page',      String(params.page))
      if (params.limit)     qs.set('limit',     String(params.limit))
      if (params.learnerId) qs.set('learnerId', params.learnerId)
      if (params.trainerId) qs.set('trainerId', params.trainerId)
      if (params.dateFrom)  qs.set('dateFrom',  params.dateFrom)
      if (params.dateTo)    qs.set('dateTo',    params.dateTo)
      const q = qs.toString() ? `?${qs.toString()}` : ''
      return apiFetch(`/forms/learning-support${q}`, token)
    },
    enabled: !!token,
    staleTime: 30_000,
  })
}

/** Get a single learning support form by ID */
export function useLearningSupport(id: string) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useQuery<SingleResponse>({
    queryKey: [...KEY, id],
    queryFn: () => apiFetch(`/forms/learning-support/${id}`, token),
    enabled: !!token && !!id,
  })
}

/** Create a new learning support form instance */
export function useCreateLearningSupport() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useMutation<SingleResponse, Error, CreateLearningSupportPayload>({
    mutationFn: (payload) =>
      apiFetch('/forms/learning-support', token, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

/** Update a learning support form */
export function useUpdateLearningSupport() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useMutation<SingleResponse, Error, { id: string } & Partial<CreateLearningSupportPayload>>({
    mutationFn: ({ id, ...payload }) =>
      apiFetch(`/forms/learning-support/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: [...KEY, vars.id] })
    },
  })
}

/** Soft-delete a learning support form */
export function useDeleteLearningSupport() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useMutation<{ statusCode: number; message: string; data: null }, Error, string>({
    mutationFn: (id) =>
      apiFetch(`/forms/learning-support/${id}`, token, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

/** Sign a learning support form (learner or trainer) */
export function useSignLearningSupport() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useMutation<SingleResponse, Error, { id: string; role: 'learner' | 'trainer' }>({
    mutationFn: ({ id, role }) =>
      apiFetch(`/forms/learning-support/${id}/sign`, token, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: [...KEY, vars.id] })
    },
  })
}
