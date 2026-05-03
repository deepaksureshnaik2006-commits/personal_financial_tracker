import { pgTable, text, real } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'user' | 'admin'
  createdAt: text("created_at").notNull()
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // reference to users.id
  type: text("type").notNull(), // 'income' | 'expense'
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull()
});

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // reference to users.id
  category: text("category").notNull(),
  limitAmount: real("limit_amount").notNull(),
  period: text("period").notNull(), // 'weekly' | 'monthly'
  createdAt: text("created_at").notNull()
});
