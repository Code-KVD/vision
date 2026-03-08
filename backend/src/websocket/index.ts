import type { FastifyInstance } from 'fastify'
import Redis from 'ioredis'
import { config } from '../config/index.js'
import { keys } from '../utils/redis.js'

/**
 * WebSocket handler with Redis pub/sub fan-out.
 *
 * Architecture for 100k concurrent users:
 * - Each server instance subscribes to Redis pub/sub channels
 * - When any instance publishes an event (vote cast, prediction resolved),
 *   ALL instances receive it and fan-out to their connected clients
 * - This makes WebSocket state-less across horizontal replicas
 *
 * Each client subscribes to:
 *   - Individual prediction channels: ws:pred:{id}
 *   - Global channel: ws:global
 */
export function registerWebSocketRoutes(app: FastifyInstance) {
  // Dedicated Redis subscriber client (one per server instance)
  // ioredis subscriber clients cannot be used for other commands
  const subscriber = new Redis(config.REDIS_URL)

  // Map: channel → Set of WebSocket connections subscribed to it
  const channelClients = new Map<string, Set<import('@fastify/websocket').WebSocket>>()

  subscriber.on('message', (channel, message) => {
    const clients = channelClients.get(channel)
    if (!clients || clients.size === 0) return

    // Fan-out to all clients subscribed to this channel
    for (const ws of clients) {
      if (ws.readyState === ws.OPEN) {
        ws.send(message)
      }
    }
  })

  function subscribe(channel: string, ws: import('@fastify/websocket').WebSocket) {
    if (!channelClients.has(channel)) {
      channelClients.set(channel, new Set())
      subscriber.subscribe(channel)
    }
    channelClients.get(channel)!.add(ws)
  }

  function unsubscribe(channel: string, ws: import('@fastify/websocket').WebSocket) {
    const clients = channelClients.get(channel)
    if (!clients) return
    clients.delete(ws)
    if (clients.size === 0) {
      channelClients.delete(channel)
      subscriber.unsubscribe(channel)
    }
  }

  // ─── WebSocket endpoint ────────────────────────────────────────────────────

  app.get('/ws', { websocket: true }, (socket, request) => {
    const subscribedChannels = new Set<string>()

    // Always subscribe to global channel
    const globalChannel = keys.globalChannel()
    subscribe(globalChannel, socket)
    subscribedChannels.add(globalChannel)

    socket.on('message', (raw) => {
      let msg: { type: string; predictionId?: string }
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }))
        return
      }

      switch (msg.type) {
        case 'subscribe_prediction': {
          if (!msg.predictionId) break
          const ch = keys.predictionChannel(msg.predictionId)
          subscribe(ch, socket)
          subscribedChannels.add(ch)
          socket.send(JSON.stringify({ type: 'subscribed', predictionId: msg.predictionId }))
          break
        }

        case 'unsubscribe_prediction': {
          if (!msg.predictionId) break
          const ch = keys.predictionChannel(msg.predictionId)
          unsubscribe(ch, socket)
          subscribedChannels.delete(ch)
          socket.send(JSON.stringify({ type: 'unsubscribed', predictionId: msg.predictionId }))
          break
        }

        case 'ping':
          socket.send(JSON.stringify({ type: 'pong', ts: Date.now() }))
          break

        default:
          socket.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${msg.type}` }))
      }
    })

    socket.on('close', () => {
      // Cleanup all subscriptions for this client
      for (const channel of subscribedChannels) {
        unsubscribe(channel, socket)
      }
      subscribedChannels.clear()
    })

    socket.on('error', (err) => {
      console.error('[WS] Socket error:', err)
    })

    // Handshake ACK
    socket.send(JSON.stringify({ type: 'connected', ts: Date.now() }))
  })
}
