import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
    
    const secret = process.env.JWT_SECRET
    if (!secret) {
      reply.code(500)
      return { error: 'JWT secret not configured' }
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.defaultRole,
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { expiresIn: '15m' }
    )

    return {
      user: userWithoutPassword,
      token,
      expiresIn: 900,
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

    const secret = process.env.JWT_SECRET
    if (!secret) {
      reply.code(500)
      return { error: 'JWT secret not configured' }
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.defaultRole,
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { expiresIn: '15m' }
    )

    reply.code(201)
    return {
      user: userWithoutPassword,
      token,
      expiresIn: 900,
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

    const secret = process.env.JWT_SECRET
    if (!secret) {
      reply.code(500)
      return { error: 'JWT secret not configured' }
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.defaultRole,
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { expiresIn: '15m' }
    )

    reply.code(201)
    return {
      user: userWithoutPassword,
      token,
      expiresIn: 900,
      message: 'Admin user created successfully'
    }
  })

  // Get current user (placeholder - would normally use JWT token)
  server.get('/me', async (request, reply) => {
    const auth = (request.headers.authorization || '').trim()
    if (!auth.startsWith('Bearer ')) {
      reply.code(401)
      return { error: 'Missing bearer token' }
    }
    const token = auth.slice(7)
    const secret = process.env.JWT_SECRET
    if (!secret) {
      reply.code(500)
      return { error: 'JWT secret not configured' }
    }
    try {
      const decoded = jwt.verify(token, secret) as any
      const user = await server.prisma.user.findUnique({ where: { id: decoded.sub } })
      if (!user) {
        reply.code(404)
        return { error: 'User not found' }
      }
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (e) {
      reply.code(401)
      return { error: 'Invalid or expired token' }
    }
  })
}

export default routes
