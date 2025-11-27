import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcrypt'

const usersRoutes: FastifyPluginAsync = async (server) => {
  // List all users (exclude password)
  server.get('/', async () => {
    let users = await server.prisma.user.findMany()

    // Autoseed placeholder users if none exist
    if (users.length === 0) {
      const sample = [
        { email: 'jason@clarityai.com', name: 'Jason Deegan' },
        { email: 'admin@example.com', name: 'Admin User' },
        { email: 'manager@example.com', name: 'Project Manager' },
        { email: 'engineer@example.com', name: 'Software Engineer' },
        { email: 'analyst@example.com', name: 'Data Analyst' },
        { email: 'designer@example.com', name: 'Product Designer' },
      ]
      const hashed = await bcrypt.hash('password', 10)
      await server.prisma.$transaction(
        sample.map((s) =>
          server.prisma.user.create({ data: { email: s.email, name: s.name, password: hashed } })
        )
      )
      users = await server.prisma.user.findMany()
      
      // Assign Jason Deegan as Admin to all projects
      const jasonUser = users.find(u => u.email === 'jason@clarityai.com')
      if (jasonUser) {
        const projects = await server.prisma.project.findMany()
        await server.prisma.$transaction(
          projects.map(p =>
            server.prisma.rBAC.create({
              data: {
                userId: jasonUser.id,
                projectId: p.id,
                role: 'Admin'
              }
            })
          )
        )
      }
    }
    return users.map(({ password, ...rest }) => rest)
  })

  // Get user by id (exclude password)
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = await server.prisma.user.findUnique({ where: { id } })
    if (!user) {
      reply.code(404)
      return { error: 'User not found' }
    }
    const { password, ...rest } = user
    return rest
  })

  // Create user (password default "password")
  server.post('/', async (request, reply) => {
    const { email, name } = request.body as { email?: string; name?: string }
    if (!email) {
      reply.code(400)
      return { error: 'email is required' }
    }
    const existing = await server.prisma.user.findUnique({ where: { email } })
    if (existing) {
      reply.code(409)
      return { error: 'Email already in use' }
    }
    const hashed = await bcrypt.hash('password', 10)
    const created = await server.prisma.user.create({ data: { email, name: name || null, password: hashed } })
    const { password, ...rest } = created
    reply.code(201)
    return rest
  })

  // Update user (email, name, defaultRole)
  server.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { email, name, defaultRole } = request.body as { email?: string; name?: string; defaultRole?: string }
    const currentUserId = request.headers['x-user-id'] as string | undefined

    if (!email && !name && !defaultRole) {
      reply.code(400)
      return { error: 'Provide email, name, or defaultRole to update' }
    }

    // Check if target user is an admin
    const targetUserRoles = await server.prisma.rBAC.findMany({ where: { userId: id } })
    const targetIsAdmin = targetUserRoles.some(r => r.role === 'Admin')

    // Check if current user is an admin
    if (currentUserId) {
      const currentUserRoles = await server.prisma.rBAC.findMany({ where: { userId: currentUserId } })
      const currentIsAdmin = currentUserRoles.some(r => r.role === 'Admin')

      // Non-admins cannot modify admin users
      if (targetIsAdmin && !currentIsAdmin) {
        reply.code(403)
        return { error: 'Only admins can modify admin users' }
      }
    }

    if (email) {
      const existing = await server.prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== id) {
        reply.code(409)
        return { error: 'Email already in use' }
      }
    }
    const updateData: any = {}
    if (email) updateData.email = email
    if (name) updateData.name = name
    if (defaultRole) updateData.defaultRole = defaultRole
    
    const updated = await server.prisma.user.update({ where: { id }, data: updateData })
    const { password, ...rest } = updated
    return rest
  })

  // Delete user
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const currentUserId = request.headers['x-user-id'] as string | undefined

    // Check if target user is an admin
    const targetUserRoles = await server.prisma.rBAC.findMany({ where: { userId: id } })
    const targetIsAdmin = targetUserRoles.some(r => r.role === 'Admin')

    // Check if current user is an admin
    if (currentUserId) {
      const currentUserRoles = await server.prisma.rBAC.findMany({ where: { userId: currentUserId } })
      const currentIsAdmin = currentUserRoles.some(r => r.role === 'Admin')

      // Non-admins cannot delete admin users
      if (targetIsAdmin && !currentIsAdmin) {
        reply.code(403)
        return { error: 'Only admins can delete admin users' }
      }
    }

    await server.prisma.user.delete({ where: { id } })
    reply.code(204)
  })
}

export default usersRoutes