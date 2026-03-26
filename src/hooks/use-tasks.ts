'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'
import type { Task, PaginatedResponse } from '@/types'
import { MOCK_TASKS } from '@/constants/mock-data'

const TASKS_KEY = ['tasks']

export function useTasks(params?: { page?: number; pageSize?: number; status?: string; search?: string }) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery({
    queryKey: [...TASKS_KEY, params],
    queryFn: async (): Promise<PaginatedResponse<Task>> => {
      // TODO: replace mock with: const data = await apiFetch('/tasks', token, { params })
      return { data: MOCK_TASKS, total: MOCK_TASKS.length, page: params?.page ?? 1, pageSize: params?.pageSize ?? 10, totalPages: 1 }
    },
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: async (): Promise<Task> => {
      const task = MOCK_TASKS.find((t) => t.id === id)
      if (!task) throw new Error('Task not found')
      return task
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation({
    mutationFn: async (payload: Partial<Task>) => apiFetch('/tasks', token, { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Task> & { id: string }) =>
      apiFetch(`/tasks/${id}`, token, { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation({
    mutationFn: async (id: string) => apiFetch(`/tasks/${id}`, token, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}
