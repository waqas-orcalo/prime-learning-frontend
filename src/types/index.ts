// ── Auth ──────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: 'learner' | 'trainer' | 'admin'
  avatar?: string
}

export interface AuthSession {
  user: User
  token: string
  expires: string
}

// ── Tasks ─────────────────────────────────────────────────────────────────
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
  assignedBy: string
  description?: string
  createdAt: string
  updatedAt: string
}

// ── Messages ──────────────────────────────────────────────────────────────
export interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  read: boolean
}

export interface Contact {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  statusColor: string
  online: boolean
}

// ── Learning Activities ───────────────────────────────────────────────────
export interface LearningEntry {
  id: string
  title: string
  category: string
  dateFrom: string
  dateTo: string
  duration: number
  offTheJob: boolean
  activityType: 'on_job' | 'off_job'
  reflection?: string
  recordedBy: string
  createdAt: string
}

// ── Learning Journals ─────────────────────────────────────────────────────
export interface JournalEntry {
  id: string
  title: string
  category: string
  date: string        // YYYY-MM-DD
  timeHH: string
  timeMM: string
  amPm: 'AM' | 'PM'
  durationHH: string
  durationMM: string
  offJob: boolean
  onJob: boolean
  reflection: string
  privacy: 'only_me' | 'everyone'
  files: string[]
  createdAt: string
  updatedAt: string
}

// ── UI / Common ───────────────────────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  icon: string
  children?: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterState {
  search: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
