import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, FilterState, PaginationState } from '@/types'

// ── Slices ──────────────────────────────────────────────────────────────────

interface AuthSlice {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  clearAuth: () => void
}

interface UISlice {
  sidebarCollapsed: boolean
  activeModal: string | null
  toasts: Toast[]
  toggleSidebar: () => void
  openModal: (id: string) => void
  closeModal: () => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

interface TasksSlice {
  filter: FilterState
  pagination: PaginationState
  selectedTaskIds: string[]
  setFilter: (f: Partial<FilterState>) => void
  setPagination: (p: Partial<PaginationState>) => void
  toggleTaskSelection: (id: string) => void
  clearSelection: () => void
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

// ── Combined Store ──────────────────────────────────────────────────────────

interface AppStore extends AuthSlice, UISlice, TasksSlice {}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Auth
        user: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        clearAuth: () => set({ user: null, isAuthenticated: false }),

        // UI
        sidebarCollapsed: false,
        activeModal: null,
        toasts: [],
        toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
        openModal: (id) => set({ activeModal: id }),
        closeModal: () => set({ activeModal: null }),
        addToast: (toast) => set((s) => ({
          toasts: [...s.toasts, { ...toast, id: Date.now().toString() }],
        })),
        removeToast: (id) => set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        })),

        // Tasks
        filter: { search: '', status: '', dateFrom: '', dateTo: '' },
        pagination: { page: 1, pageSize: 10, total: 0 },
        selectedTaskIds: [],
        setFilter: (f) => set((s) => ({ filter: { ...s.filter, ...f } })),
        setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),
        toggleTaskSelection: (id) => set((s) => ({
          selectedTaskIds: s.selectedTaskIds.includes(id)
            ? s.selectedTaskIds.filter((i) => i !== id)
            : [...s.selectedTaskIds, id],
        })),
        clearSelection: () => set({ selectedTaskIds: [] }),
      }),
      {
        name: 'prime-learning-store',
        partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
      }
    ),
    { name: 'PrimeLearning' }
  )
)
