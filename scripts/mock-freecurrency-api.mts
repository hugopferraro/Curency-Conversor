import { createServer } from "node:http";

const port = Number(process.env.MOCK_CURRENCY_PORT ?? 4010);

const currencies = {
  data: {
    BRL: { name: "Real brasileiro", symbol: "R$", decimal_digits: 2 },
    EUR: { name: "Euro", symbol: "€", decimal_digits: 2 },
    USD: { name: "Dólar americano", symbol: "$", decimal_digits: 2 },
  },
};

const rates = { data: { BRL: 5, EUR: 0.8, USD: 1 } };

const server = createServer((request, response) => {
  response.setHeader("content-type", "application/json; charset=utf-8");

  if (request.url === "/health") {
    response.end(JSON.stringify({ ok: true }));
    return;
  }

  if (request.headers.apikey !== "e2e-api-key") {
    response.statusCode = 401;
    response.end(JSON.stringify({ message: "Unauthorized" }));
    return;
  }

  if (request.url?.startsWith("/v1/currencies")) {
    response.end(JSON.stringify(currencies));
    return;
  }

  if (request.url?.startsWith("/v1/latest")) {
    response.end(JSON.stringify(rates));
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ message: "Not found" }));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock FreecurrencyAPI disponível na porta ${port}.`);
});

function closeServer() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
