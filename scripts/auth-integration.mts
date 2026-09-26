import "dotenv/config";

import { eq, inArray } from "drizzle-orm";

process.env.BETTER_AUTH_SECRET ??=
  "local-integration-secret-with-at-least-32-characters";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.BETTER_AUTH_TRUSTED_ORIGINS ??= "http://localhost:3000";

const TEST_EMAIL = "auth-integration@example.invalid";
const origin = process.env.BETTER_AUTH_URL;

const [{ auth }, { db }, { accounts, rateLimits, users }] = await Promise.all([
  import("@/features/auth/server/auth"),
  import("@/db/client"),
  import("@/db/schema"),
]);

const testRateLimitKeys = [
  "127.0.0.1|/sign-up/email",
  "127.0.0.1|/sign-in/email",
  "127.0.0.1|/get-session",
  "127.0.0.1|/sign-out",
];

function request(path: string, init?: RequestInit) {
  return auth.handler(
    new Request(`${origin}/api/auth${path}`, {
      ...init,
      headers: {
        origin,
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
        ...init?.headers,
      },
    }),
  );
}

try {
  await db.delete(users).where(eq(users.email, TEST_EMAIL));
  await db.delete(rateLimits).where(inArray(rateLimits.key, testRateLimitKeys));

  const signUpResponse = await request("/sign-up/email", {
    method: "POST",
    body: JSON.stringify({
      name: "Nome que não deve ser persistido",
      email: TEST_EMAIL,
      password: "valid-password-123",
    }),
  });

  if (!signUpResponse.ok) {
    throw new Error(`Cadastro falhou com HTTP ${signUpResponse.status}.`);
  }

  const duplicateResponse = await request("/sign-up/email", {
    method: "POST",
    body: JSON.stringify({
      name: "User",
      email: TEST_EMAIL.toUpperCase(),
      password: "valid-password-123",
    }),
  });

  if (duplicateResponse.ok) {
    throw new Error("Foi possível cadastrar o mesmo e-mail duas vezes.");
  }

  const [createdUser] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.email, TEST_EMAIL));

  if (createdUser?.name !== "User") {
    throw new Error("O nome técnico fixo não foi aplicado pelo servidor.");
  }

  const [credentialAccount] = await db
    .select({ password: accounts.password })
    .from(accounts)
    .where(eq(accounts.userId, createdUser.id));

  if (
    !credentialAccount?.password ||
    credentialAccount.password === "valid-password-123"
  ) {
    throw new Error("A senha não foi armazenada exclusivamente como hash.");
  }

  const setCookies = signUpResponse.headers.getSetCookie();
  const sessionCookie = setCookies.find((value) => value.includes("session_token"));

  if (
    !sessionCookie ||
    !/HttpOnly/i.test(sessionCookie) ||
    !/SameSite=Lax/i.test(sessionCookie) ||
    !/Path=\//i.test(sessionCookie)
  ) {
    throw new Error("O cookie de sessão não possui os atributos de segurança esperados.");
  }

  const cookie = setCookies
    .map((value) => value.split(";", 1)[0])
    .join("; ");

  const sessionResponse = await request("/get-session", {
    headers: { cookie },
  });
  const session = (await sessionResponse.json()) as {
    user?: { email?: string };
  };

  if (session.user?.email !== TEST_EMAIL) {
    throw new Error("A sessão não foi recuperada após o cadastro.");
  }

  for (const blockedPath of [
    "/update-user",
    "/change-email",
    "/change-password",
    "/set-password",
    "/delete-user",
    "/request-password-reset",
    "/reset-password",
    "/send-verification-email",
    "/verify-email",
    "/link-social",
    "/unlink-account",
  ]) {
    const blockedResponse = await request(blockedPath, {
      method: "POST",
      headers: { cookie },
      body: "{}",
    });

    if (blockedResponse.status !== 404) {
      throw new Error(
        `${blockedPath} deveria retornar 404, mas retornou ${blockedResponse.status}.`,
      );
    }
  }

  const signOutResponse = await request("/sign-out", {
    method: "POST",
    headers: { cookie },
    body: "{}",
  });

  if (!signOutResponse.ok) {
    throw new Error(`Logout falhou com HTTP ${signOutResponse.status}.`);
  }

  const invalidLoginResponse = await request("/sign-in/email", {
    method: "POST",
    body: JSON.stringify({ email: TEST_EMAIL, password: "senha-incorreta" }),
  });

  if (invalidLoginResponse.ok) {
    throw new Error("Credenciais inválidas foram aceitas.");
  }

  const validLoginResponse = await request("/sign-in/email", {
    method: "POST",
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: "valid-password-123",
    }),
  });

  if (!validLoginResponse.ok || validLoginResponse.headers.getSetCookie().length === 0) {
    throw new Error("O login válido não criou uma sessão.");
  }

  const persistedRateLimits = await db
    .select({ key: rateLimits.key })
    .from(rateLimits)
    .where(
      inArray(rateLimits.key, [
        "127.0.0.1|/sign-up/email",
        "127.0.0.1|/sign-in/email",
      ]),
    );

  if (persistedRateLimits.length !== 2) {
    throw new Error("O rate limit de cadastro e login não foi persistido no banco.");
  }

  console.log("Integração de autenticação validada com sucesso.");
} finally {
  await db.delete(users).where(eq(users.email, TEST_EMAIL));
  await db.delete(rateLimits).where(inArray(rateLimits.key, testRateLimitKeys));
}
