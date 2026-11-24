import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { AuthForm } from "./AuthForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function labelsFor(html: string) {
  const labels = [...html.matchAll(/<label for="([^"]+)"[^>]*>([^<]+)<\/label>/g)];
  return Object.fromEntries(labels.map(([, id, text]) => [id, text]));
}

describe("Formulario de registro", () => {
  test("UT-REG-02: cada campo del registro tiene su etiqueta correcta asociada al input", () => {
    const html = renderToStaticMarkup(<AuthForm mode="registro" />);
    expect(labelsFor(html)).toEqual({
      "registro-name": "Nombre completo",
      "registro-email": "Correo electrónico",
      "registro-password": "Contraseña (mínimo 8 caracteres)",
    });
    for (const id of ["registro-name", "registro-email", "registro-password"]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('type="email"');
    expect(html).toContain('minLength="8"');
  });

  test("el formulario de inicio de sesión no pide nombre", () => {
    expect(Object.keys(labelsFor(renderToStaticMarkup(<AuthForm mode="login" />)))).toEqual([
      "login-email",
      "login-password",
    ]);
  });
});
