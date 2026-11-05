import { pgTable, serial, text, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: text().notNull(),
  price: doublePrecision().notNull(),
  category: text().notNull(),
  description: text().notNull().default(""),
  image: text().notNull().default(""),
  stock: integer().notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
