import { FastifyRequest, FastifyReply } from 'fastify'

// Simple RBAC middleware for proof of concept
// In production, this would use JWT tokens from Authorization header

export async function checkProjectRole(
  request: FastifyRequest,
  reply: FastifyReply,
  requiredRoles: string[]
) {
  const params = request.params as { projectId?: string }
  const body = request.body as { projectId?: string }
  const projectId = params.projectId || body.projectId
  const userId = request.headers['x-user-id'] as string

  if (!userId) {
    reply.code(401)
    return reply.send({ error: 'User ID required in x-user-id header' })
  }

  if (!projectId) {
    reply.code(400)
    return reply.send({ error: 'Project ID required' })
  }

  // Check if user has role on project
  const roleAssignment = await request.server.prisma.rBAC.findFirst({
    where: {
      userId,
      projectId,
    },
  })

  if (!roleAssignment) {
    reply.code(403)
    return reply.send({ error: 'No access to this project' })
  }

  if (!requiredRoles.includes(roleAssignment.role)) {
    reply.code(403)
    return reply.send({ error: `Required role: ${requiredRoles.join(' or ')}` })
  }

  // Attach role to request for use in route handlers
  ;(request as any).userRole = roleAssignment.role
}

export const roleHierarchy: Record<string, string[]> = {
  Admin: ['Admin', 'Editor', 'Viewer'],
  Editor: ['Editor', 'Viewer'],
  Viewer: ['Viewer'],
  NoAccess: [],
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  return roleHierarchy[userRole as keyof typeof roleHierarchy]?.includes(requiredRole) || false
}
