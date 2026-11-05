import type { Config } from "@netlify/functions";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { toClient } from "../../db/serialize.js";

export default async () => {
  try {
    const rows = await db.select().from(products).orderBy(desc(products.createdAt));
    return Response.json(rows.map(toClient));
  } catch (error) {
    console.error("Failed to load products:", error);
    return Response.json({ message: "Could not load products." }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/products",
  method: "GET",
};
