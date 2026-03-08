import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyWebsocket from '@fastify/websocket'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

import { config } from './config/index.js'
import { pool } from './db/index.js'
import { redis } from './utils/redis.js'
import { AppError } from './utils/errors.js'
import { ZodError } from 'zod'

import { authRoutes } from './routes/auth.js'
import { predictionRoutes } from './routes/predictions.js'
import { leaderboardRoutes } from './routes/leaderboard.js'
import { activityRoutes } from './routes/activity.js'
import { userRoutes } from './routes/users.js'

import { registerWebSocketRoutes } from './websocket/index.js'
import { startNotificationWorker } from './queues/notification.queue.js'
import { startAuraWorker } from './queues/aura.queue.js'
import { LeaderboardService } from './services/leaderboard.service.js'

// ─── Build app ────────────────────────────────────────────────────────────────

const app = Fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'warn' : 'info',
    transport: config.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
  // Trust X-Forwarded-* headers when behind a reverse proxy (nginx / load balancer)
  trustProxy: true,
  // Increase body size limit for avatar URLs etc.
  bodyLimit: 1_048_576, // 1MB
})

// ─── Plugins ──────────────────────────────────────────────────────────────────

await app.register(fastifyHelmet, {
  contentSecurityPolicy: false, // Configured at nginx level in production
})

await app.register(fastifyCors, {
  origin: config.CORS_ORIGIN.split(','),
  credentials: true,
})

// Redis-backed rate limiting — shared across all server instances
await app.register(fastifyRateLimit, {
  global: true,
  max: config.RATE_LIMIT_MAX,
  timeWindow: config.RATE_LIMIT_WINDOW_MS,
  redis,
  keyGenerator: (request) =>
    request.headers['x-forwarded-for']?.toString() ?? request.ip,
  errorResponseBuilder: (request, context) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Retry after ${context.after}`,
  }),
})

await app.register(fastifyJwt, {
  secret: config.JWT_SECRET,
  sign: { expiresIn: config.JWT_ACCESS_TTL },
})

await app.register(fastifyWebsocket)

// Swagger — only in non-production
if (config.NODE_ENV !== 'production') {
  await app.register(fastifySwagger, {
    openapi: {
      info: { title: 'Vision API', version: '1.0.0', description: 'Prediction market backend' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  })
  await app.register(fastifySwaggerUi, { routePrefix: '/docs' })
}

// ─── Error handler ────────────────────────────────────────────────────────────

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.flatten().fieldErrors,
    })
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.code ?? 'Error',
      message: error.message,
    })
  }

  // Unexpected errors
  app.log.error(error)
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: config.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
  })
})

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  env: config.NODE_ENV,
}))

await app.register(authRoutes, { prefix: '/auth' })
await app.register(predictionRoutes, { prefix: '/predictions' })
await app.register(leaderboardRoutes, { prefix: '/leaderboard' })
await app.register(activityRoutes, { prefix: '/activity' })
await app.register(userRoutes, { prefix: '/users' })

// WebSocket routes
registerWebSocketRoutes(app)

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  try {
    // Connect to Redis
    await redis.connect()
    app.log.info('[Redis] Connection established')

    // Seed leaderboard sorted sets from DB (idempotent)
    const leaderboardService = new LeaderboardService()
    await leaderboardService.seedFromDatabase()

    // Start background job workers
    startNotificationWorker()
    startAuraWorker()
    app.log.info('[Workers] Notification and Aura workers started')

    await app.listen({ port: config.PORT, host: config.HOST })
    app.log.info(`[Server] Listening on ${config.HOST}:${config.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function shutdown(signal: string) {
  app.log.info(`[Server] Received ${signal}, shutting down gracefully...`)
  await app.close()
  await pool.end()
  await redis.quit()
  app.log.info('[Server] Shutdown complete')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

await start()
