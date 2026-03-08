import { Queue, Worker, type Job } from 'bullmq'
import { config } from '../config/index.js'
import { resolvePrediction } from '../services/aura.service.js'

const connection = {
  host: new URL(config.REDIS_URL).hostname,
  port: Number(new URL(config.REDIS_URL).port) || 6379,
}

// ─── Queue definition ─────────────────────────────────────────────────────────

export const auraQueue = new Queue('aura', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
})

// ─── Job types ────────────────────────────────────────────────────────────────

interface ResolvePredictionJobData {
  predictionId: string
  outcome: 'yes' | 'no'
}

// ─── Worker ───────────────────────────────────────────────────────────────────

export function startAuraWorker() {
  const worker = new Worker<ResolvePredictionJobData>(
    'aura',
    async (job: Job<ResolvePredictionJobData>) => {
      if (job.name === 'resolve_prediction') {
        await resolvePrediction(job.data.predictionId, job.data.outcome)
      }
    },
    {
      connection,
      concurrency: 5, // Resolutions are heavy DB operations; keep concurrency low
    },
  )

  worker.on('completed', (job) => {
    console.log(`[AuraWorker] Resolved prediction ${job.data.predictionId}`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[AuraWorker] Failed to resolve prediction ${job?.data?.predictionId}:`, err)
  })

  return worker
}

/**
 * Schedule a prediction to be resolved at a specific time.
 * BullMQ's delay feature handles the scheduling.
 */
export async function schedulePredictionResolution(
  predictionId: string,
  resolvesAt: Date,
) {
  const delay = resolvesAt.getTime() - Date.now()
  if (delay <= 0) {
    console.warn(`[AuraQueue] Prediction ${predictionId} resolve time is in the past, skipping schedule`)
    return
  }

  await auraQueue.add(
    'resolve_prediction',
    { predictionId, outcome: 'yes' }, // outcome will be overridden when admin resolves
    {
      delay,
      jobId: `resolve:${predictionId}`, // Idempotent — won't add duplicate
    },
  )
  console.log(`[AuraQueue] Scheduled resolution for prediction ${predictionId} in ${Math.round(delay / 1000)}s`)
}
