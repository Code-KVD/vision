# Vision Backend — Architecture Guide

## Overview

Scalable REST + WebSocket API for the Vision prediction market app.
Designed to handle **100k concurrent users** on commodity hardware.

---

## Tech Stack

| Component | Technology | Role |
|---|---|---|
| HTTP Framework | **Fastify 4** | ~3× faster than Express; schema-first; low overhead |
| Language | **TypeScript** | End-to-end type safety |
| Database | **PostgreSQL 16** | Primary datastore; ACID; excellent index support |
| Cache / Leaderboards | **Redis 7** | Sorted sets for O(log n) rank queries; pub/sub for WS fan-out |
| Auth | **JWT (RS256-compatible)** | Stateless — any server instance handles any request |
| Real-time | **WebSocket + Redis pub/sub** | Fan-out across multiple server replicas |
| Job Queue | **BullMQ** | Async notifications, aura resolution, scheduled jobs |
| Validation | **Zod** | Runtime type safety at API boundaries |
| ORM | **Drizzle ORM** | Lightweight, fully type-safe; no magic |
| Container | **Docker Compose** | One-command local + production setup |

---

## Directory Structure

```
backend/
├── src/
│   ├── config/         # Env validation (Zod)
│   ├── db/
│   │   ├── schema.ts   # All table/enum definitions (Drizzle)
│   │   ├── index.ts    # Connection pool
│   │   └── migrate.ts  # Migration runner
│   ├── routes/         # Thin controllers — parse input, call service, return
│   │   ├── auth.ts
│   │   ├── predictions.ts
│   │   ├── leaderboard.ts
│   │   ├── activity.ts
│   │   └── users.ts
│   ├── services/       # Business logic — all DB/Redis calls live here
│   │   ├── auth.service.ts
│   │   ├── prediction.service.ts
│   │   ├── vote.service.ts
│   │   ├── leaderboard.service.ts
│   │   ├── aura.service.ts
│   │   ├── activity.service.ts
│   │   └── user.service.ts
│   ├── middleware/
│   │   └── auth.ts     # JWT authentication hooks
│   ├── queues/
│   │   ├── notification.queue.ts  # Activity feed jobs
│   │   └── aura.queue.ts          # Prediction resolution + aura distribution
│   ├── websocket/
│   │   └── index.ts    # WS routes + Redis pub/sub fan-out
│   ├── utils/
│   │   ├── redis.ts    # Redis client + key helpers + cache utilities
│   │   ├── errors.ts   # Typed HTTP errors
│   │   ├── password.ts # scrypt hashing
│   │   └── pagination.ts
│   └── server.ts       # App bootstrap + graceful shutdown
├── infra/
│   ├── postgres.conf   # PostgreSQL performance tuning
│   └── nginx.conf      # Reverse proxy + load balancer config
├── drizzle.config.ts
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## Scalability Design

### How we hit 100k concurrent users

#### 1. Stateless API (horizontal scaling)
- JWT auth means no server-side session state
- Add more API replicas behind the nginx `upstream` block
- All instances share the same PostgreSQL + Redis

#### 2. Redis for hot data
- **Leaderboards** → Redis Sorted Sets (`ZADD` / `ZREVRANGE`) — O(log n) rank updates, O(log n + k) top-k queries
- **Vote counts** → `INCR` per prediction — atomic, sub-millisecond, no DB write on each vote
- **Prediction cache** → JSON snapshots with 30s TTL — prevents DB hammering on popular predictions
- **Rate limiting** → Redis-backed `@fastify/rate-limit` — shared across replicas

#### 3. DB connection pooling
- Each API instance uses a `pg.Pool` (min=5, max=20)
- With 10 replicas: 200 total connections → well within PostgreSQL's `max_connections=500`

#### 4. Async operations via BullMQ
- Voting → immediate Redis `INCR` + queue a DB write (non-blocking for the user)
- Notifications → queued, processed by a worker with 20× concurrency
- Aura resolution → heavy DB transaction; queued + processed at low concurrency (5×)

#### 5. WebSocket fan-out via Redis pub/sub
- Each server instance maintains its own WebSocket connections
- When any instance publishes an event (vote cast, prediction resolved), Redis pub/sub delivers it to ALL instances
- Each instance fans out to its locally connected clients
- Zero inter-process coordination needed

#### 6. Database indexing strategy
- `predictions`: `(status, category)` compound index for feed queries; `(status, total_votes)` for hot predictions
- `votes`: unique index on `(user_id, prediction_id)` — duplicate vote prevention at DB level
- `activities`: `(recipient_id, created_at)` for feed pagination; `(recipient_id, status)` for unread count
- `users`: indexes on `aura_points` and `accuracy_percent` for leaderboard fallback queries

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Get access + refresh tokens |
| POST | `/auth/refresh` | — | Rotate tokens |
| POST | `/auth/logout` | ✓ | Revoke refresh token |
| GET | `/auth/me` | ✓ | Current user identity |

### Predictions
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/predictions` | optional | List predictions (filterable by category/status) |
| GET | `/predictions/:id` | optional | Get single prediction |
| POST | `/predictions` | ✓ | Create prediction |
| DELETE | `/predictions/:id` | ✓ | Delete own prediction |
| POST | `/predictions/:id/votes` | ✓ | Cast YES/NO vote |
| POST | `/predictions/:id/likes` | ✓ | Toggle like |
| POST | `/predictions/:id/resolve` | ✓ | Resolve prediction (creator only) |

