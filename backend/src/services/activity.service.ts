import { eq, and, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { activities, users, predictions } from '../db/schema.js'
import { paginate, paginationOffset, type PaginationParams } from '../utils/pagination.js'
import { count } from 'drizzle-orm'

export class ActivityService {
  async getUserActivity(userId: string, pagination: PaginationParams) {
    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select({
          id: activities.id,
          type: activities.type,
          status: activities.status,
          predictionId: activities.predictionId,
          commentId: activities.commentId,
          metadata: activities.metadata,
          createdAt: activities.createdAt,
          actor: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(activities)
        .leftJoin(users, eq(activities.actorId, users.id))
        .where(eq(activities.recipientId, userId))
        .orderBy(desc(activities.createdAt))
        .limit(pagination.limit)
        .offset(paginationOffset(pagination)),
      db
        .select({ value: count() })
        .from(activities)
        .where(eq(activities.recipientId, userId)),
    ])

    return paginate(rows, total, pagination)
  }

  async markAllRead(userId: string) {
    await db
      .update(activities)
      .set({ status: 'read' })
      .where(and(eq(activities.recipientId, userId), eq(activities.status, 'unread')))
  }

  async getUnreadCount(userId: string): Promise<number> {
    const [{ value }] = await db
      .select({ value: count() })
      .from(activities)
      .where(and(eq(activities.recipientId, userId), eq(activities.status, 'unread')))
    return value
  }

  async createActivity(data: {
    recipientId: string
    actorId: string | null
    type: typeof activities.$inferInsert['type']
    predictionId?: string
    commentId?: string
    metadata?: Record<string, unknown>
  }) {
    // Don't create self-notifications
    if (data.actorId === data.recipientId) return

    await db.insert(activities).values({
      recipientId: data.recipientId,
      actorId: data.actorId,
      type: data.type,
      predictionId: data.predictionId,
      commentId: data.commentId,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
    })
  }
}
