import Fastify from 'fastify'
import dotenv from 'dotenv'
import cors from '@fastify/cors'
import prismaPlugin from './plugins/prisma'
import projectsRoutes from './routes/projects'
import notesRoutes from './routes/notes'
import docsRoutes from './routes/docs'
import connectionsRoutes from './routes/connections'
import costsRoutes from './routes/costs'
import tasksRoutes from './routes/tasks'
import timelogsRoutes from './routes/timelogs'
import authRoutes from './routes/auth'
import usersRoutes from './routes/users'
import rbacRoutes from './routes/rbac'
import auditLogsRoutes from './routes/auditlogs'

dotenv.config()

const server = Fastify({ logger: true })

await server.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
})

await server.register(prismaPlugin)

// Health check endpoint for monitoring and deployment
server.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

server.get('/api/health', async (request, reply) => {
  try {
    // Check database connection
    await server.prisma.$queryRaw`SELECT 1`
    return { 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    }
  } catch (error) {
    reply.code(503)
    return { 
      status: 'unhealthy', 
      database: 'disconnected',
      timestamp: new Date().toISOString() 
    }
  }
})

// Register all routes
await server.register(projectsRoutes, { prefix: '/api/projects' })
await server.register(notesRoutes, { prefix: '/api/notes' })
await server.register(docsRoutes, { prefix: '/api/docs' })
await server.register(connectionsRoutes, { prefix: '/api/connections' })
await server.register(costsRoutes, { prefix: '/api/costs' })
await server.register(tasksRoutes, { prefix: '/api/tasks' })
await server.register(timelogsRoutes, { prefix: '/api/timelogs' })
await server.register(authRoutes, { prefix: '/api/auth' })
await server.register(usersRoutes, { prefix: '/api/users' })
await server.register(rbacRoutes, { prefix: '/api/rbac' })
await server.register(auditLogsRoutes, { prefix: '/api/auditlogs' })

const port = Number(process.env.PORT || 4000)

try {
  await server.listen({ port, host: '0.0.0.0' })
  server.log.info(`Server listening on http://0.0.0.0:${port}`)
} catch (err) {
  server.log.error(err)
  process.exit(1)
}
