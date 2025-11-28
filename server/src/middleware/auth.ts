import { FastifyPluginAsync } from 'fastify'
import jwt from 'jsonwebtoken'

declare module 'fastify' {
  interface FastifyRequest {
    authUserId?: string
    authRole?: string
  }
}

const authPlugin: FastifyPluginAsync = async (server) => {
  server.addHook('preHandler', async (request, reply) => {
    // Only process if route opts in via config.auth === true
    const requiresAuth = (request.routeOptions.config as any)?.auth === true
    if (!requiresAuth) return

    const header = (request.headers.authorization || '').trim()
    if (!header.startsWith('Bearer ')) {
      reply.code(401)
      throw new Error('Missing bearer token')
    }
    const token = header.slice(7)
    const secret = process.env.JWT_SECRET
    if (!secret) {
      reply.code(500)
      throw new Error('JWT secret not configured')
    }
    try {
      const decoded = jwt.verify(token, secret) as any
      request.authUserId = decoded.sub
      request.authRole = decoded.role
    } catch (e) {
      reply.code(401)
      throw new Error('Invalid or expired token')
    }
  })
}

export default authPlugin