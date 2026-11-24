import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { CartLink } from "@/components/cart/CartLink";
import { SITE_NAME } from "@/lib/constants";
import { CategoryMenu } from "./CategoryMenu";
import { SearchBar } from "./SearchBar";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-primary text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary text-lg text-primary">P</span>
          {SITE_NAME}
        </Link>
        <div className="order-3 w-full sm:order-none sm:flex-1">
          <Suspense><SearchBar /></Suspense>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Suspense><UserMenu /></Suspense>
          <CartLink />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4">
        <Suspense><CategoryMenu /></Suspense>
      </div>
    </header>
  );
}
