import { FastifyPluginAsync } from 'fastify'

const auditRoutes: FastifyPluginAsync = async (server) => {
  // Get audit logs (admin only for now - could filter by user in production)
  server.get('/', async (request, reply) => {
    const { projectId, userId, resource, limit = '100' } = request.query as {
      projectId?: string
      userId?: string
      resource?: string
      limit?: string
    }

    const where: any = {}
    if (projectId) where.projectId = projectId
    if (userId) where.userId = userId
    if (resource) where.resource = resource

    const logs = await server.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    })

    return logs
  })

  // Get single audit log
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const log = await server.prisma.auditLog.findUnique({ where: { id } })
    
    if (!log) {
      reply.code(404)
      return { error: 'Audit log not found' }
    }

    return log
  })
}

export default auditRoutes
