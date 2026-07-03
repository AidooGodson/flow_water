import { pgTable, text, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['manager', 'sales_rep']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Supabase auth user ID
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('sales_rep'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const callReports = pgTable('CallReport', {
  id: text('id').primaryKey(),
  userId: uuid('userId').references(() => users.id),
  date: timestamp('date', { mode: 'date' }).notNull(),
  customerName: text('customerName').notNull(),
  telephone: text('telephone').notNull(),
  location: text('location'),
  product: text('product').notNull(),
  buyerType: text('buyerType').notNull(),
  comments: text('comments'),
  summary: text('summary'),
  followUpDate: timestamp('followUpDate', { mode: 'date' }),
  followedUpBy: text('followedUpBy').notNull(),
  status: text('status').notNull().default('New'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull(),
  createdBy: text('createdBy').notNull(),
});
