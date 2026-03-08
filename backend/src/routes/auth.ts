import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { AuthService } from '../services/auth.service.js'
import { authenticate } from '../middleware/auth.js'

const registerSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers and underscores'),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(64),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app)

  // POST /auth/register
  app.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body)
    const result = await authService.register(body)
    return reply.status(201).send(result)
  })

  // POST /auth/login
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)
    const result = await authService.login(body)
    return reply.send(result)
  })

  // POST /auth/refresh
  app.post('/refresh', async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body)
    const tokens = await authService.refresh(refreshToken)
    return reply.send(tokens)
  })

  // POST /auth/logout  (requires auth)
  app.post('/logout', { preHandler: authenticate }, async (request, reply) => {
    await authService.logout(request.userId)
    return reply.send({ success: true })
  })

  // GET /auth/me  (requires auth)
  app.get('/me', { preHandler: authenticate }, async (request, reply) => {
    return reply.send({ userId: request.userId, username: request.username })
  })
}