### Leaderboard
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/leaderboard` | — | Get top N users (`?type=global\|weekly\|accuracy`) |
| GET | `/leaderboard/me` | ✓ | Get current user's rank |

### Activity
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/activity` | ✓ | Paginated activity feed |
| GET | `/activity/unread-count` | ✓ | Unread notification count |
| POST | `/activity/read-all` | ✓ | Mark all as read |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/:id` | optional | Get user profile |
| GET | `/users/me` | ✓ | Own profile |
| PATCH | `/users/me` | ✓ | Update profile |
| POST | `/users/:id/follow` | ✓ | Follow user |
| DELETE | `/users/:id/follow` | ✓ | Unfollow user |
| GET | `/users/:id/badges` | — | Get user badges |
| GET | `/users/predictions/:id/comments` | optional | Get comments on prediction |
| POST | `/users/predictions/:id/comments` | ✓ | Post comment |
| POST | `/users/comments/:id/likes` | ✓ | Toggle comment like |

### WebSocket
Connect to `ws://host/ws`, then send JSON messages:
```json
{ "type": "subscribe_prediction", "predictionId": "uuid" }
{ "type": "unsubscribe_prediction", "predictionId": "uuid" }
{ "type": "ping" }
```
Receive events:
```json
{ "type": "vote_cast", "predictionId": "...", "vote": "yes" }
{ "type": "prediction_resolved", "predictionId": "...", "outcome": "yes" }
{ "type": "pong", "ts": 1234567890 }
```

---

## Local Development

```bash
# 1. Start PostgreSQL + Redis
docker compose up postgres redis -d

# 2. Copy and fill env
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Generate + run migrations
npm run db:generate
npx tsx src/db/migrate.ts

# 5. Start dev server (hot reload)
npm run dev
```

## Production Deployment

```bash
# Build and start all services
docker compose up --build -d

# Scale to 3 API replicas
docker compose up --scale api=3 -d
```

---

## Scaling Roadmap (beyond 100k)

1. **Read replicas** — route `SELECT` queries to PostgreSQL read replicas
2. **Redis Cluster** — shard Redis across multiple nodes for >1M keys
3. **CDN for static** — serve the React frontend from Cloudflare/Fastly
4. **Dedicated worker nodes** — run BullMQ workers on separate machines
5. **TimescaleDB** — migrate activity/vote time-series data for analytics
6. **gRPC internal services** — split leaderboard/aura into microservices if they become bottlenecks
