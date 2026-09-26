import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function read(path: string) {
  return readFileSync(join(projectRoot, path), "utf8");
}

function sourceFiles(directory: string): string[] {
  return readdirSync(join(projectRoot, directory), {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile() && /\.(ts|tsx)$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name));
}

describe("critérios arquiteturais de aceitação", () => {
  it("mantém somente as páginas pública, login e cadastro", () => {
    const pages = sourceFiles("src/app")
      .filter((path) => path.endsWith("page.tsx"))
      .map((path) => relative(join(projectRoot, "src/app"), path).replaceAll("\\", "/"))
      .sort();

    expect(pages).toEqual(["login/page.tsx", "page.tsx", "register/page.tsx"]);
    expect(existsSync(join(projectRoot, "src/app/history/page.tsx"))).toBe(false);
  });

  it("usa Route Handlers e não contém Server Actions ou Server Functions", () => {
    const sources = sourceFiles("src").map((path) => readFileSync(path, "utf8"));

    expect(sources.some((content) => /^['\"]use server['\"];?/m.test(content))).toBe(
      false,
    );
    expect(read("src/app/api/auth/[...all]/route.ts")).toMatch(
      /export const \{ GET, POST \}/,
    );
    expect(read("src/app/api/trpc/[trpc]/route.ts")).toMatch(
      /export \{ handler as GET, handler as POST \}/,
    );
  });

  it("mantém banco, autenticação e provedor isolados no servidor", () => {
    for (const path of [
      "src/db/client.ts",
      "src/features/auth/server/auth.ts",
      "src/features/auth/server/session.ts",
      "src/features/currency/server/free-currency-api.ts",
      "src/features/currency/server/provider.ts",
      "src/features/currency/server/service.ts",
      "src/features/history/server/repository.ts",
      "src/features/history/server/service.ts",
    ]) {
      expect(read(path), path).toMatch(/^import "server-only";/);
    }

    const clientComponents = sourceFiles("src")
      .map((path) => ({ path, content: readFileSync(path, "utf8") }))
      .filter(({ content }) => /^"use client";/m.test(content));

    for (const { path, content } of clientComponents) {
      expect(content, path).not.toMatch(/from ["']@\/db\//);
      expect(content, path).not.toMatch(/from ["']@\/features\/.+\/server\//);
      expect(content, path).not.toContain("FREECURRENCY_API_KEY");
    }
  });

  it("mantém os procedimentos de moeda públicos e o histórico protegido", () => {
    const currencyRouter = read("src/trpc/routers/currency.ts");
    const historyRouter = read("src/trpc/routers/history.ts");
    const context = read("src/trpc/init.ts");

    expect(currencyRouter.match(/\w+: publicProcedure/g)).toHaveLength(2);
    expect(historyRouter.match(/\w+: protectedProcedure/g)).toHaveLength(3);
    expect(context.match(/auth\.api\.getSession/g)).toHaveLength(1);
    expect(context).toContain("if (!ctx.session)");
  });

  it("preserva as políticas de sessão, senha, cookies e rate limit", () => {
    const auth = read("src/features/auth/server/auth.ts");

    expect(auth).toContain("minPasswordLength: 8");
    expect(auth).toContain("maxPasswordLength: 128");
    expect(auth).toContain("autoSignIn: true");
    expect(auth).toContain("expiresIn: 60 * 60 * 24 * 7");
    expect(auth).toContain('storage: "database"');
    expect(auth).toContain('"/sign-in/email": { window: 60, max: 5 }');
    expect(auth).toContain('"/sign-up/email": { window: 60, max: 3 }');
    expect(auth).toContain("httpOnly: true");
    expect(auth).toContain('sameSite: "lax"');
    expect(auth).toContain('secure: process.env.NODE_ENV === "production"');

    for (const path of [
      "/update-user",
      "/change-email",
      "/change-password",
      "/delete-user",
      "/request-password-reset",
      "/reset-password",
      "/send-verification-email",
      "/verify-email",
    ]) {
      expect(auth).toContain(`"${path}"`);
    }
  });

  it("mantém integridade, timezone, cascata e índices do banco", () => {
    const schema = read("src/db/schema.ts");

    expect(schema).toContain('uniqueIndex("users_email_unique")');
    expect(schema).toContain('uniqueIndex("conversion_history_user_request_unique")');
    expect(schema).toContain('index("conversion_history_user_cursor_idx")');
    expect(schema.match(/withTimezone: true/g)?.length).toBeGreaterThanOrEqual(8);
    expect(schema.match(/onDelete: "cascade"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(schema).toContain('password: text()');
    expect(schema).not.toContain("passwordHash");
  });

  it("mantém idioma, tema claro, largura mínima e movimento reduzido", () => {
    const layout = read("src/app/layout.tsx");
    const theme = read("src/theme.ts");
    const css = read("src/app/globals.css");

    expect(layout).toContain('lang="pt-BR"');
    expect(layout).toContain('default: "Conversor de Moedas"');
    expect(theme).toContain('mode: "light"');
    expect(css).toContain("min-width: 320px");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("transition-duration: 0.01ms !important");
  });

  it("não registra o objeto completo do erro em produção", () => {
    const boundary = read("src/app/error.tsx");

    expect(boundary).toContain('process.env.NODE_ENV === "development"');
    expect(boundary).toContain('error.digest ?? "sem digest"');
  });
});
