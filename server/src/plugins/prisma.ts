import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const prisma = new PrismaClient()

export default fp(async (server) => {
  server.decorate('prisma', prisma)

  server.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
})
