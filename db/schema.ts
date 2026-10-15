// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const reviews = sqliteTable('reviews', {
 id: text('id').primaryKey(), name: text('name').notNull(), company: text('company').notNull().default(''),
 service: text('service').notNull(), rating: integer('rating').notNull(), body: text('body').notNull(),
 status: text('status').notNull().default('pending'), createdAt: text('created_at').notNull(),
});
export const rateBuckets = sqliteTable('rate_buckets', {
 id: text('id').primaryKey(), count: integer('count').notNull(), expires: integer('expires').notNull(),
});
