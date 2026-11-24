import { CartView } from "@/components/cart/CartView";

export const metadata = { title: "Carrito | PoliStore" };

export default function CarritoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tu carrito</h1>
      <CartView />
    </div>
  );
}
