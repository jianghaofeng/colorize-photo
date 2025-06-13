import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { userTable } from '../users/tables';

export const uploadsTable = pgTable('uploads', {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  creditConsumed: integer('credit_consumed'),
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  type: text('type').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  url: text('url').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
});

// Relations moved to relations.ts
/*
relations(uploadsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [uploadsTable.userId],
    references: [userTable.id],
  }),
}));
*/
