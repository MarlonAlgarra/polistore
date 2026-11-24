import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Inicia sesión | PoliStore" };

export default function LoginPage() {
  return <Suspense><AuthForm mode="login" /></Suspense>;
}
