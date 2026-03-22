'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Task, PaginatedResponse } from '@/types'
import { MOCK_TASKS } from '@/constants/mock-data'

const TASKS_KEY = ['tasks']

export function useTasks(params?: { page?: number; pageSize?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: [...TASKS_KEY, params],
    queryFn: async (): Promise<PaginatedResponse<Task>> => {
      // TODO: replace with real API
      // const { data } = await apiClient.get(API_ENDPOINTS.TASKS.LIST, { params })
      return {
        data: MOCK_TASKS,
        total: MOCK_TASKS.length,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
        totalPages: 1,
      }
    },
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: async (): Promise<Task> => {
      // const { data } = await apiClient.get(API_ENDPOINTS.TASKS.BY_ID(id))
      const task = MOCK_TASKS.find((t) => t.id === id)
      if (!task) throw new Error('Task not found')
      return task
    },
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Task>) => {
      const { data } = await apiClient.post(API_ENDPOINTS.TASKS.CREATE, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Task> & { id: string }) => {
      const { data } = await apiClient.put(API_ENDPOINTS.TASKS.UPDATE(id), payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ENDPOINTS.TASKS.DELETE(id))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}
