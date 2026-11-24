import { cookies } from "next/headers";
import { type CartState, parseCart } from "@/services/cart";

const COOKIE = "polistore_cart";

export async function readCart(): Promise<CartState> {
  return parseCart((await cookies()).get(COOKIE)?.value);
}

export async function saveCart(cart: CartState): Promise<void> {
  (await cookies()).set(COOKIE, JSON.stringify(cart), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
}
