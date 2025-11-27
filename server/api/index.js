// Vercel serverless handler for the Fastify app.
// This file loads the compiled server (`dist/index.js`) and reuses
// the Fastify instance across warm invocations via `globalThis`.

let serverPromise

export default async function handler(req, res) {
  if (!serverPromise) {
    serverPromise = (async () => {
      const mod = await import('../dist/index.js')
      const buildServer = mod.buildServer ?? mod.default
      const server = await buildServer()
      await server.ready()
      // Keep the server around on global to reuse across invocations
      globalThis.__PIH_SERVER__ = server
      return server
    })()
  }

  const server = await serverPromise
  // Let Fastify handle the Node request/response objects
  server.server.emit('request', req, res)
}
