import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PredictionService } from '../services/prediction.service.js'
import { VoteService } from '../services/vote.service.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'
import { auraQueue } from '../queues/aura.queue.js'
import { notificationQueue } from '../queues/notification.queue.js'
import { db } from '../db/index.js'
import { predictions, predictionLikes } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { NotFoundError, ForbiddenError } from '../utils/errors.js'

const categoryValues = ['ai_tech', 'sports', 'crypto', 'politics', 'entertainment', 'science', 'other'] as const
const riskValues = ['safe', 'bold', 'hot_take', 'crazy'] as const

const createPredictionSchema = z.object({
  question: z.string().min(10).max(500),
  category: z.enum(categoryValues),
  riskLevel: z.enum(riskValues).default('safe'),
  resolvesAt: z.string().datetime(),
  auraReward: z.number().int().min(1).max(1000).optional(),
})

const listPredictionsSchema = z.object({
  category: z.enum(categoryValues).optional(),
  status: z.enum(['active', 'resolved_yes', 'resolved_no']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const castVoteSchema = z.object({
  vote: z.enum(['yes', 'no']),
})

const resolveSchema = z.object({
  outcome: z.enum(['yes', 'no']),
})

export async function predictionRoutes(app: FastifyInstance) {
  const predictionService = new PredictionService()
  const voteService = new VoteService()

  // GET /predictions — list predictions (public, optional auth for userVote)
  app.get('/', { preHandler: optionalAuthenticate }, async (request, reply) => {
    const query = listPredictionsSchema.parse(request.query)
    const result = await predictionService.list(
      { category: query.category, status: query.status },
      { page: query.page, limit: query.limit },
      request.userId,
    )
    return reply.send(result)
  })

  // GET /predictions/:id — get single prediction
  app.get('/:id', { preHandler: optionalAuthenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const prediction = await predictionService.findById(id, request.userId)
    return reply.send(prediction)
  })

  // POST /predictions — create prediction (auth required)
  app.post('/', { preHandler: authenticate }, async (request, reply) => {
    const body = createPredictionSchema.parse(request.body)
    const prediction = await predictionService.create(request.userId, {
      ...body,
      resolvesAt: new Date(body.resolvesAt),
    })

    // Schedule auto-resolution reminder job
    await auraQueue.add(
      'resolve_prediction',
      { predictionId: prediction.id, outcome: 'yes' },
      {
        delay: new Date(body.resolvesAt).getTime() - Date.now(),
        jobId: `remind:${prediction.id}`,
      },
    )

    return reply.status(201).send(prediction)
  })

  // DELETE /predictions/:id — delete prediction (owner only)
  app.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await predictionService.delete(id, request.userId)
    return reply.status(204).send()
  })

  // POST /predictions/:id/votes — cast a vote
  app.post('/:id/votes', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { vote } = castVoteSchema.parse(request.body)
    const result = await voteService.castVote(request.userId, id, vote)
    return reply.status(201).send(result)
  })

  // POST /predictions/:id/likes — toggle like
  app.post('/:id/likes', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const [prediction] = await db
      .select({ id: predictions.id, creatorId: predictions.creatorId, likeCount: predictions.likeCount })
      .from(predictions)
      .where(eq(predictions.id, id))
      .limit(1)

    if (!prediction) throw new NotFoundError('Prediction')

    const existing = await db
      .select()
      .from(predictionLikes)
      .where(and(eq(predictionLikes.userId, request.userId), eq(predictionLikes.predictionId, id)))
      .limit(1)

    if (existing.length > 0) {
      // Unlike
      await db
        .delete(predictionLikes)
        .where(and(eq(predictionLikes.userId, request.userId), eq(predictionLikes.predictionId, id)))
      await db
        .update(predictions)
        .set({ likeCount: Math.max(0, prediction.likeCount - 1) })
        .where(eq(predictions.id, id))

      await predictionService.invalidateCache(id)
      return reply.send({ liked: false })
    }

    // Like
    await db.insert(predictionLikes).values({ userId: request.userId, predictionId: id })
    await db
      .update(predictions)
      .set({ likeCount: prediction.likeCount + 1 })
      .where(eq(predictions.id, id))

    await predictionService.invalidateCache(id)

    // Queue notification to creator
    await notificationQueue.add('liked_prediction', {
      actorId: request.userId,
      recipientId: prediction.creatorId,
      predictionId: id,
    })

    return reply.send({ liked: true })
  })

  // POST /predictions/:id/resolve — admin/creator resolves a prediction
  app.post('/:id/resolve', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { outcome } = resolveSchema.parse(request.body)

    const [prediction] = await db
      .select({ creatorId: predictions.creatorId, status: predictions.status })
      .from(predictions)
      .where(eq(predictions.id, id))
      .limit(1)

    if (!prediction) throw new NotFoundError('Prediction')
    if (prediction.creatorId !== request.userId) throw new ForbiddenError('Only the creator can resolve a prediction')

    // Queue resolution job (async — DB updates + aura distribution can be slow)
    await auraQueue.add('resolve_prediction', { predictionId: id, outcome }, {
      jobId: `resolve:${id}:${Date.now()}`,
    })

    return reply.send({ queued: true, message: 'Resolution in progress' })
  })
}
