import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __PIH_PRISMA__: PrismaClient | undefined
}

const prisma = global.__PIH_PRISMA__ ?? new PrismaClient()
if (!global.__PIH_PRISMA__) global.__PIH_PRISMA__ = prisma

export default fp(async (server) => {
  server.decorate('prisma', prisma)

  server.addHook('onClose', async () => {
    try {
      await prisma.$disconnect()
    } catch (e) {
      // ignore
    }
  })
})
