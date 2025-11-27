import { buildServer } from './index'

const port = Number(process.env.PORT || 4000)

const server = await buildServer()

try {
  await server.listen({ port, host: '0.0.0.0' })
  server.log.info(`Server listening on http://0.0.0.0:${port}`)
} catch (err) {
  server.log.error(err)
  process.exit(1)
}
