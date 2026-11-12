import { SITE_NAME } from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-primary px-6 py-16 text-center text-white">
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
        {SITE_NAME}
      </h1>
      <div className="my-6 h-1 w-24 rounded-full bg-secondary" aria-hidden="true" />
      <p className="text-2xl font-semibold text-secondary sm:text-3xl">
        Sitio en construcción
      </p>
      <p className="mt-4 max-w-md text-base text-white/80">
        Estamos preparando la tienda de ropa deportiva universitaria. Vuelve
        pronto.
      </p>
    </main>
  );
}
