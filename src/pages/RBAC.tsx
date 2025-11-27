import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { projectsApi, usersApi, rbacApi, RoleAssignment, User, Project } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Pen, Trash2 } from 'lucide-react'

const roleOptions = ['Admin', 'Editor', 'Viewer', 'NoAccess']

export default function RBAC() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()
  const [projectFilter, setProjectFilter] = useState('all')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({ email: '', name: '' })
  const [newRole, setNewRole] = useState({ userId: '', projectId: '', role: 'Viewer' })

  const { data: users = [] } = useQuery<User[]>({ queryKey: ['users'], queryFn: usersApi.getAll })
  const { data: projects = [] } = useQuery<Project[]>({ queryKey: ['projects'], queryFn: projectsApi.getAll })
  const { data: assignments = [] } = useQuery<RoleAssignment[]>({ queryKey: ['rbac'], queryFn: () => rbacApi.getAll() })

  const createUserMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created')
      setIsAddUserOpen(false)
      setNewUser({ email: '', name: '' })
    },
    onError: () => toast.error('Failed to create user'),
  })

  const createRoleMutation = useMutation({
    mutationFn: rbacApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac'] })
      toast.success('Role assignment created')
      setIsAddRoleOpen(false)
      setNewRole({ userId: '', projectId: '', role: 'Viewer' })
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to assign role'),
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { email?: string; name?: string; defaultRole?: string } }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
      setIsEditUserOpen(false)
      setEditingUser(null)
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update user'),
  })

  const deleteUserMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted')
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to delete user'),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => rbacApi.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac'] })
      toast.success('Role updated')
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update role'),
  })

  const deleteRoleMutation = useMutation({
    mutationFn: rbacApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac'] })
      toast.success('Role assignment deleted')
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to delete role assignment'),
  })

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditUserOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('Delete this user? This will remove all their role assignments.')) {
      deleteUserMutation.mutate(userId)
    }
  }

  // Check if a user is an admin in any project
  const isUserAdmin = (userId: string): boolean => {
    return assignments.some(a => a.userId === userId && a.role === 'Admin')
  }

  // Check if current user is an admin in any project
  const isCurrentUserAdmin = currentUser ? isUserAdmin(currentUser.id) : false

  if (!isCurrentUserAdmin) {
    return (
      <div className="p-8">
        <div className="border rounded-lg p-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">Access denied</h1>
          <p className="text-muted-foreground">You must be an Admin to view this page.</p>
        </div>
      </div>
    )
  }

  // Check if current user can modify another user
  const canModifyUser = (targetUserId: string): boolean => {
    if (!currentUser) return false // No user logged in
    if (currentUser.id === targetUserId) return false // Can't modify self
    if (!isCurrentUserAdmin) return false // Only admins can modify users
    // Admins can modify non-admins and other admins
    return true
  }

  const filteredAssignments = assignments.filter(a => projectFilter === 'all' || a.projectId === projectFilter)

  // Group assignments by user
  const groupedAssignments = filteredAssignments.reduce((acc, assignment) => {
    const userId = assignment.userId
    if (!acc[userId]) {
      acc[userId] = {
        user: assignment.user,
        assignments: []
      }
    }
    acc[userId].assignments.push(assignment)
    return acc
  }, {} as Record<string, { user: RoleAssignment['user']; assignments: RoleAssignment[] }>)

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'default'
      case 'Editor':
        return 'secondary'
      case 'Viewer':
        return 'outline'
      case 'NoAccess':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleRoleChange = (assignmentId: string, newRole: string) => {
    updateRoleMutation.mutate({ id: assignmentId, role: newRole })
  }

  const handleDeleteRole = (assignmentId: string) => {
    if (confirm('Remove this role assignment?')) {
      deleteRoleMutation.mutate(assignmentId)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Role-Based Access Control</h1>
        <p className="text-muted-foreground mt-1">Manage users and their project roles</p>
        {currentUser && (
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Logged in as: </span>
            <span className="font-medium">{currentUser.email}</span>
            {isCurrentUserAdmin ? (
              <Badge variant="default" className="ml-2">Admin</Badge>
            ) : (
              <Badge variant="outline" className="ml-2">Not Admin</Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!newUser.email.trim()) { toast.error('Email required'); return }
                createUserMutation.mutate({ email: newUser.email.trim(), name: newUser.name.trim() || undefined })
              }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
          <DialogTrigger asChild>
            <Button>Add Role</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>User *</Label>
                <Select value={newRole.userId} onValueChange={v => setNewRole({ ...newRole, userId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={newRole.projectId} onValueChange={v => setNewRole({ ...newRole, projectId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={newRole.role} onValueChange={v => setNewRole({ ...newRole, role: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                const { userId, projectId, role } = newRole
                if (!userId || !projectId || !role) { toast.error('All fields required'); return }
                createRoleMutation.mutate({ userId, projectId, role })
              }}>Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Role Assignments by User</h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Project Roles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedAssignments).map(([userId, { user, assignments }]) => (
                <TableRow key={userId}>
                  <TableCell className="font-medium align-top pt-4">
                    {user?.email}
                    {user?.name && <div className="text-sm text-muted-foreground">{user.name}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {assignments.map(assignment => (
                        <div key={assignment.id} className="flex items-center gap-2 p-2 rounded-md border">
                          <span className="text-sm flex-1">{assignment.project?.name}</span>
                          {isCurrentUserAdmin ? (
                            <Select 
                              value={assignment.role} 
                              onValueChange={(role) => handleRoleChange(assignment.id, role)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roleOptions.map(r => (
                                  <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={getRoleBadgeVariant(assignment.role)}>{assignment.role}</Badge>
                          )}
                          {isCurrentUserAdmin && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDeleteRole(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {Object.keys(groupedAssignments).length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground py-6">No assignments</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Default Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => {
                const targetIsAdmin = isUserAdmin(u.id)
                const canModify = canModifyUser(u.id)
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.email}
                      {targetIsAdmin && <Badge variant="default" className="ml-2">Admin</Badge>}
                    </TableCell>
                    <TableCell>{u.name || '-'}</TableCell>
                    <TableCell>
                      {isCurrentUserAdmin ? (
                        <Select 
                          value={u.defaultRole} 
                          onValueChange={(role) => updateUserMutation.mutate({ id: u.id, data: { defaultRole: role } })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map(r => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getRoleBadgeVariant(u.defaultRole)}>{u.defaultRole}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {canModify && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(u)}>
                            <Pen className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">No users</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!editingUser?.email.trim()) { toast.error('Email required'); return }
              updateUserMutation.mutate({ id: editingUser.id, data: { email: editingUser.email, name: editingUser.name } })
            }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
