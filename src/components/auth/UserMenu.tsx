"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

// Muestra el cliente con sesión (y el botón para salir) o el acceso a ingresar/registrarse.
export function UserMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    api<{ user: User }>("/auth/me").then((result) => active && setUser(result.ok ? result.data.user : null));
    return () => {
      active = false;
    };
  }, [pathname]);

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (user === undefined) return <span className="w-20" aria-hidden="true" />;
  if (!user) return <Link href="/login" className="btn-ghost">Ingresar</Link>;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="hidden sm:inline">Hola, <strong>{user.name.split(" ")[0]}</strong></span>
      <button type="button" onClick={logout} className="btn-ghost">Salir</button>
    </div>
  );
}
