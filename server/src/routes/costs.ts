import { FastifyPluginAsync } from 'fastify'
import { checkProjectRole } from '../middleware/rbac'

const routes: FastifyPluginAsync = async (server) => {
  // Get all costs (optionally filter by projectId)
  server.get('/', async (request, reply) => {
    const { projectId } = request.query as any
    const where = projectId ? { projectId } : {}
    const costs = await server.prisma.cost.findMany({ where, orderBy: { createdAt: 'desc' } })
    return costs
  })

  // Create a new cost
  server.post('/', { preHandler: async (req, reply) => await checkProjectRole(req, reply, ['Admin', 'Editor']) }, async (request, reply) => {
    const body = request.body as any
    const cost = await server.prisma.cost.create({ data: body })
    reply.code(201)
    return cost
  })

  // Get a single cost by ID
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as any
    const cost = await server.prisma.cost.findUnique({ where: { id } })
    if (!cost) {
      reply.code(404)
      return { error: 'Cost not found' }
    }
    return cost
  })

  // Update a cost
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as any
    const body = request.body as any
    try {
      const cost = await server.prisma.cost.update({ where: { id }, data: body })
      return cost
    } catch (error) {
      reply.code(404)
      return { error: 'Cost not found' }
    }
  })

  // Delete a cost
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as any
    const userId = request.headers['x-user-id'] as string

    try {
      // Fetch the cost first to get projectId
      const cost = await server.prisma.cost.findUnique({ where: { id } })
      if (!cost) {
        reply.code(404)
        return { error: 'Cost not found' }
      }

      // Check if user has Admin role on this project
      if (userId) {
        const roleAssignment = await server.prisma.rBAC.findFirst({
          where: { userId, projectId: cost.projectId },
        })
        if (!roleAssignment || roleAssignment.role !== 'Admin') {
          reply.code(403)
          return { error: 'Admin role required to delete costs' }
        }
      }

      await server.prisma.cost.delete({ where: { id } })
      reply.code(204)
      return
    } catch (error: any) {
      reply.code(500)
      return { error: error.message || 'Failed to delete cost' }
    }
  })
}

export default routes
