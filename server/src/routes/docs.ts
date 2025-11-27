import { FastifyPluginAsync } from 'fastify'
import { checkProjectRole } from '../middleware/rbac'

const routes: FastifyPluginAsync = async (server) => {
  // Get all docs (optionally filter by projectId)
  server.get('/', async (request, reply) => {
    const { projectId } = request.query as any
    const where = projectId ? { projectId } : {}
    const docs = await server.prisma.doc.findMany({ where, orderBy: { createdAt: 'desc' } })
    return docs
  })

  // Create a new doc
  server.post('/', { preHandler: async (req, reply) => await checkProjectRole(req, reply, ['Admin', 'Editor']) }, async (request, reply) => {
    const body = request.body as any
    const doc = await server.prisma.doc.create({ data: body })
    reply.code(201)
    return doc
  })

  // Get a single doc by ID
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as any
    const doc = await server.prisma.doc.findUnique({ where: { id } })
    if (!doc) {
      reply.code(404)
      return { error: 'Doc not found' }
    }
    return doc
  })

  // Update a doc
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as any
    const body = request.body as any
    try {
      const doc = await server.prisma.doc.update({ where: { id }, data: body })
      return doc
    } catch (error) {
      reply.code(404)
      return { error: 'Doc not found' }
    }
  })

  // Delete a doc
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as any
    const userId = request.headers['x-user-id'] as string

    try {
      // Fetch the doc first to get projectId
      const doc = await server.prisma.doc.findUnique({ where: { id } })
      if (!doc) {
        reply.code(404)
        return { error: 'Doc not found' }
      }

      // Check if user has Admin role on this project
      if (userId) {
        const roleAssignment = await server.prisma.rBAC.findFirst({
          where: { userId, projectId: doc.projectId },
        })
        if (!roleAssignment || roleAssignment.role !== 'Admin') {
          reply.code(403)
          return { error: 'Admin role required to delete docs' }
        }
      }

      await server.prisma.doc.delete({ where: { id } })
      reply.code(204)
      return
    } catch (error: any) {
      reply.code(500)
      return { error: error.message || 'Failed to delete doc' }
    }
  })
}

export default routes
