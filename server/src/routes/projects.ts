import { FastifyPluginAsync } from 'fastify'

const routes: FastifyPluginAsync = async (server) => {
  // List projects visible to the current user
  server.get('/', async (request, reply) => {
    const userId = request.headers['x-user-id'] as string | undefined
    if (!userId) {
      reply.code(401)
      return { error: 'User ID required in x-user-id header' }
    }

    // Projects where user is owner
    const ownedProjects = await server.prisma.project.findMany({
      where: { ownerId: userId },
    })

    // RBAC assignments where user has at least Viewer (exclude NoAccess)
    const assignments = await server.prisma.rBAC.findMany({
      where: {
        userId,
        role: { in: ['Admin', 'Editor', 'Viewer'] },
      },
      select: { projectId: true },
    })

    const assignedProjectIds = assignments.map(a => a.projectId)

    const assignedProjects = assignedProjectIds.length
      ? await server.prisma.project.findMany({ where: { id: { in: assignedProjectIds } } })
      : []

    // Merge and de-duplicate projects
    const map = new Map<string, any>()
    for (const p of [...ownedProjects, ...assignedProjects]) map.set(p.id, p)
    return Array.from(map.values())
  })

  server.post('/', async (request, reply) => {
    const body = request.body as any
    const project = await server.prisma.project.create({ data: body })
    reply.code(201)
    return project
  })

  // Get a single project if visible to current user
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as any
    const userId = request.headers['x-user-id'] as string | undefined
    if (!userId) {
      reply.code(401)
      return { error: 'User ID required in x-user-id header' }
    }

    const project = await server.prisma.project.findUnique({ where: { id } })
    if (!project) {
      reply.code(404)
      return { error: 'Not found' }
    }

    // Allow if owner
    if (project.ownerId === userId) return project

    // Check RBAC visibility (exclude NoAccess)
    const assignment = await server.prisma.rBAC.findFirst({
      where: { userId, projectId: id },
    })

    if (!assignment || assignment.role === 'NoAccess') {
      reply.code(403)
      return { error: 'No access to this project' }
    }

    return project
  })

  server.put('/:id', async (request, reply) => {
    const { id } = request.params as any
    const body = request.body as any
    const project = await server.prisma.project.update({ where: { id }, data: body })
    return project
  })

  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as any
    await server.prisma.project.delete({ where: { id } })
    reply.code(204)
    return
  })
}

export default routes
