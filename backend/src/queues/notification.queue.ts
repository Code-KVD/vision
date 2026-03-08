import { Queue, Worker, type Job } from 'bullmq'
import { config } from '../config/index.js'
import { ActivityService } from '../services/activity.service.js'
import { redis } from '../utils/redis.js'

// ─── Queue definition ─────────────────────────────────────────────────────────

export const notificationQueue = new Queue('notifications', {
  connection: { host: new URL(config.REDIS_URL).hostname, port: Number(new URL(config.REDIS_URL).port) || 6379 },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 200,
    removeOnFail: 100,
  },
})

const activityService = new ActivityService()

// ─── Job types ────────────────────────────────────────────────────────────────

interface VotedJobData {
  actorId: string
  recipientId: string
  predictionId: string
  vote: 'yes' | 'no'
}

interface LikedJobData {
  actorId: string
  recipientId: string
  predictionId: string
}

interface CommentedJobData {
  actorId: string
  recipientId: string
  predictionId: string
  commentId: string
}

interface FollowedJobData {
  actorId: string
  recipientId: string
}

// ─── Worker ───────────────────────────────────────────────────────────────────

export function startNotificationWorker() {
  const connection = { host: new URL(config.REDIS_URL).hostname, port: Number(new URL(config.REDIS_URL).port) || 6379 }

  const worker = new Worker<VotedJobData | LikedJobData | CommentedJobData | FollowedJobData>(
    'notifications',
    async (job: Job) => {
      switch (job.name) {
        case 'voted_on_prediction': {
          const data = job.data as VotedJobData
          await activityService.createActivity({
            recipientId: data.recipientId,
            actorId: data.actorId,
            type: 'voted_on_prediction',
            predictionId: data.predictionId,
            metadata: { vote: data.vote },
          })
          break
        }

        case 'liked_prediction': {
          const data = job.data as LikedJobData
          await activityService.createActivity({
            recipientId: data.recipientId,
            actorId: data.actorId,
            type: 'liked_prediction',
            predictionId: data.predictionId,
          })
          break
        }

        case 'commented_on_prediction': {
          const data = job.data as CommentedJobData
          await activityService.createActivity({
            recipientId: data.recipientId,
            actorId: data.actorId,
            type: 'commented_on_prediction',
            predictionId: data.predictionId,
            commentId: data.commentId,
          })
          break
        }

        case 'followed_user': {
          const data = job.data as FollowedJobData
          await activityService.createActivity({
            recipientId: data.recipientId,
            actorId: data.actorId,
            type: 'followed_user',
          })
          break
        }

        default:
          console.warn(`[NotificationWorker] Unknown job name: ${job.name}`)
      }
    },
    {
      connection,
      // Process up to 20 jobs concurrently per worker instance
      concurrency: 20,
    },
  )

  worker.on('completed', (job) => {
    console.log(`[NotificationWorker] Job ${job.id} (${job.name}) completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[NotificationWorker] Job ${job?.id} failed:`, err)
  })

  return worker
}
