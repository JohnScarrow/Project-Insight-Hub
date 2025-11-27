import { createContext, useContext, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import { rbacApi, RoleAssignment } from '@/lib/api'

interface RoleContextValue {
  getUserRole: (projectId: string) => string | null
  hasRole: (projectId: string, role: string) => boolean
  canEdit: (projectId: string) => boolean
  canDelete: (projectId: string) => boolean
  isAdmin: (projectId: string) => boolean
  isGlobalAdmin: () => boolean
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  
  const { data: assignments = [] } = useQuery<RoleAssignment[]>({
    queryKey: ['user-roles', user?.id],
    queryFn: () => (user ? rbacApi.getAll({ userId: user.id }) : Promise.resolve([])),
    enabled: !!user,
  })

  const getUserRole = (projectId: string): string | null => {
    const assignment = assignments.find(a => a.projectId === projectId)
    // Fallback to user's defaultRole if no project-specific assignment exists
    const role = assignment?.role || user?.defaultRole || null
    console.log('[RoleContext] getUserRole for project', projectId, ':', role, 'from assignment:', assignment, 'or defaultRole:', user?.defaultRole)
    return role
  }

  const hasRole = (projectId: string, role: string): boolean => {
    const userRole = getUserRole(projectId)
    console.log('[RoleContext] hasRole check - userRole:', userRole, 'required:', role)
    if (!userRole) return false
    
    // Role hierarchy: Admin > Editor > Viewer; NoAccess has no permissions
    const hierarchy: Record<string, string[]> = {
      Admin: ['Admin', 'Editor', 'Viewer'],
      Editor: ['Editor', 'Viewer'],
      Viewer: ['Viewer'],
      NoAccess: [],
    }
    
    const hasPermission = hierarchy[userRole]?.includes(role) || false
    console.log('[RoleContext] hasRole result:', hasPermission, 'hierarchy for', userRole, ':', hierarchy[userRole])
    return hasPermission
  }

  const canEdit = (projectId: string): boolean => {
    return hasRole(projectId, 'Editor')
  }

  const canDelete = (projectId: string): boolean => {
    return hasRole(projectId, 'Admin')
  }

  const isAdmin = (projectId: string): boolean => {
    return getUserRole(projectId) === 'Admin'
  }

  const isGlobalAdmin = (): boolean => {
    if (user?.defaultRole === 'Admin') return true
    return assignments.some(a => a.role === 'Admin')
  }

  return (
    <RoleContext.Provider value={{ getUserRole, hasRole, canEdit, canDelete, isAdmin, isGlobalAdmin }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
