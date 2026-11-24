import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { Header } from "@/components/layout/Header";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SITE_NAME} | Tienda deportiva del Poli`,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
        </CartProvider>
        <footer className="bg-primary py-6 text-center text-sm text-white/80">
          {SITE_NAME} · Politécnico Grancolombiano · Proyecto académico Equipo 9
        </footer>
      </body>
    </html>
  );
}
