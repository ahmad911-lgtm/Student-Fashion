import { products } from "./schema.js";

type ProductRow = typeof products.$inferSelect;

// Keep the `_id` field the existing pages expect.
export function toClient(row: ProductRow) {
  return { _id: String(row.id), ...row };
}
