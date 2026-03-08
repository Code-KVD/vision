import { eq, and } from 'drizzle-orm'
import { db } from '../db/index.js'
import { votes, predictions, users } from '../db/schema.js'
import { redis, keys } from '../utils/redis.js'
import { notificationQueue } from '../queues/notification.queue.js'
import { NotFoundError, ConflictError } from '../utils/errors.js'
import type { voteEnum } from '../db/schema.js'

type VoteValue = (typeof voteEnum.enumValues)[number]

export class VoteService {
  async castVote(userId: string, predictionId: string, vote: VoteValue) {
    // Verify prediction exists and is active
    const [prediction] = await db
      .select({ id: predictions.id, status: predictions.status, creatorId: predictions.creatorId, question: predictions.question })
      .from(predictions)
      .where(eq(predictions.id, predictionId))
      .limit(1)

    if (!prediction) throw new NotFoundError('Prediction')
    if (prediction.status !== 'active') {
      throw new ConflictError('Prediction is no longer active')
    }

    // Check for duplicate vote
    const existing = await db
      .select({ id: votes.id, vote: votes.vote })
      .from(votes)
      .where(and(eq(votes.userId, userId), eq(votes.predictionId, predictionId)))
      .limit(1)

    if (existing.length > 0) {
      throw new ConflictError('You have already voted on this prediction')
    }

    // Insert vote in DB
    const [newVote] = await db
      .insert(votes)
      .values({ userId, predictionId, vote })
      .returning()

    // Increment Redis counters (atomic — race-safe)
    const countKey = vote === 'yes'
      ? keys.predictionYesCount(predictionId)
      : keys.predictionNoCount(predictionId)

    await redis.incr(countKey)

    // Invalidate prediction cache so next fetch gets live count
    await redis.del(keys.predictionCache(predictionId))

    // Queue async: update user vote count in DB, notify creator
    await notificationQueue.add('voted_on_prediction', {
      actorId: userId,
      recipientId: prediction.creatorId,
      predictionId,
      vote,
    }, { removeOnComplete: 100, removeOnFail: 50 })

    // Publish real-time update to WebSocket channel
    await redis.publish(keys.predictionChannel(predictionId), JSON.stringify({
      type: 'vote_cast',
      predictionId,
      vote,
    }))

    return newVote
  }

  async getUserVotes(userId: string) {
    return db
      .select({ predictionId: votes.predictionId, vote: votes.vote, createdAt: votes.createdAt })
      .from(votes)
      .where(eq(votes.userId, userId))
      .orderBy(votes.createdAt)
  }
}
