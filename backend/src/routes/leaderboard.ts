import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { LeaderboardService } from '../services/leaderboard.service.js'
import { authenticate } from '../middleware/auth.js'

const querySchema = z.object({
  type: z.enum(['global', 'weekly', 'accuracy']).default('global'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function leaderboardRoutes(app: FastifyInstance) {
  const leaderboardService = new LeaderboardService()

  // GET /leaderboard — get leaderboard
  app.get('/', async (request, reply) => {
    const query = querySchema.parse(request.query)
    const entries = await leaderboardService.getLeaderboard(query.type, query.limit, query.offset)
    return reply.send({ type: query.type, entries })
  })

  // GET /leaderboard/me — get current user's rank (auth required)
  app.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const { type } = z.object({ type: z.enum(['global', 'weekly', 'accuracy']).default('global') }).parse(request.query)
    const rank = await leaderboardService.getUserRank(request.userId, type)
    return reply.send({ type, rank })
  })
}
