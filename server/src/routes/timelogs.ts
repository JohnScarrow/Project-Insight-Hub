import { FastifyPluginAsync } from 'fastify'
import { checkProjectRole } from '../middleware/rbac'

const routes: FastifyPluginAsync = async (server) => {
  // Get all time logs (optionally filter by userId, projectId, or taskId)
  server.get('/', async (request, reply) => {
    const { userId, projectId, taskId } = request.query as any
    const where: any = {}
    if (userId) where.userId = userId
    if (projectId) where.projectId = projectId
    if (taskId) where.taskId = taskId
    
    const timeLogs = await server.prisma.timeLog.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    return timeLogs
  })

  // Create a new time log
  server.post('/', { preHandler: async (req, reply) => await checkProjectRole(req, reply, ['Admin', 'Editor']) }, async (request, reply) => {
    const body = request.body as any
    const timelog = await server.prisma.timeLog.create({ data: body })
    reply.code(201)
    return timelog
  })

  // Get a single time log by ID
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as any
    const timeLog = await server.prisma.timeLog.findUnique({ where: { id } })
    if (!timeLog) {
      reply.code(404)
      return { error: 'Time log not found' }
    }
    return timeLog
  })

  // Update a time log
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as any
    const body = request.body as any
    try {
      const timeLog = await server.prisma.timeLog.update({ where: { id }, data: body })
      return timeLog
    } catch (error) {
      reply.code(404)
      return { error: 'Time log not found' }
    }
  })

  // Delete a time log
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as any
    const userId = (request.headers as any)['x-user-id']
    
    // Fetch timelog to get projectId
    const timelog = await server.prisma.timeLog.findUnique({ where: { id } })
    if (!timelog) {
      reply.code(404)
      return { error: 'Time log not found' }
    }
    
    // Check if user is Admin on the project
    const rbac = await server.prisma.rBAC.findFirst({
      where: { userId, projectId: timelog.projectId }
    })
    
    if (!rbac || rbac.role !== 'Admin') {
      reply.code(403)
      return { error: 'Only Admins can delete time logs' }
    }
    
    await server.prisma.timeLog.delete({ where: { id } })
    reply.code(204)
    return
  })
}

export default routes
