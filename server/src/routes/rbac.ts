import { FastifyPluginAsync } from 'fastify'

const rbacRoutes: FastifyPluginAsync = async (server) => {
  // List role assignments with optional filters
  server.get('/', async (request) => {
    const { projectId, userId } = request.query as { projectId?: string; userId?: string }
    const where: any = {}
    if (projectId) where.projectId = projectId
    if (userId) where.userId = userId
    const roles = await server.prisma.rBAC.findMany({
      where,
      include: {
        project: true,
        user: true,
      },
    })
    return roles.map(r => ({
      id: r.id,
      role: r.role,
      projectId: r.projectId,
      userId: r.userId,
      createdAt: r.createdAt,
      project: r.project ? { id: r.project.id, name: r.project.name } : null,
      user: r.user ? { id: r.user.id, email: r.user.email, name: r.user.name } : null,
    }))
  })

  // Create role assignment
  server.post('/', async (request, reply) => {
    const { userId, projectId, role } = request.body as { userId: string; projectId: string; role: string }
    if (!userId || !projectId || !role) {
      reply.code(400)
      return { error: 'userId, projectId and role are required' }
    }
    // Prevent duplicate assignment
    const existing = await server.prisma.rBAC.findFirst({ where: { userId, projectId } })
    if (existing) {
      reply.code(409)
      return { error: 'Role already assigned for this user & project' }
    }
    const created = await server.prisma.rBAC.create({ data: { userId, projectId, role } })
    return created
  })

  // Update role assignment
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { role } = request.body as { role?: string }
    if (!role) {
      reply.code(400)
      return { error: 'role is required' }
    }
    const updated = await server.prisma.rBAC.update({ where: { id }, data: { role } })
    return updated
  })

  // Delete role assignment
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await server.prisma.rBAC.delete({ where: { id } })
    reply.code(204)
  })
}

export default rbacRoutes