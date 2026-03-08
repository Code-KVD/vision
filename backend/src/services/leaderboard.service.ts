import { inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { redis, keys, cacheGet, cacheSet, currentIsoWeek } from '../utils/redis.js'
import { config } from '../config/index.js'

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  score: number
  location: string | null
}

export type LeaderboardType = 'global' | 'weekly' | 'accuracy'

export class LeaderboardService {
  /**
   * Get top N entries from a leaderboard sorted set in Redis.
   * Redis Sorted Sets give O(log n) rank queries — ideal for leaderboards.
   */
  async getLeaderboard(type: LeaderboardType, limit = 50, offset = 0): Promise<LeaderboardEntry[]> {
    const cacheKey = `lb_result:${type}:${limit}:${offset}`
    const cached = await cacheGet<LeaderboardEntry[]>(cacheKey)
    if (cached) return cached

    const setKey = this.getSetKey(type)

    // ZREVRANGE with scores — highest score first
    const raw = await redis.zrevrange(setKey, offset, offset + limit - 1, 'WITHSCORES')
    if (raw.length === 0) return []

    // raw = [userId, score, userId, score, ...]
    const entries: Array<{ userId: string; score: number }> = []
    for (let i = 0; i < raw.length; i += 2) {
      entries.push({ userId: raw[i], score: parseFloat(raw[i + 1]) })
    }

    // Batch-fetch user profiles from DB
    const userIds = entries.map((e) => e.userId)
    const userRows = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        location: users.location,
      })
      .from(users)
      .where(inArray(users.id, userIds))

    const userMap = new Map(userRows.map((u) => [u.id, u]))

    const result: LeaderboardEntry[] = entries
      .map((e, i) => {
        const user = userMap.get(e.userId)
        if (!user) return null
        return {
          rank: offset + i + 1,
          userId: e.userId,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          location: user.location,
          score: type === 'accuracy' ? e.score / 100 : e.score, // accuracy stored *100 for int precision
        }
      })
      .filter((e): e is LeaderboardEntry => e !== null)

    await cacheSet(cacheKey, result, config.CACHE_TTL_LEADERBOARD)
    return result
  }

  async getUserRank(userId: string, type: LeaderboardType) {
    const setKey = this.getSetKey(type)
    const [rank, score] = await Promise.all([
      redis.zrevrank(setKey, userId),
      redis.zscore(setKey, userId),
    ])

    if (rank === null) return null
    return {
      rank: rank + 1, // 0-indexed → 1-indexed
      score: score ? parseFloat(score) : 0,
    }
  }

  /**
   * Called when a user's aura changes (vote resolution, badge earned, etc.).
   * Atomically updates all relevant sorted sets.
   */
  async updateUserScore(userId: string, auraPoints: number, accuracyPercent: number) {
    const week = currentIsoWeek()

    await Promise.all([
      redis.zadd(keys.leaderboardGlobal(), auraPoints, userId),
      redis.zadd(keys.leaderboardWeekly(week), auraPoints, userId),
      // Store accuracy * 100 as integer to avoid float precision issues
      redis.zadd(keys.leaderboardAccuracy(), Math.round(accuracyPercent * 100), userId),
    ])

    // Invalidate cached results
    await redis.del('lb_result:global:50:0', 'lb_result:weekly:50:0', 'lb_result:accuracy:50:0')
  }

  /**
   * Seed leaderboard from DB on server startup (or after a cold cache).
   * Only needed once; Redis persists unless flushed.
   */
  async seedFromDatabase() {
    const allUsers = await db
      .select({ id: users.id, auraPoints: users.auraPoints, accuracyPercent: users.accuracyPercent })
      .from(users)

    if (allUsers.length === 0) return

    const week = currentIsoWeek()

    // Build pipeline for bulk insert
    const pipeline = redis.pipeline()
    for (const user of allUsers) {
      pipeline.zadd(keys.leaderboardGlobal(), user.auraPoints, user.id)
      pipeline.zadd(keys.leaderboardWeekly(week), user.auraPoints, user.id)
      pipeline.zadd(keys.leaderboardAccuracy(), Math.round(user.accuracyPercent * 100), user.id)
    }
    await pipeline.exec()

    console.log(`[Leaderboard] Seeded ${allUsers.length} users into Redis sorted sets`)
  }

  private getSetKey(type: LeaderboardType): string {
    switch (type) {
      case 'global': return keys.leaderboardGlobal()
      case 'weekly': return keys.leaderboardWeekly(currentIsoWeek())
      case 'accuracy': return keys.leaderboardAccuracy()
    }
  }
}
