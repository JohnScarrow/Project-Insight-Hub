// API Base URL - reads from environment or defaults to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Types matching our Prisma schema
export interface User {
  id: string
  email: string
  name: string | null
  defaultRole: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: string
}

export interface Note {
  id: string
  projectId: string
  content: string
  createdAt: string
}

export interface Doc {
  id: string
  projectId: string
  title: string
  url: string
  createdAt: string
}

export interface Connection {
  id: string
  projectId: string | null
  name: string
  type: string
  config: string
  createdAt: string
}

export interface Cost {
  id: string
  projectId: string
  service: string
  amount: number
  period: string
  createdAt: string
}

export interface Task {
  id: string
  projectId: string
  parentId: string | null
  title: string
  completed: boolean
  createdAt: string
  children?: Task[]
  parent?: Task
}

export interface TimeLog {
  id: string
  userId: string
  projectId: string
  taskId: string | null
  duration: number  // in minutes
  notes: string | null
  createdAt: string
}

// API Error type
export interface ApiError {
  error: string
  details?: any
}

// Helper function to handle API calls
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const token = localStorage.getItem('authToken')
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T
    }

    return response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Users API (for simple proof-of-concept auth selection)
export const usersApi = {
  getAll: () => fetchApi<User[]>('/users'),
  getById: (id: string) => fetchApi<User>(`/users/${id}`),
  create: (data: { email: string; name?: string | null }) =>
    fetchApi<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { email?: string; name?: string | null; defaultRole?: string }) =>
    fetchApi<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<void>(`/users/${id}`, { method: 'DELETE' }),
}

// RBAC API
export interface RoleAssignment {
  id: string
  userId: string
  projectId: string
  role: string
  createdAt: string
  user?: { id: string; email: string; name: string | null }
  project?: { id: string; name: string }
}

export const rbacApi = {
  getAll: (filters?: { projectId?: string; userId?: string }) => {
    const params = new URLSearchParams()
    if (filters?.projectId) params.append('projectId', filters.projectId)
    if (filters?.userId) params.append('userId', filters.userId)
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<RoleAssignment[]>(`/rbac${query}`)
  },
  create: (data: { userId: string; projectId: string; role: string }) =>
    fetchApi<RoleAssignment>('/rbac', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { role: string }) =>
    fetchApi<RoleAssignment>(`/rbac/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi<void>(`/rbac/${id}`, { method: 'DELETE' }),
}

// Authentication API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ user: User; token: string; expiresIn: number; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (email: string, password: string, name?: string) =>
    fetchApi<{ user: User; token: string; expiresIn: number; message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  getCurrentUser: () => fetchApi<User>('/auth/me'),
}

// Projects API
export const projectsApi = {
  getAll: () => fetchApi<Project[]>('/projects'),
  
  getById: (id: string) => fetchApi<Project>(`/projects/${id}`),
  
  create: (data: Omit<Project, 'id' | 'createdAt'>) =>
    fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) =>
    fetchApi<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/projects/${id}`, { method: 'DELETE' }),
}

// Notes API
export const notesApi = {
  getAll: (projectId?: string) => {
    const params = projectId ? `?projectId=${projectId}` : ''
    return fetchApi<Note[]>(`/notes${params}`)
  },
  
  getById: (id: string) => fetchApi<Note>(`/notes/${id}`),
  
  create: (data: Omit<Note, 'id' | 'createdAt'>) =>
    fetchApi<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Omit<Note, 'id' | 'createdAt'>>) =>
    fetchApi<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/notes/${id}`, { method: 'DELETE' }),
}

// Docs API
export const docsApi = {
  getAll: (projectId?: string) => {
    const params = projectId ? `?projectId=${projectId}` : ''
    return fetchApi<Doc[]>(`/docs${params}`)
  },
  
  getById: (id: string) => fetchApi<Doc>(`/docs/${id}`),
  
  create: (data: Omit<Doc, 'id' | 'createdAt'>) =>
    fetchApi<Doc>('/docs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Omit<Doc, 'id' | 'createdAt'>>) =>
    fetchApi<Doc>(`/docs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/docs/${id}`, { method: 'DELETE' }),
}

// Connections API
export const connectionsApi = {
  getAll: (projectId?: string) => {
    const params = projectId ? `?projectId=${projectId}` : ''
    return fetchApi<Connection[]>(`/connections${params}`)
  },
  
  getById: (id: string) => fetchApi<Connection>(`/connections/${id}`),
  
  create: (data: Omit<Connection, 'id' | 'createdAt'>) =>
    fetchApi<Connection>('/connections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Omit<Connection, 'id' | 'createdAt'>>) =>
    fetchApi<Connection>(`/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/connections/${id}`, { method: 'DELETE' }),
}

// Costs API
export const costsApi = {
  getAll: (projectId?: string) => {
    const params = projectId ? `?projectId=${projectId}` : ''
    return fetchApi<Cost[]>(`/costs${params}`)
  },
  
  getById: (id: string) => fetchApi<Cost>(`/costs/${id}`),
  
  create: (data: Omit<Cost, 'id' | 'createdAt'>) =>
    fetchApi<Cost>('/costs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Omit<Cost, 'id' | 'createdAt'>>) =>
    fetchApi<Cost>(`/costs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/costs/${id}`, { method: 'DELETE' }),
}

// Tasks API
export const tasksApi = {
  getAll: (projectId?: string) => {
    const params = projectId ? `?projectId=${projectId}` : ''
    return fetchApi<Task[]>(`/tasks${params}`)
  },
  
  getById: (id: string) => fetchApi<Task>(`/tasks/${id}`),
  
  create: (data: Omit<Task, 'id' | 'createdAt' | 'children' | 'parent'>) =>
    fetchApi<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'children' | 'parent'>>) =>
    fetchApi<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/tasks/${id}`, { method: 'DELETE' }),
}

// Audit Logs API
export interface AuditLog {
  id: string
  userId: string | null
  action: string
  resource: string
  resourceId: string | null
  projectId: string | null
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  success: boolean
  errorMessage: string | null
  createdAt: string
}

export const auditLogsApi = {
  getAll: (filters?: { userId?: string; projectId?: string; resource?: string; limit?: number }) => {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.projectId) params.append('projectId', filters.projectId)
    if (filters?.resource) params.append('resource', filters.resource)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<AuditLog[]>(`/auditlogs${query}`)
  },
  
  getById: (id: string) => fetchApi<AuditLog>(`/auditlogs/${id}`),
}

// Time Logs API
export const timeLogsApi = {
  getAll: (filters?: { userId?: string; projectId?: string; taskId?: string }) => {
    const params = new URLSearchParams()
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.projectId) params.append('projectId', filters.projectId)
    if (filters?.taskId) params.append('taskId', filters.taskId)
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi<TimeLog[]>(`/timelogs${query}`)
  },
  
  getById: (id: string) => fetchApi<TimeLog>(`/timelogs/${id}`),
  
  create: (data: Omit<TimeLog, 'id' | 'createdAt'>) =>
    fetchApi<TimeLog>('/timelogs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Omit<TimeLog, 'id' | 'createdAt'>>) =>
    fetchApi<TimeLog>(`/timelogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/timelogs/${id}`, { method: 'DELETE' }),
}
