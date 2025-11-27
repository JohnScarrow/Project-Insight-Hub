import { FastifyRequest, FastifyReply } from 'fastify'

export async function logAudit(
  prisma: any,
  {
    userId,
    action,
    resource,
    resourceId,
    projectId,
    details,
    success = true,
    errorMessage,
    request,
  }: {
    userId?: string
    action: string
    resource: string
    resourceId?: string
    projectId?: string
    details?: string
    success?: boolean
    errorMessage?: string
    request?: FastifyRequest
  }
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        projectId,
        details,
        success,
        errorMessage,
        ipAddress: request?.ip || null,
        userAgent: request?.headers['user-agent'] || null,
      },
    })
  } catch (err) {
    console.error('Failed to create audit log:', err)
  }
}
