'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrainerDashboardStats {
  learners: { total: number }
  tasks: { total: number; pending: number; inProgress: number; completed: number; completionRate: number }
  activities: { total: number }
  messages: { unread: number }
}
export interface TrainerRecentActivity {
  recentTasks: Array<{ _id: string; title: string; status: string; updatedAt: string; createdBy?: { _id: string; firstName: string; lastName: string } }>
  recentActivities: Array<{ _id: string; title: string; activityType: string; updatedAt: string; createdBy?: { _id: string; firstName: string; lastName: string } }>
}
export interface LearnerUser {
  _id: string; firstName: string; lastName: string; email: string; role: string
  status?: string; profilePicture?: string | null; cohort?: string | null
  programme?: string | null; employer?: string | null; trainerId?: string | null
  lastActivityAt?: string | null; createdAt: string; updatedAt: string
  stats?: { totalTasks: number; completedTasks: number; pendingTasks: number; totalActivities: number; unreadMessages: number; progressPercent: number }
}
export interface TrainerTask {
  _id: string; title: string; description?: string; status: string; priority?: string
  dueDate?: string; createdAt: string; updatedAt: string
  createdBy?: { _id: string; firstName: string; lastName: string; email: string }
  assignedTo?: { _id: string; firstName: string; lastName: string; email: string }
}
export interface LearningJournal {
  _id: string; title: string; content?: string; status: string; tags?: string[]
  otjHours?: number; category?: string; publishedAt?: string; createdAt: string; updatedAt: string
  createdBy?: { _id: string; firstName: string; lastName: string; email: string }
  trainerComment?: string; trainerFeedback?: string
}
export interface LearnerDetail extends Omit<LearnerUser, 'stats'> {
  stats: { totalTasks: number; completedTasks: number; pendingTasks: number; inProgressTasks: number; totalActivities: number; totalJournals: number; unreadMessages: number; progressPercent: number }
  recentTasks: TrainerTask[]
}
export interface LearnerPortfolio { learner: LearnerUser; tasks: TrainerTask[]; activities: any[]; journals: LearningJournal[] }
export interface LearnerProgress { learner: LearnerUser; tasksByStatus: Array<{ _id: string; count: number }>; activitiesByType: Array<{ _id: string; count: number }>; journalsByMonth: Array<{ _id: string; count: number }> }

interface SingleResponse<T> { statusCode: number; message: string; data: T }
interface PaginatedResponse<T> { statusCode: number; message: string; data: T[]; pagination: { total: number; page: number; limit: number; totalPages: number } }

const TRAINER_KEY  = ['trainer-dashboard'] as const
const LEARNERS_KEY = ['trainer-learners']  as const
const TR_TASKS_KEY = ['trainer-tasks']     as const
const JOURNALS_KEY = ['trainer-journals']  as const

export function useTrainerDashboardStats() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<SingleResponse<TrainerDashboardStats>>({ queryKey: [...TRAINER_KEY, 'stats'], queryFn: () => apiFetch('/trainer/dashboard/stats', token), enabled: !!token, staleTime: 60_000 })
}
export function useTrainerRecentActivity() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<SingleResponse<TrainerRecentActivity>>({ queryKey: [...TRAINER_KEY, 'activity'], queryFn: () => apiFetch('/dashboard/recent-activity', token), enabled: !!token, staleTime: 30_000 })
}
export function useTrainerDashboardCharts() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery({ queryKey: [...TRAINER_KEY, 'charts'], queryFn: () => apiFetch('/trainer/dashboard/charts', token), enabled: !!token, staleTime: 60_000 })
}
export function useTrainerLearners(params: { page?: number; limit?: number; search?: string; cohort?: string; programme?: string } = {}) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<PaginatedResponse<LearnerUser>>({
    queryKey: [...LEARNERS_KEY, params],
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.page)      qs.set('page',      String(params.page))
      if (params.limit)     qs.set('limit',     String(params.limit))
      if (params.search)    qs.set('search',    params.search)
      if (params.cohort)    qs.set('cohort',    params.cohort)
      if (params.programme) qs.set('programme', params.programme)
      return apiFetch(`/trainer/my-learners${qs.toString() ? `?${qs}` : ''}`, token)
    },
    enabled: !!token, staleTime: 30_000,
  })
}
export function useTrainerLearnerDetail(learnerId: string | undefined) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<SingleResponse<LearnerDetail>>({ queryKey: [...LEARNERS_KEY, 'detail', learnerId], queryFn: () => apiFetch(`/trainer/learner/${learnerId}`, token), enabled: !!token && !!learnerId, staleTime: 30_000 })
}
export function useTrainerLearnerPortfolio(learnerId: string | undefined) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<SingleResponse<LearnerPortfolio>>({ queryKey: [...LEARNERS_KEY, 'portfolio', learnerId], queryFn: () => apiFetch(`/trainer/learner/${learnerId}/portfolio`, token), enabled: !!token && !!learnerId, staleTime: 30_000 })
}
export function useTrainerLearnerProgress(learnerId: string | undefined) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<SingleResponse<LearnerProgress>>({ queryKey: [...LEARNERS_KEY, 'progress', learnerId], queryFn: () => apiFetch(`/trainer/learner/${learnerId}/progress`, token), enabled: !!token && !!learnerId, staleTime: 30_000 })
}
export function useTrainerTasks(params: { page?: number; limit?: number; status?: string } = {}) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<PaginatedResponse<TrainerTask>>({
    queryKey: [...TR_TASKS_KEY, params],
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.status) qs.set('status', params.status)
      return apiFetch(`/trainer/tasks${qs.toString() ? `?${qs}` : ''}`, token)
    },
    enabled: !!token, staleTime: 30_000,
  })
}
export function useTrainerJournals(params: { page?: number; limit?: number; status?: string } = {}) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<PaginatedResponse<LearningJournal>>({
    queryKey: [...JOURNALS_KEY, params],
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.status) qs.set('status', params.status)
      return apiFetch(`/learning-journals${qs.toString() ? `?${qs}` : ''}`, token)
    },
    enabled: !!token, staleTime: 30_000,
  })
}
export function useTrainerReport(type: string | undefined, params: { page?: number; limit?: number; cohort?: string; programme?: string; from?: string; to?: string } = {}) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery({
    queryKey: ['trainer-report', type, params],
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.page)      qs.set('page',      String(params.page))
      if (params.limit)     qs.set('limit',     String(params.limit))
      if (params.cohort)    qs.set('cohort',    params.cohort)
      if (params.programme) qs.set('programme', params.programme)
      if (params.from)      qs.set('from',      params.from)
      if (params.to)        qs.set('to',        params.to)
      return apiFetch(`/trainer/reports/${type}${qs.toString() ? `?${qs}` : ''}`, token)
    },
    enabled: !!token && !!type, staleTime: 30_000,
  })
}
export function useUpdateTrainerJournal() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string; status?: string; trainerFeedback?: string; trainerComment?: string }) =>
      apiFetch(`/learning-journals/${id}`, token, { method: 'PATCH', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: JOURNALS_KEY }),
  })
}
export function useAssignLearner() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: { learnerId: string; cohort?: string; programme?: string; employer?: string }) =>
      apiFetch('/trainer/assign-learner', token, { method: 'POST', body: JSON.stringify(dto) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEARNERS_KEY }),
  })
}
export function useUnassignLearner() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (learnerId: string) => apiFetch(`/trainer/unassign-learner/${learnerId}`, token, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEARNERS_KEY }),
  })
}
