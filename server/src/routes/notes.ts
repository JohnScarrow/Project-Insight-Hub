import { FastifyPluginAsync } from 'fastify'
import { checkProjectRole } from '../middleware/rbac'
import { logAudit } from '../middleware/audit'

const routes: FastifyPluginAsync = async (server) => {
  // Get all notes (optionally filter by projectId via query param)
  server.get('/', async (request, reply) => {
    const { projectId } = request.query as any
    const where = projectId ? { projectId } : {}
    const notes = await server.prisma.note.findMany({ where, orderBy: { createdAt: 'desc' } })
    return notes
  })

  // Create a new note
  server.post('/', { preHandler: async (req, reply) => await checkProjectRole(req, reply, ['Admin', 'Editor']) }, async (request, reply) => {
    const body = request.body as any
    const userId = (request.headers as any)['x-user-id']
    
    try {
      // Simulate server error for testing audit logs
      if (body.content && body.content.toLowerCase().includes('test error')) {
        throw new Error('Simulated server error: Invalid note content')
      }
      
      const note = await server.prisma.note.create({ data: body })
      
      await logAudit(server.prisma, {
        userId,
        action: 'CREATE',
        resource: 'note',
        resourceId: note.id,
        projectId: body.projectId,
        details: `Created note with content: ${body.content.substring(0, 50)}...`,
        success: true,
        request,
      })
      
      reply.code(201)
      return note
    } catch (error: any) {
      await logAudit(server.prisma, {
        userId,
        action: 'CREATE',
        resource: 'note',
        projectId: body.projectId,
        details: `Attempted to create note`,
        success: false,
        errorMessage: error.message,
        request,
      })
      
      reply.code(500)
      return { error: error.message || 'Failed to create note' }
    }
  })

  // Get a single note by ID
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as any
    const note = await server.prisma.note.findUnique({ where: { id } })
    if (!note) {
      reply.code(404)
      return { error: 'Note not found' }
    }
    return note
  })

  // Update a note
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as any
    const body = request.body as any
    try {
      const note = await server.prisma.note.update({ where: { id }, data: body })
      return note
    } catch (error) {
      reply.code(404)
      return { error: 'Note not found' }
    }
  })

  // Delete a note
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as any
    const userId = (request.headers as any)['x-user-id']
    
    try {
      // Fetch note to get projectId
      const note = await server.prisma.note.findUnique({ where: { id } })
      if (!note) {
        reply.code(404)
        return { error: 'Note not found' }
      }
      
      // Check if user is Admin on the project
      const rbac = await server.prisma.rBAC.findFirst({
        where: { userId, projectId: note.projectId }
      })
      
      if (!rbac || rbac.role !== 'Admin') {
        await logAudit(server.prisma, {
          userId,
          action: 'DELETE',
          resource: 'note',
          resourceId: id,
          projectId: note.projectId,
          details: `Attempted to delete note without Admin permission`,
          success: false,
          errorMessage: 'Insufficient permissions',
          request,
        })
        
        reply.code(403)
        return { error: 'Only Admins can delete notes' }
      }
      
      await server.prisma.note.delete({ where: { id } })
      
      await logAudit(server.prisma, {
        userId,
        action: 'DELETE',
        resource: 'note',
        resourceId: id,
        projectId: note.projectId,
        details: `Deleted note`,
        success: true,
        request,
      })
      
      reply.code(204)
      return
    } catch (error: any) {
      await logAudit(server.prisma, {
        userId,
        action: 'DELETE',
        resource: 'note',
        resourceId: id,
        details: `Attempted to delete note`,
        success: false,
        errorMessage: error.message,
        request,
      })
      
      reply.code(500)
      return { error: error.message || 'Failed to delete note' }
    }
  })
}

export default routes
