import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Registro | PoliStore" };

export default function RegistroPage() {
  return <Suspense><AuthForm mode="registro" /></Suspense>;
}
