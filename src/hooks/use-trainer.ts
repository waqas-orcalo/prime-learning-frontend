'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrainerDashboardStats {
  tasks: {
    total: number
    pending: number
    inProgress: number
    completed: number
    completionRate: number
  }
  activities: { total: number }
  messages: { unread: number }
}

export interface TrainerRecentActivity {
  recentTasks: Array<{
    _id: string
    title: string
    status: string
    updatedAt: string
    createdBy?: { _id: string; firstName: string; lastName: string }
  }>
  recentActivities: Array<{
    _id: string
    title: string
    activityType: string
    updatedAt: string
    createdBy?: { _id: string; firstName: string; lastName: string }
  }>
}

export interface LearnerUser {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  status?: string
  profilePicture?: string | null
  createdAt: string
  updatedAt: string
}

export interface TrainerTask {
  _id: string
  title: string
  description?: string
  status: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  createdBy?: { _id: string; firstName: string; lastName: string; email: string }
  assignedTo?: { _id: string; firstName: string; lastName: string; email: string }
}

export interface LearningJournal {
  _id: string
  title: string
  content?: string
  status: string
  tags?: string[]
  otjHours?: number
  category?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  createdBy?: { _id: string; firstName: string; lastName: string; email: string }
  trainerComment?: string
  trainerFeedback?: string
}

interface SingleStatsResponse {
  statusCode: number
  message: string
  data: TrainerDashboardStats
}

interface SingleActivityResponse {
  statusCode: number
  message: string
  data: TrainerRecentActivity
}

interface PaginatedLearnersResponse {
  statusCode: number
  message: string
  data: LearnerUser[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

interface PaginatedTasksResponse {
  statusCode: number
  message: string
  data: TrainerTask[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

interface PaginatedJournalsResponse {
  statusCode: number
  message: string
  data: LearningJournal[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

interface SingleJournalResponse {
  statusCode: number
  message: string
  data: LearningJournal
}

// ── Query keys ────────────────────────────────────────────────────────────────
const TRAINER_KEY    = ['trainer-dashboard'] as const
const LEARNERS_KEY   = ['trainer-learners']  as const
const TR_TASKS_KEY   = ['trainer-tasks']     as const
const JOURNALS_KEY   = ['trainer-journals']  as const

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Trainer dashboard stats */
export function useTrainerDashboardStats() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<SingleStatsResponse>({
    queryKey: [...TRAINER_KEY, 'stats'],
    queryFn: () => apiFetch('/dashboard/stats', token),
    enabled: !!token,
    staleTime: 60_000,
  })
}

/** Trainer dashboard recent activity */
export function useTrainerRecentActivity() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<SingleActivityResponse>({
    queryKey: [...TRAINER_KEY, 'activity'],
    queryFn: () => apiFetch('/dashboard/recent-activity', token),
    enabled: !!token,
    staleTime: 30_000,
  })
}

/** List learners (role=LEARNER) */
export function useTrainerLearners(params: { page?: number; limit?: number; search?: string } = {}) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<PaginatedLearnersResponse>({
    queryKey: [...LEARNERS_KEY, params],
    queryFn: () => {
      const qs = new URLSearchParams({ role: 'LEARNER' })
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.search) qs.set('search', params.search)
      return apiFetch(`/users?${qs.toString()}`, token)
    },
    enabled: !!token,
    staleTime: 30_000,
  })
}

/** List tasks (trainer sees all tasks) */
export function useTrainerTasks(params: { page?: number; limit?: number; status?: string } = {}) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<PaginatedTasksResponse>({
    queryKey: [...TR_TASKS_KEY, params],
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.status) qs.set('status', params.status)
      const q = qs.toString() ? `?${qs.toString()}` : ''
      return apiFetch(`/tasks${q}`, token)
    },
    enabled: !!token,
    staleTime: 30_000,
  })
}

/** List learning journals */
export function useTrainerJournals(params: { page?: number; limit?: number; status?: string } = {}) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<PaginatedJournalsResponse>({
    queryKey: [...JOURNALS_KEY, params],
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.page)   qs.set('page',   String(params.page))
      if (params.limit)  qs.set('limit',  String(params.limit))
      if (params.status) qs.set('status', params.status)
      const q = qs.toString() ? `?${qs.toString()}` : ''
      return apiFetch(`/learning-journals${q}`, token)
    },
    enabled: !!token,
    staleTime: 30_000,
  })
}

/** Update a journal (trainer feedback / status) */
export function useUpdateTrainerJournal() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<SingleJournalResponse, Error, { id: string; trainerFeedback?: string; status?: string }>({
    mutationFn: ({ id, ...payload }) =>
      apiFetch(`/learning-journals/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: JOURNALS_KEY }),
  })
}
