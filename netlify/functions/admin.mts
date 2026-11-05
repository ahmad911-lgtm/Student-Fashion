import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { timingSafeEqual } from "node:crypto";
import { db } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { toClient } from "../../db/serialize.js";

const json = (body: unknown, status = 200) => Response.json(body, { status });

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function isAdmin(req: Request) {
  const secret = process.env.JWT_SECRET;
  const header = req.headers.get("authorization") || "";
  if (!secret || !header.startsWith("Bearer ")) return false;
  try {
    const decoded = jwt.verify(header.slice(7), secret) as { role?: string };
    return decoded.role === "admin";
  } catch {
    return false;
  }
}

function parseProduct(body: any) {
  const name = String(body?.name ?? "").trim();
  const category = String(body?.category ?? "").trim();
  const price = Number(body?.price);
  const stock = Number(body?.stock ?? 0);
  if (!name || !category) throw new Error("Name and category are required.");
  if (!Number.isFinite(price) || price < 0) throw new Error("Price must be zero or more.");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number zero or more.");
  return {
    name,
    category,
    price,
    stock,
    description: String(body?.description ?? "").trim(),
    image: String(body?.image ?? ""),
  };
}

async function login(req: Request) {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
    return json({ message: "Admin login is not configured." }, 500);
  }
  const { username = "", password = "" } = await req.json().catch(() => ({}));
  if (!safeEqual(String(username), ADMIN_USERNAME) || !safeEqual(String(password), ADMIN_PASSWORD)) {
    return json({ message: "Invalid username or password" }, 401);
  }
  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
  return json({ message: "Admin login successful", token });
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "");

  try {
    if (path === "/api/admin/login") {
      if (req.method !== "POST") return json({ message: "Method not allowed" }, 405);
      return await login(req);
    }

    if (!isAdmin(req)) return json({ message: "Admin login required" }, 401);

    if (path === "/api/admin/products") {
      if (req.method === "GET") {
        const rows = await db.select().from(products).orderBy(desc(products.createdAt));
        return json(rows.map(toClient));
      }
      if (req.method === "POST") {
        let values;
        try { values = parseProduct(await req.json()); }
        catch (e) { return json({ message: (e as Error).message }, 400); }
        const [row] = await db.insert(products).values(values).returning();
        return json({ message: "Product added successfully", product: toClient(row) }, 201);
      }
      return json({ message: "Method not allowed" }, 405);
    }

    const match = path.match(/^\/api\/admin\/products\/([^/]+)$/);
    if (match) {
      const id = Number(match[1]);
      if (!Number.isInteger(id) || id <= 0) return json({ message: "Invalid product ID" }, 400);

      if (req.method === "PUT") {
        let values;
        try { values = parseProduct(await req.json()); }
        catch (e) { return json({ message: (e as Error).message }, 400); }
        const [row] = await db
          .update(products)
          .set({ ...values, updatedAt: new Date() })
          .where(eq(products.id, id))
          .returning();
        if (!row) return json({ message: "Product not found" }, 404);
        return json({ message: "Product updated successfully", product: toClient(row) });
      }
      if (req.method === "DELETE") {
        const [row] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
        if (!row) return json({ message: "Product not found" }, 404);
        return json({ message: "Product deleted successfully" });
      }
      return json({ message: "Method not allowed" }, 405);
    }

    return json({ message: "Not found" }, 404);
  } catch (error) {
    console.error("Admin API error:", error);
    return json({ message: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = {
  path: ["/api/admin/login", "/api/admin/products", "/api/admin/products/*"],
};
