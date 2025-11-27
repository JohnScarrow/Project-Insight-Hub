import { FastifyPluginAsync } from 'fastify'
import { checkProjectRole } from '../middleware/rbac'

const routes: FastifyPluginAsync = async (server) => {
  // Get all tasks (optionally filter by projectId, include children)
  server.get('/', async (request, reply) => {
    const { projectId } = request.query as any
    const where = projectId ? { projectId } : {}
    const tasks = await server.prisma.task.findMany({
      where,
      include: { children: true, parent: true },
      orderBy: { createdAt: 'desc' }
    })
    return tasks
  })

  // Create a new task
  server.post('/', { preHandler: async (req, reply) => await checkProjectRole(req, reply, ['Admin', 'Editor']) }, async (request, reply) => {
    const body = request.body as any
    const task = await server.prisma.task.create({ data: body })
    reply.code(201)
    return task
  })

  // Get a single task by ID (with children and parent)
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as any
    const task = await server.prisma.task.findUnique({
      where: { id },
      include: { children: true, parent: true }
    })
    if (!task) {
      reply.code(404)
      return { error: 'Task not found' }
    }
    return task
  })

  // Update a task
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as any
    const body = request.body as any
    try {
      const task = await server.prisma.task.update({ where: { id }, data: body })
      return task
    } catch (error) {
      reply.code(404)
      return { error: 'Task not found' }
    }
  })

  // Delete a task
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as any
    const userId = request.headers['x-user-id'] as string

    try {
      // Fetch the task first to get projectId
      const task = await server.prisma.task.findUnique({ where: { id } })
      if (!task) {
        reply.code(404)
        return { error: 'Task not found' }
      }

      // Check if user has Admin role on this project
      if (userId) {
        const roleAssignment = await server.prisma.rBAC.findFirst({
          where: { userId, projectId: task.projectId },
        })
        if (!roleAssignment || roleAssignment.role !== 'Admin') {
          reply.code(403)
          return { error: 'Admin role required to delete tasks' }
        }
      }

      await server.prisma.task.delete({ where: { id } })
      reply.code(204)
      return
    } catch (error: any) {
      reply.code(500)
      return { error: error.message || 'Failed to delete task' }
    }
  })
}

export default routes
