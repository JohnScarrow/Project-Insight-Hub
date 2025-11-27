import { FastifyPluginAsync } from 'fastify'
import { checkProjectRole } from '../middleware/rbac'

const routes: FastifyPluginAsync = async (server) => {
  // Get all connections (optionally filter by projectId)
  server.get('/', async (request, reply) => {
    const { projectId } = request.query as any
    const where = projectId ? { projectId } : {}
    const connections = await server.prisma.connection.findMany({ where, orderBy: { createdAt: 'desc' } })
    return connections
  })

  // Create a new connection
  server.post('/', { preHandler: async (req, reply) => await checkProjectRole(req, reply, ['Admin', 'Editor']) }, async (request, reply) => {
    const body = request.body as any
    const connection = await server.prisma.connection.create({ data: body })
    reply.code(201)
    return connection
  })

  // Get a single connection by ID
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as any
    const connection = await server.prisma.connection.findUnique({ where: { id } })
    if (!connection) {
      reply.code(404)
      return { error: 'Connection not found' }
    }
    return connection
  })

  // Update a connection
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as any
    const body = request.body as any
    try {
      const connection = await server.prisma.connection.update({ where: { id }, data: body })
      return connection
    } catch (error) {
      reply.code(404)
      return { error: 'Connection not found' }
    }
  })

  // Delete a connection
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as any
    const userId = request.headers['x-user-id'] as string

    try {
      // Fetch the connection first to get projectId
      const connection = await server.prisma.connection.findUnique({ where: { id } })
      if (!connection) {
        reply.code(404)
        return { error: 'Connection not found' }
      }

      // Check if user has Admin role on this project (if connection has projectId)
      if (userId && connection.projectId) {
        const roleAssignment = await server.prisma.rBAC.findFirst({
          where: { userId, projectId: connection.projectId },
        })
        if (!roleAssignment || roleAssignment.role !== 'Admin') {
          reply.code(403)
          return { error: 'Admin role required to delete connections' }
        }
      }

      await server.prisma.connection.delete({ where: { id } })
      reply.code(204)
      return
    } catch (error: any) {
      reply.code(500)
      return { error: error.message || 'Failed to delete connection' }
    }
  })
}

export default routes
