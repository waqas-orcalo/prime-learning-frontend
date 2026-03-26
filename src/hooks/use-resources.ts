'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────
export type ResourceType = 'DOCUMENT' | 'VIDEO' | 'LINK' | 'TEMPLATE' | 'PRESENTATION'
export type ResourceVisibility = 'ALL' | 'TRAINER' | 'LEARNER' | 'ADMIN'

export interface Resource {
  _id: string
  title: string
  description: string
  type: ResourceType
  category: string
  tags: string[]
  visibility: ResourceVisibility
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  mimeType: string | null
  externalUrl: string | null
  views: number
  downloads: number
  bookmarkedBy: string[]
  bookmarked: boolean
  featured: boolean
  uploadedBy: { _id: string; firstName: string; lastName: string; email: string } | null
  sharedWith: string[]
  isOwner: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ListResourcesParams {
  page?: number
  limit?: number
  search?: string
  type?: ResourceType | ''
  category?: string
  featured?: string
  bookmarked?: string
}

interface PaginatedResourcesResponse {
  statusCode: number
  message: string
  data: Resource[]
  pagination: { total: number; page: number; limit: number; pages: number }
}

interface ResourceResponse {
  statusCode: number
  message: string
  data: Resource
}

const RESOURCES_KEY = ['resources'] as const

export function useResources(params: ListResourcesParams = {}) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<PaginatedResourcesResponse>({
    queryKey: [...RESOURCES_KEY, params],
    queryFn: () => {
      const qs = new URLSearchParams()
      if (params.page)       qs.set('page',      String(params.page))
      if (params.limit)      qs.set('limit',     String(params.limit))
      if (params.search)     qs.set('search',    params.search)
      if (params.type)       qs.set('type',      params.type)
      if (params.category)   qs.set('category',  params.category)
      if (params.featured)   qs.set('featured',  params.featured)
      if (params.bookmarked) qs.set('bookmarked',params.bookmarked)
      const query = qs.toString() ? `?${qs.toString()}` : ''
      return apiFetch(`/resources${query}`, token)
    },
    enabled: !!token,
    staleTime: 1000 * 30,
  })
}

export function useResource(id: string) {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<ResourceResponse>({
    queryKey: [...RESOURCES_KEY, id],
    queryFn: () => apiFetch(`/resources/${id}`, token),
    enabled: !!token && !!id,
  })
}

export function useCreateResource() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<ResourceResponse, Error, Partial<Resource>>({
    mutationFn: (payload) => apiFetch('/resources', token, { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESOURCES_KEY }),
  })
}

export function useUpdateResource() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<ResourceResponse, Error, { id: string } & Partial<Resource>>({
    mutationFn: ({ id, ...payload }) => apiFetch(`/resources/${id}`, token, { method: 'PATCH', body: JSON.stringify(payload) }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: RESOURCES_KEY })
      qc.invalidateQueries({ queryKey: [...RESOURCES_KEY, variables.id] })
    },
  })
}

export function useDeleteResource() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<{ statusCode: number; message: string; data: null }, Error, string>({
    mutationFn: (id) => apiFetch(`/resources/${id}`, token, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESOURCES_KEY }),
  })
}

export function useToggleBookmark() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<ResourceResponse, Error, string>({
    mutationFn: (id) => apiFetch(`/resources/${id}/bookmark`, token, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESOURCES_KEY }),
  })
}

export function useToggleFeatured() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<ResourceResponse, Error, string>({
    mutationFn: (id) => apiFetch(`/resources/${id}/featured`, token, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESOURCES_KEY }),
  })
}

export function useRecordView() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => apiFetch(`/resources/${id}/view`, token, { method: 'POST' }),
  })
}

export function useRecordDownload() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => apiFetch(`/resources/${id}/download`, token, { method: 'POST' }),
  })
}

export function useShareResource() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<{ statusCode: number; message: string; data: Resource }, Error, { id: string; userIds: string[] }>({
    mutationFn: ({ id, userIds }) => apiFetch(`/resources/${id}/share`, token, { method: 'POST', body: JSON.stringify({ userIds }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESOURCES_KEY }),
  })
}

export function useRevokeShare() {
  const qc = useQueryClient()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useMutation<{ statusCode: number; message: string; data: Resource }, Error, { resourceId: string; userId: string }>({
    mutationFn: ({ resourceId, userId }) => apiFetch(`/resources/${resourceId}/share/${userId}`, token, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESOURCES_KEY }),
  })
}
