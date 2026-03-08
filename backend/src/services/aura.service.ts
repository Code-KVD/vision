import { eq, and, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users, votes, predictions } from '../db/schema.js'
import { LeaderboardService } from './leaderboard.service.js'
import { redis, keys } from '../utils/redis.js'

const leaderboardService = new LeaderboardService()

/**
 * Called when a prediction is resolved.
 * Awards aura to correct voters, updates stats, and syncs leaderboards.
 */
export async function resolvePrediction(predictionId: string, outcome: 'yes' | 'no') {
  const [prediction] = await db
    .select()
    .from(predictions)
    .where(eq(predictions.id, predictionId))
    .limit(1)

  if (!prediction) throw new Error(`Prediction ${predictionId} not found`)
  if (prediction.status !== 'active') throw new Error('Prediction already resolved')

  // Get all votes
  const allVotes = await db.select().from(votes).where(eq(votes.predictionId, predictionId))

  const winners = allVotes.filter((v) => v.vote === outcome)
  const losers = allVotes.filter((v) => v.vote !== outcome)

  // Award aura to winners
  const auraPerWinner = prediction.auraReward

  await db.transaction(async (tx) => {
    // Update prediction status
    const newStatus = outcome === 'yes' ? 'resolved_yes' : 'resolved_no'
    await tx
      .update(predictions)
      .set({
        status: newStatus,
        resolvedAt: new Date(),
        // Sync final counts from Redis to DB
        yesCount: await getRedisCount(keys.predictionYesCount(predictionId)),
        noCount: await getRedisCount(keys.predictionNoCount(predictionId)),
      })
      .where(eq(predictions.id, predictionId))

    // Award aura to winners
    for (const winner of winners) {
      await tx
        .update(votes)
        .set({ auraEarned: auraPerWinner })
        .where(eq(votes.id, winner.id))

      await tx
        .update(users)
        .set({
          auraPoints: sql`${users.auraPoints} + ${auraPerWinner}`,
          correctVotes: sql`${users.correctVotes} + 1`,
          totalVotes: sql`${users.totalVotes} + 1`,
          // Recompute accuracy
          accuracyPercent: sql`
            CASE WHEN ${users.totalVotes} + 1 > 0
            THEN ROUND(((${users.correctVotes} + 1)::numeric / (${users.totalVotes} + 1)) * 100, 2)
            ELSE 0 END
          `,
          currentStreak: sql`${users.currentStreak} + 1`,
          longestStreak: sql`GREATEST(${users.longestStreak}, ${users.currentStreak} + 1)`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, winner.userId))
    }

    // Update losers' stats (no aura, streak reset)
    for (const loser of losers) {
      await tx
        .update(votes)
        .set({ auraEarned: 0 })
        .where(eq(votes.id, loser.id))

      await tx
        .update(users)
        .set({
          totalVotes: sql`${users.totalVotes} + 1`,
          accuracyPercent: sql`
            CASE WHEN ${users.totalVotes} + 1 > 0
            THEN ROUND((${users.correctVotes}::numeric / (${users.totalVotes} + 1)) * 100, 2)
            ELSE 0 END
          `,
          currentStreak: 0,
          updatedAt: new Date(),
        })
        .where(eq(users.id, loser.userId))
    }
  })

  // Sync leaderboards for all affected users in Redis
  const affectedUserIds = allVotes.map((v) => v.userId)
  if (affectedUserIds.length > 0) {
    const updatedUsers = await db
      .select({ id: users.id, auraPoints: users.auraPoints, accuracyPercent: users.accuracyPercent })
      .from(users)
      .where(sql`${users.id} = ANY(${sql.raw(`ARRAY['${affectedUserIds.join("','")}']::uuid[]`)})`)

    await Promise.all(
      updatedUsers.map((u) =>
        leaderboardService.updateUserScore(u.id, u.auraPoints, u.accuracyPercent),
      ),
    )
  }

  // Invalidate prediction cache
  await redis.del(keys.predictionCache(predictionId))

  // Publish resolution event to WebSocket
  await redis.publish(
    keys.predictionChannel(predictionId),
    JSON.stringify({ type: 'prediction_resolved', predictionId, outcome }),
  )

  console.log(`[Aura] Resolved prediction ${predictionId}: ${outcome}. ${winners.length} winners awarded ${auraPerWinner} aura each.`)
}

async function getRedisCount(key: string): Promise<number> {
  const val = await redis.get(key)
  return val ? parseInt(val) : 0
}
