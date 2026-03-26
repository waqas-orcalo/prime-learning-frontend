'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

export interface LearnerFeedbackForm {
  _id: string; formName: string; instanceName: string
  learnerId: string | { _id: string; firstName: string; lastName: string; email: string }
  trainerId: string | { _id: string; firstName: string; lastName: string; email: string } | null
  learner?: { _id: string; firstName: string; lastName: string; email: string }
  trainer?: { _id: string; firstName: string; lastName: string; email: string }
  learnerName?: string; dateCreated?: string; dateModified?: string; signed?: boolean
  trainersName: string; keyPoint: string; useSkillsImpact: string; moreInfoOn: string
  completedJournal: 'Yes' | 'No' | ''; ifNoWhyNot: string; improvementSuggestion: string
  learnerSigned: boolean; learnerSignedAt: string | null
  trainerSigned: boolean; trainerSignedAt: string | null
  isDeleted: boolean; createdAt: string; updatedAt: string
}
export interface CreateLearnerFeedbackPayload {
  learnerId: string; trainerId?: string; formName?: string; trainersName?: string
  keyPoint?: string; useSkillsImpact?: string; moreInfoOn?: string
  completedJournal?: 'Yes' | 'No' | ''; ifNoWhyNot?: string
  improvementSuggestion?: string; learnerSigned?: boolean; trainerSigned?: boolean
}
export interface ListLearnerFeedbackParams {
  page?: number; limit?: number; learnerId?: string; trainerId?: string; dateFrom?: string; dateTo?: string
}
interface PaginatedResponse { statusCode: number; message: string; data: LearnerFeedbackForm[]; pagination: { total: number; page: number; limit: number; pages: number } }
interface SingleResponse { statusCode: number; message: string; data: LearnerFeedbackForm }

const KEY = ['learner-feedback'] as const

export function useLearnerFeedbackList(params: ListLearnerFeedbackParams = {}) {
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
      return apiFetch(`/forms/learner-feedback${qs.toString() ? `?${qs}` : ''}`, token)
    },
    enabled: !!token, staleTime: 30_000,
  })
}
export function useLearnerFeedback(id: string) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<SingleResponse>({ queryKey: [...KEY, id], queryFn: () => apiFetch(`/forms/learner-feedback/${id}`, token), enabled: !!token && !!id })
}
export function useCreateLearnerFeedback() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<SingleResponse, Error, CreateLearnerFeedbackPayload>({
    mutationFn: (payload) => apiFetch('/forms/learner-feedback', token, { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
export function useUpdateLearnerFeedback() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<SingleResponse, Error, { id: string } & Partial<CreateLearnerFeedbackPayload>>({
    mutationFn: ({ id, ...payload }) => apiFetch(`/forms/learner-feedback/${id}`, token, { method: 'PATCH', body: JSON.stringify(payload) }),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: KEY }); qc.invalidateQueries({ queryKey: [...KEY, vars.id] }) },
  })
}
export function useDeleteLearnerFeedback() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<{ statusCode: number; message: string; data: null }, Error, string>({
    mutationFn: (id) => apiFetch(`/forms/learner-feedback/${id}`, token, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
export function useSignLearnerFeedback() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<SingleResponse, Error, { id: string; role: 'learner' | 'trainer' }>({
    mutationFn: ({ id, role }) => apiFetch(`/forms/learner-feedback/${id}/sign`, token, { method: 'PATCH', body: JSON.stringify({ role }) }),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: KEY }); qc.invalidateQueries({ queryKey: [...KEY, vars.id] }) },
  })
}
