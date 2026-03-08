import {
  pgTable,
  text,
  varchar,
  integer,
  bigint,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  uuid,
  real,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const riskLevelEnum = pgEnum('risk_level', ['safe', 'bold', 'hot_take', 'crazy'])
export const categoryEnum = pgEnum('category', [
  'ai_tech',
  'sports',
  'crypto',
  'politics',
  'entertainment',
  'science',
  'other',
])
export const voteEnum = pgEnum('vote', ['yes', 'no'])
export const predictionStatusEnum = pgEnum('prediction_status', [
  'active',
  'resolved_yes',
  'resolved_no',
  'cancelled',
])
export const activityTypeEnum = pgEnum('activity_type', [
  'voted_on_prediction',
  'liked_prediction',
  'commented_on_prediction',
  'followed_user',
  'prediction_resolved',
  'earned_aura',
  'replied_to_comment',
])
export const notificationStatusEnum = pgEnum('notification_status', ['unread', 'read'])

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    username: varchar('username', { length: 32 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: varchar('display_name', { length: 64 }).notNull(),
    bio: text('bio'),
    location: varchar('location', { length: 100 }),
    avatarUrl: text('avatar_url'),

    // Aura / Stats
    auraPoints: integer('aura_points').notNull().default(0),
    totalPredictions: integer('total_predictions').notNull().default(0),
    totalVotes: integer('total_votes').notNull().default(0),
    correctVotes: integer('correct_votes').notNull().default(0),
    currentStreak: integer('current_streak').notNull().default(0),
    longestStreak: integer('longest_streak').notNull().default(0),
    accuracyPercent: real('accuracy_percent').notNull().default(0),

    // Auth
    refreshTokenHash: text('refresh_token_hash'),
    emailVerified: boolean('email_verified').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    usernameIdx: uniqueIndex('users_username_idx').on(t.username),
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
    auraIdx: index('users_aura_idx').on(t.auraPoints),
    accuracyIdx: index('users_accuracy_idx').on(t.accuracyPercent),
  }),
)

// ─── Predictions ──────────────────────────────────────────────────────────────

export const predictions = pgTable(
  'predictions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    question: text('question').notNull(),
    category: categoryEnum('category').notNull(),
    riskLevel: riskLevelEnum('risk_level').notNull().default('safe'),
    status: predictionStatusEnum('status').notNull().default('active'),

    // Vote counts (denormalized for performance — synced from Redis)
    yesCount: integer('yes_count').notNull().default(0),
    noCount: integer('no_count').notNull().default(0),
    totalVotes: integer('total_votes').notNull().default(0),

    // Aura reward for correct vote
    auraReward: integer('aura_reward').notNull().default(10),

    // Social
    likeCount: integer('like_count').notNull().default(0),
    commentCount: integer('comment_count').notNull().default(0),

    resolvesAt: timestamp('resolves_at', { withTimezone: true }).notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    creatorIdx: index('predictions_creator_idx').on(t.creatorId),
    statusIdx: index('predictions_status_idx').on(t.status),
    categoryIdx: index('predictions_category_idx').on(t.category),
    resolvesAtIdx: index('predictions_resolves_at_idx').on(t.resolvesAt),
    // Compound index for the common "active predictions by category" query
    activeCategoryIdx: index('predictions_active_category_idx').on(t.status, t.category),
    // Hot predictions (many votes) — for homepage ranking
    hotIdx: index('predictions_hot_idx').on(t.status, t.totalVotes),
  }),
)

// ─── Votes ────────────────────────────────────────────────────────────────────

export const votes = pgTable(
  'votes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    predictionId: uuid('prediction_id')
      .notNull()
      .references(() => predictions.id, { onDelete: 'cascade' }),
    vote: voteEnum('vote').notNull(),
    // Aura earned on resolution (null until resolved)
    auraEarned: integer('aura_earned'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    // One vote per user per prediction
    uniqueVote: uniqueIndex('votes_user_prediction_idx').on(t.userId, t.predictionId),
    predictionIdx: index('votes_prediction_idx').on(t.predictionId),
    userIdx: index('votes_user_idx').on(t.userId),
  }),
)

// ─── Comments ─────────────────────────────────────────────────────────────────

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    predictionId: uuid('prediction_id')
      .notNull()
      .references(() => predictions.id, { onDelete: 'cascade' }),
    parentId: uuid('parent_id'), // For threaded replies (self-ref, added below)
    content: text('content').notNull(),
    likeCount: integer('like_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    predictionIdx: index('comments_prediction_idx').on(t.predictionId),
    userIdx: index('comments_user_idx').on(t.userId),
    parentIdx: index('comments_parent_idx').on(t.parentId),
  }),
)

// ─── Likes ────────────────────────────────────────────────────────────────────

export const predictionLikes = pgTable(
  'prediction_likes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    predictionId: uuid('prediction_id')
      .notNull()
      .references(() => predictions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.predictionId] }),
  }),
)

export const commentLikes = pgTable(
  'comment_likes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.commentId] }),
  }),
)

// ─── Follows ──────────────────────────────────────────────────────────────────

export const follows = pgTable(
  'follows',
  {
    followerId: uuid('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followingId: uuid('following_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
    followingIdx: index('follows_following_idx').on(t.followingId),
  }),
)

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const activities = pgTable(
  'activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Who receives this activity in their feed
    recipientId: uuid('recipient_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Who performed the action
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    type: activityTypeEnum('type').notNull(),
    // Polymorphic references (store as text UUIDs for flexibility)
    predictionId: uuid('prediction_id').references(() => predictions.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
    status: notificationStatusEnum('status').notNull().default('unread'),
    metadata: text('metadata'), // JSON string for extra data
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    recipientIdx: index('activities_recipient_idx').on(t.recipientId, t.createdAt),
    unreadIdx: index('activities_unread_idx').on(t.recipientId, t.status),
  }),
)

// ─── Badges ───────────────────────────────────────────────────────────────────

export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  description: text('description').notNull(),
  iconUrl: text('icon_url'),
  auraThreshold: integer('aura_threshold'),
  accuracyThreshold: real('accuracy_threshold'),
})

export const userBadges = pgTable(
  'user_badges',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    badgeId: uuid('badge_id')
      .notNull()
      .references(() => badges.id, { onDelete: 'cascade' }),
    earnedAt: timestamp('earned_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.badgeId] }),
  }),
)

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  predictions: many(predictions),
  votes: many(votes),
  comments: many(comments),
  predictionLikes: many(predictionLikes),
  followers: many(follows, { relationName: 'following' }),
  following: many(follows, { relationName: 'follower' }),
  activities: many(activities, { relationName: 'recipient' }),
  userBadges: many(userBadges),
}))

export const predictionsRelations = relations(predictions, ({ one, many }) => ({
  creator: one(users, { fields: [predictions.creatorId], references: [users.id] }),
  votes: many(votes),
  comments: many(comments),
  likes: many(predictionLikes),
  activities: many(activities),
}))

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, { fields: [votes.userId], references: [users.id] }),
  prediction: one(predictions, { fields: [votes.predictionId], references: [predictions.id] }),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  prediction: one(predictions, { fields: [comments.predictionId], references: [predictions.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id], relationName: 'replies' }),
  replies: many(comments, { relationName: 'replies' }),
  likes: many(commentLikes),
}))

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: 'follower' }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: 'following' }),
}))
