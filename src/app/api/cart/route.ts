import { db } from "@/db";
import { readCart } from "@/lib/cart-cookie";
import { respond } from "@/lib/http";
import { summarize } from "@/services/cart";

// GET /api/cart: artículos, cantidad total y total a pagar
export async function GET() {
  return respond(async () => summarize(db, await readCart()));
}
