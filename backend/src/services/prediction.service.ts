import { eq, and, desc, sql, count, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { predictions, votes, predictionLikes } from '../db/schema.js'
import { redis, keys, cacheGet, cacheSet, cacheDel } from '../utils/redis.js'
import { config } from '../config/index.js'
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js'
import type { categoryEnum, riskLevelEnum } from '../db/schema.js'
import { paginate, paginationOffset, type PaginationParams } from '../utils/pagination.js'

type Category = (typeof categoryEnum.enumValues)[number]
type RiskLevel = (typeof riskLevelEnum.enumValues)[number]

export interface CreatePredictionInput {
  question: string
  category: Category
  riskLevel: RiskLevel
  resolvesAt: Date
  auraReward?: number
}

export interface PredictionFilters {
  category?: Category
  status?: 'active' | 'resolved_yes' | 'resolved_no'
  creatorId?: string
}

export class PredictionService {
  async create(userId: string, input: CreatePredictionInput) {
    const [prediction] = await db
      .insert(predictions)
      .values({
        creatorId: userId,
        question: input.question,
        category: input.category,
        riskLevel: input.riskLevel,
        resolvesAt: input.resolvesAt,
        auraReward: input.auraReward ?? this.defaultAuraReward(input.riskLevel),
      })
      .returning()

    // Seed vote counts in Redis
    await redis.set(keys.predictionYesCount(prediction.id), '0')
    await redis.set(keys.predictionNoCount(prediction.id), '0')

    // Invalidate feed caches
    await redis.del(keys.activePredictions(prediction.category))
    await redis.del(keys.activePredictions('all'))

    return prediction
  }

  async findById(id: string, requestingUserId?: string) {
    const cacheKey = keys.predictionCache(id)
    const cached = await cacheGet<ReturnType<typeof this.formatPrediction>>(cacheKey)
    if (cached) return cached

    const [prediction] = await db.select().from(predictions).where(eq(predictions.id, id)).limit(1)
    if (!prediction) throw new NotFoundError('Prediction')

    // Get live vote counts from Redis (fall back to DB values)
    const [yesCount, noCount] = await Promise.all([
      redis.get(keys.predictionYesCount(id)),
      redis.get(keys.predictionNoCount(id)),
    ])

    const formatted = this.formatPrediction(prediction, {
      yesCount: yesCount !== null ? parseInt(yesCount) : prediction.yesCount,
      noCount: noCount !== null ? parseInt(noCount) : prediction.noCount,
    })

    await cacheSet(cacheKey, formatted, config.CACHE_TTL_PREDICTIONS)

    // Attach user's vote if authenticated
    if (requestingUserId) {
      const [vote] = await db
        .select({ vote: votes.vote })
        .from(votes)
        .where(and(eq(votes.predictionId, id), eq(votes.userId, requestingUserId)))
        .limit(1)
      return { ...formatted, userVote: vote?.vote ?? null }
    }

    return formatted
  }

  async list(filters: PredictionFilters, pagination: PaginationParams, requestingUserId?: string) {
    const conditions = []

    if (filters.status) {
      conditions.push(eq(predictions.status, filters.status))
    } else {
      conditions.push(eq(predictions.status, 'active'))
    }

    if (filters.category) {
      conditions.push(eq(predictions.category, filters.category))
    }

    if (filters.creatorId) {
      conditions.push(eq(predictions.creatorId, filters.creatorId))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [rows, [{ value: total }]] = await Promise.all([
      db
        .select()
        .from(predictions)
        .where(where)
        .orderBy(desc(predictions.totalVotes), desc(predictions.createdAt))
        .limit(pagination.limit)
        .offset(paginationOffset(pagination)),
      db
        .select({ value: count() })
        .from(predictions)
        .where(where),
    ])

    // Enrich with live Redis vote counts
    const enriched = await Promise.all(
      rows.map(async (p) => {
        const [y, n] = await Promise.all([
          redis.get(keys.predictionYesCount(p.id)),
          redis.get(keys.predictionNoCount(p.id)),
        ])
        return this.formatPrediction(p, {
          yesCount: y !== null ? parseInt(y) : p.yesCount,
          noCount: n !== null ? parseInt(n) : p.noCount,
        })
      }),
    )

    // Attach user votes if authenticated
    if (requestingUserId && enriched.length > 0) {
      const userVotes = await db
        .select({ predictionId: votes.predictionId, vote: votes.vote })
        .from(votes)
        .where(
          and(
            eq(votes.userId, requestingUserId),
            inArray(votes.predictionId, enriched.map((p) => p.id)),
          ),
        )

      const voteMap = new Map(userVotes.map((v) => [v.predictionId, v.vote]))
      return paginate(
        enriched.map((p) => ({ ...p, userVote: voteMap.get(p.id) ?? null })),
        total,
        pagination,
      )
    }

    return paginate(enriched, total, pagination)
  }

  async delete(id: string, userId: string) {
    const [prediction] = await db
      .select({ creatorId: predictions.creatorId, status: predictions.status })
      .from(predictions)
      .where(eq(predictions.id, id))
      .limit(1)

    if (!prediction) throw new NotFoundError('Prediction')
    if (prediction.creatorId !== userId) throw new ForbiddenError()
    if (prediction.status !== 'active') throw new ConflictError('Cannot delete a resolved prediction')

    await db.delete(predictions).where(eq(predictions.id, id))

    // Cleanup Redis
    await Promise.all([
      redis.del(keys.predictionCache(id)),
      redis.del(keys.predictionYesCount(id)),
      redis.del(keys.predictionNoCount(id)),
    ])
  }

  async invalidateCache(predictionId: string) {
    await cacheDel(keys.predictionCache(predictionId))
  }

  private formatPrediction(
    p: typeof predictions.$inferSelect,
    liveCounts?: { yesCount: number; noCount: number },
  ) {
    const yes = liveCounts?.yesCount ?? p.yesCount
    const no = liveCounts?.noCount ?? p.noCount
    const total = yes + no
    const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 50
    const noPercent = 100 - yesPercent

    const now = new Date()
    const diffMs = p.resolvesAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const resolvesIn = diffDays > 0 ? `${diffDays}d` : 'Expired'

    return {
      id: p.id,
      question: p.question,
      category: p.category,
      riskLevel: p.riskLevel,
      status: p.status,
      yesCount: yes,
      noCount: no,
      totalVotes: total,
      yesPercent,
      noPercent,
      auraReward: p.auraReward,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
      resolvesAt: p.resolvesAt,
      resolvesIn,
      creatorId: p.creatorId,
      createdAt: p.createdAt,
    }
  }

  private defaultAuraReward(riskLevel: RiskLevel): number {
    const rewards: Record<RiskLevel, number> = {
      safe: 10,
      bold: 25,
      hot_take: 50,
      crazy: 100,
    }
    return rewards[riskLevel]
  }
}
