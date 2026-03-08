import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { UserService } from '../services/user.service.js'
import { authenticate, optionalAuthenticate } from '../middleware/auth.js'
import { notificationQueue } from '../queues/notification.queue.js'
import { db } from '../db/index.js'
import { comments, predictions, commentLikes } from '../db/schema.js'
import { eq, and, desc } from 'drizzle-orm'
import { NotFoundError } from '../utils/errors.js'
import { paginate, paginationOffset } from '../utils/pagination.js'
import { count } from 'drizzle-orm'

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  avatarUrl: z.string().url().optional(),
})

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
})

export async function userRoutes(app: FastifyInstance) {
  const userService = new UserService()

  // GET /users/:id — get user profile
  app.get('/:id', { preHandler: optionalAuthenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const profile = await userService.getProfile(id, request.userId)

    let isFollowing = false
    if (request.userId && request.userId !== id) {
      isFollowing = await userService.isFollowing(request.userId, id)
    }

    return reply.send({ ...profile, isFollowing })
  })

  // PATCH /users/me — update own profile
  app.patch('/me', { preHandler: authenticate }, async (request, reply) => {
    const body = updateProfileSchema.parse(request.body)
    const updated = await userService.updateProfile(request.userId, body)
    return reply.send(updated)
  })

  // GET /users/me — get own profile (convenient alias)
  app.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const profile = await userService.getProfile(request.userId)
    return reply.send(profile)
  })

  // POST /users/:id/follow — follow a user
  app.post('/:id/follow', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await userService.follow(request.userId, id)

    await notificationQueue.add('followed_user', {
      actorId: request.userId,
      recipientId: id,
    })

    return reply.status(201).send({ following: true })
  })

  // DELETE /users/:id/follow — unfollow a user
  app.delete('/:id/follow', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }
    await userService.unfollow(request.userId, id)
    return reply.send({ following: false })
  })

  // GET /users/:id/badges — get user badges
  app.get('/:id/badges', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userBadges = await userService.getUserBadges(id)
    return reply.send(userBadges)
  })

  // ─── Comments ────────────────────────────────────────────────────────────────

  // GET /predictions/:predictionId/comments
  app.get('/predictions/:predictionId/comments', { preHandler: optionalAuthenticate }, async (request, reply) => {
    const { predictionId } = request.params as { predictionId: string }
    const query = paginationSchema.parse(request.query)

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          id: comments.id,
          content: comments.content,
          parentId: comments.parentId,
          likeCount: comments.likeCount,
          createdAt: comments.createdAt,
          userId: comments.userId,
        })
        .from(comments)
        .where(eq(comments.predictionId, predictionId))
        .orderBy(desc(comments.createdAt))
        .limit(query.limit)
        .offset(paginationOffset(query)),
      db.select({ value: count() }).from(comments).where(eq(comments.predictionId, predictionId)),
    ])

    return reply.send(paginate(rows, total, query))
  })

  // POST /predictions/:predictionId/comments
  app.post('/predictions/:predictionId/comments', { preHandler: authenticate }, async (request, reply) => {
    const { predictionId } = request.params as { predictionId: string }
    const body = createCommentSchema.parse(request.body)

    const [pred] = await db
      .select({ creatorId: predictions.creatorId })
      .from(predictions)
      .where(eq(predictions.id, predictionId))
      .limit(1)

    if (!pred) throw new NotFoundError('Prediction')

    const [comment] = await db
      .insert(comments)
      .values({
        userId: request.userId,
        predictionId,
        content: body.content,
        parentId: body.parentId,
      })
      .returning()

    // Update comment count on prediction
    await db
      .update(predictions)
      .set({ commentCount: count() })
      .where(eq(predictions.id, predictionId))

    // Queue notification
    await notificationQueue.add('commented_on_prediction', {
      actorId: request.userId,
      recipientId: pred.creatorId,
      predictionId,
      commentId: comment.id,
    })

    return reply.status(201).send(comment)
  })

  // POST /comments/:id/likes — toggle comment like
  app.post('/comments/:id/likes', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const [comment] = await db.select().from(comments).where(eq(comments.id, id)).limit(1)
    if (!comment) throw new NotFoundError('Comment')

    const existing = await db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.userId, request.userId), eq(commentLikes.commentId, id)))
      .limit(1)

    if (existing.length > 0) {
      await db
        .delete(commentLikes)
        .where(and(eq(commentLikes.userId, request.userId), eq(commentLikes.commentId, id)))
      await db
        .update(comments)
        .set({ likeCount: Math.max(0, comment.likeCount - 1) })
        .where(eq(comments.id, id))
      return reply.send({ liked: false })
    }

    await db.insert(commentLikes).values({ userId: request.userId, commentId: id })
    await db
      .update(comments)
      .set({ likeCount: comment.likeCount + 1 })
      .where(eq(comments.id, id))

    return reply.send({ liked: true })
  })
}
