import { Suspense } from "react";
import { ProductDetail } from "@/components/products/ProductDetail";

async function DetailFromParams({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}

export default function ProductPage({ params }: PageProps<"/productos/[id]">) {
  return (
    <Suspense fallback={<p className="py-12 text-center">Cargando artículo…</p>}>
      <DetailFromParams params={params} />
    </Suspense>
  );
}
