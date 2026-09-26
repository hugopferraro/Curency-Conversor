# Conversor de Moedas

Aplicação Next.js para conversão de moedas com taxas de fechamento da FreecurrencyAPI, autenticação por e-mail e senha e histórico privado de conversões.

## Tecnologias

- Next.js com App Router e Route Handlers HTTP
- Material UI
- tRPC e TanStack Query
- Better Auth
- PostgreSQL e Drizzle ORM
- Decimal.js, Zod, Vitest e Testing Library

## Configuração local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e preencha as variáveis.
3. Crie o banco PostgreSQL indicado por `DATABASE_URL`.
4. Aplique as migrações com `npm run db:migrate`.
5. Inicie a aplicação com `npm run dev` e acesse `http://localhost:3000`.

`BETTER_AUTH_SECRET` deve ser um segredo aleatório com pelo menos 32 caracteres. `FREECURRENCY_API_KEY` permanece somente no servidor e é enviada à FreecurrencyAPI pelo header `apikey`.

## Comandos

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:auth-integration
npm run test:backend-integration
npm run test:e2e
npm run build
npm run db:generate
npm run db:migrate
```

O teste de integração de autenticação usa o banco configurado em `DATABASE_URL`, cria dados temporários e os remove ao final. Os critérios funcionais completos estão em [docs/Acceptance Criteria.md](docs/Acceptance%20Criteria.md).
