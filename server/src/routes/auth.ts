import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcrypt'

const routes: FastifyPluginAsync = async (server) => {
  // Login endpoint
  server.post('/login', async (request, reply) => {
    const { email, password } = request.body as any

    if (!email || !password) {
      reply.code(400)
      return { error: 'Email and password required' }
    }

    const user = await server.prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      reply.code(401)
      return { error: 'Invalid credentials' }
    }

    const validPassword = await bcrypt.compare(password, user.password)
    
    if (!validPassword) {
      reply.code(401)
      return { error: 'Invalid credentials' }
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    
    return {
      user: userWithoutPassword,
      message: 'Login successful'
    }
  })

  // Signup endpoint
  server.post('/signup', async (request, reply) => {
    const { email, password, name } = request.body as any

    if (!email || !password) {
      reply.code(400)
      return { error: 'Email and password required' }
    }

    // Check if user already exists
    const existingUser = await server.prisma.user.findUnique({ where: { email } })
    
    if (existingUser) {
      reply.code(409)
      return { error: 'User already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await server.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      }
    })

    const { password: _, ...userWithoutPassword } = user

    reply.code(201)
    return {
      user: userWithoutPassword,
      message: 'User created successfully'
    }
  })

  // Create admin user (protected endpoint - only for initial setup)
  server.post('/create-admin', async (request, reply) => {
    const { email, password, name } = request.body as any

    if (!email || !password) {
      reply.code(400)
      return { error: 'Email and password required' }
    }

    // Check if user already exists
    const existingUser = await server.prisma.user.findUnique({ where: { email } })
    
    if (existingUser) {
      reply.code(409)
      return { error: 'User already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const user = await server.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        defaultRole: 'Admin'
      }
    })

    const { password: _, ...userWithoutPassword } = user

    reply.code(201)
    return {
      user: userWithoutPassword,
      message: 'Admin user created successfully'
    }
  })

  // Get current user (placeholder - would normally use JWT token)
  server.get('/me', async (request, reply) => {
    // In a real app, you'd decode JWT from Authorization header.
    // For the POC, allow the frontend to send `x-user-id` to identify the current user.
    const headerUserId = (request.headers as any)['x-user-id'] as string | undefined

    let user
    if (headerUserId) {
      user = await server.prisma.user.findUnique({ where: { id: headerUserId } })
    }

    // Fallback to seeded admin user if header not provided or user not found
    if (!user) {
      user = await server.prisma.user.findUnique({ where: { email: 'jdeegan@gainclarity.com' } })
    }

    if (!user) {
      reply.code(404)
      return { error: 'User not found' }
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  })
}

export default routes
