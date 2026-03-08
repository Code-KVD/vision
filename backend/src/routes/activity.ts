import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ActivityService } from '../services/activity.service.js'
import { authenticate } from '../middleware/auth.js'

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function activityRoutes(app: FastifyInstance) {
  const activityService = new ActivityService()

  // GET /activity — get current user's activity feed
  app.get('/', { preHandler: authenticate }, async (request, reply) => {
    const query = paginationSchema.parse(request.query)
    const result = await activityService.getUserActivity(request.userId, query)
    return reply.send(result)
  })

  // GET /activity/unread-count
  app.get('/unread-count', { preHandler: authenticate }, async (request, reply) => {
    const count = await activityService.getUnreadCount(request.userId)
    return reply.send({ unreadCount: count })
  })

  // POST /activity/read-all — mark all notifications as read
  app.post('/read-all', { preHandler: authenticate }, async (request, reply) => {
    await activityService.markAllRead(request.userId)
    return reply.send({ success: true })
  })
}
