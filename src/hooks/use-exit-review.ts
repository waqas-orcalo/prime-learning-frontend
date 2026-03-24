'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ExitReviewForm {
  _id: string
  formName: string
  instanceName: string
  learnerId: string | { _id: string; firstName: string; lastName: string; email: string }
  trainerId: string | { _id: string; firstName: string; lastName: string; email: string } | null
  // populated in list view
  learner?: { _id: string; firstName: string; lastName: string; email: string }
  trainer?: { _id: string; firstName: string; lastName: string; email: string }
  learnerName?: string   // shaped by backend for list
  dateCreated?: string   // formatted by backend for list
  dateModified?: string  // formatted by backend for list
  signed?: boolean       // derived: learnerSigned && trainerSigned
  // form fields
  learnersName: string
  startDate: string | null
  answers: Record<string, string>
  answerLast: string
  // signatures
  learnerSigned: boolean
  learnerSignedAt: string | null
  trainerSigned: boolean
  trainerSignedAt: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateExitReviewPayload {
  learnerId: string
  trainerId?: string
  learnersName?: string
  startDate?: string
  answers?: Record<string, string>
  answerLast?: string
  learnerSigned?: boolean
  trainerSigned?: boolean
}

export interface ListExitReviewParams {
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
  data: ExitReviewForm[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

interface SingleResponse {
  statusCode: number
  message: string
  data: ExitReviewForm
}

// ── Query keys ────────────────────────────────────────────────────────────────
const KEY = ['exit-review'] as const

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** List all exit review form instances */
export function useExitReviewList(params: ListExitReviewParams = {}) {
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
      return apiFetch(`/forms/exit-review${q}`, token)
    },
    enabled: !!token,
    staleTime: 30_000,
  })
}

/** Get a single exit review form by ID */
export function useExitReview(id: string) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useQuery<SingleResponse>({
    queryKey: [...KEY, id],
    queryFn: () => apiFetch(`/forms/exit-review/${id}`, token),
    enabled: !!token && !!id,
  })
}

/** Create a new exit review form instance */
export function useCreateExitReview() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useMutation<SingleResponse, Error, CreateExitReviewPayload>({
    mutationFn: (payload) =>
      apiFetch('/forms/exit-review', token, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

/** Update an exit review form */
export function useUpdateExitReview() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useMutation<SingleResponse, Error, { id: string } & Partial<CreateExitReviewPayload>>({
    mutationFn: ({ id, ...payload }) =>
      apiFetch(`/forms/exit-review/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: [...KEY, vars.id] })
    },
  })
}

/** Soft-delete an exit review form */
export function useDeleteExitReview() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useMutation<{ statusCode: number; message: string; data: null }, Error, string>({
    mutationFn: (id) =>
      apiFetch(`/forms/exit-review/${id}`, token, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

/** Sign an exit review form (learner or trainer) */
export function useSignExitReview() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  return useMutation<SingleResponse, Error, { id: string; role: 'learner' | 'trainer' }>({
    mutationFn: ({ id, role }) =>
      apiFetch(`/forms/exit-review/${id}/sign`, token, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: KEY })
      qc.invalidateQueries({ queryKey: [...KEY, vars.id] })
    },
  })
}
