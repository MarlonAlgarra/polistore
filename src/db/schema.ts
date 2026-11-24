import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = () => integer("id").primaryKey({ autoIncrement: true });
const createdAt = () => text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`);

// Catálogo: el código del artículo es único y el precio es un entero en centavos.
export const products = sqliteTable("products", {
  id: id(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  size: text("size").notNull(),
  color: text("color").notNull(),
  category: text("category").notNull(),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
}, (t) => [
  check("price_cents_entero", sql`typeof(${t.priceCents}) = 'integer' AND ${t.priceCents} > 0`),
  check("stock_entero", sql`typeof(${t.stock}) = 'integer' AND ${t.stock} >= 0`),
]);

export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});

export const orders = sqliteTable("orders", {
  id: id(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalCents: integer("total_cents").notNull(),
  createdAt: createdAt(),
});

export const orderItems = sqliteTable("order_items", {
  id: id(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
}, (t) => [check("cantidad_minima", sql`${t.quantity} >= 1`)]);
