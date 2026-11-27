import { test, before, after } from "node:test";
import assert from "node:assert";
import { servidor, pool } from "./server.js";

const base = "http://localhost:3001";

before(async () => {
  await pool.query("DELETE FROM links WHERE codigo = $1", ["teste"]);
  await new Promise((resolve) => servidor.listen(3001, "localhost", resolve));
});

test("POST /links cria um link", async () => {
  const resposta = await fetch(`${base}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://nodejs.org", codigo: "teste" }),
  });
  assert.strictEqual(resposta.status, 201);
});

test("GET /teste redireciona com 302", async () => {
  const resposta = await fetch(`${base}/teste`, { redirect: "manual" });
  assert.strictEqual(resposta.status, 302);
  assert.strictEqual(resposta.headers.get("location"), "https://nodejs.org");
});

after(async () => {
  await new Promise((resolve) => servidor.close(resolve));
  await pool.end();
});
