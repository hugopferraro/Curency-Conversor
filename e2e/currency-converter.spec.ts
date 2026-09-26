import "dotenv/config";

import { expect, test } from "@playwright/test";
import { Pool } from "pg";

const TEST_EMAIL = "currency-e2e@example.invalid";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL é obrigatória para o teste E2E.");

const pool = new Pool({ connectionString: databaseUrl });

async function cleanup() {
  await pool.query("DELETE FROM users WHERE email = $1", [TEST_EMAIL]);
  await pool.query("DELETE FROM rate_limits WHERE key IN ($1, $2, $3)", [
    "127.0.0.2|/sign-up/email",
    "127.0.0.2|/sign-in/email",
    "127.0.0.2|/sign-out",
  ]);
}

test.beforeAll(cleanup);
test.afterAll(async () => {
  await cleanup();
  await pool.end();
});

test("cadastro, conversão, histórico, reutilização, exclusão e logout", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Fluxo completo executado no desktop.");

  await page.goto("/register");
  await page.getByLabel("E-mail").fill(TEST_EMAIL);
  await page.getByLabel("Senha", { exact: true }).fill("valid-password-123");
  await page.getByLabel("Confirmar senha").fill("valid-password-123");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText(TEST_EMAIL)).toBeVisible();

  await page.goto("/login");
  await expect(page).toHaveURL("/");
  await page.goto("/register");
  await expect(page).toHaveURL("/");

  const amount = page.getByLabel("Valor");
  await expect(page.getByLabel("Moeda de origem")).toHaveValue(
    "BRL — Real brasileiro",
  );
  await expect(page.getByLabel("Moeda de destino")).toHaveValue(
    "USD — Dólar americano",
  );
  await amount.fill("10");
  await page.getByRole("button", { name: "Converter" }).click();
  await expect(page.getByText("2,00 USD").first()).toBeVisible();
  await expect(page.getByText("Conversão salva no seu histórico.")).toBeVisible();

  await page.reload();
  await expect(page.getByText(TEST_EMAIL)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Histórico" })).toBeVisible();

  await page.getByRole("button", { name: "Reutilizar" }).click();
  await expect(amount).toBeFocused();
  await expect(amount).toHaveValue("10");

  await page.getByRole("button", { name: "Excluir" }).first().click();
  const deleteDialog = page.getByRole("dialog", { name: "Excluir esta conversão?" });
  await deleteDialog.getByRole("button", { name: "Excluir" }).click();
  await expect(deleteDialog).toBeHidden();
  await expect(page.getByText(/histórico ainda está vazio/i)).toBeVisible();

  await page.getByRole("button", { name: "Sair" }).click();
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Criar conta" }),
  ).toBeVisible();
  await expect(page.getByText("Guarde suas conversões")).toBeVisible();

  await amount.fill("5");
  await page.getByRole("button", { name: "Converter" }).click();
  await expect(page.getByText("1,00 USD").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Histórico" })).toHaveCount(0);

  await page.getByRole("banner").getByRole("link", { name: "Entrar" }).click();
  await page.getByLabel("E-mail").fill(TEST_EMAIL);
  await page.getByLabel("Senha", { exact: true }).fill("invalid-password");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(
    page.getByText("E-mail ou senha inválidos. Verifique os dados e tente novamente."),
  ).toBeVisible();
  await expect(page).toHaveURL("/login");

  await page.getByLabel("Senha", { exact: true }).fill("valid-password-123");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "Sair" })).toBeEnabled();
});

test("navegação móvel expõe as ações de autenticação", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Cenário exclusivo do projeto móvel.");

  await page.goto("/");
  await expect(page.getByRole("button", { name: "Converter" })).toBeEnabled();
  await page.getByRole("button", { name: "Abrir menu da conta" }).click();
  await expect(page.getByRole("menuitem", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Criar conta" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem", { name: "Entrar" })).toBeHidden();
});
