import { createServer } from "node:http";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const CORS = {
  "Access-Control-Allow-Origin": "http://localhost:5500",
  "Access-Control-Allow-Methods": "GET, POST, DELETE",
  "Access-Control-Allow-Headers": "Content-Type",
};

function responder(res, status, dados) {
  res.writeHead(status, { ...CORS, "Content-Type": "application/json" });
  res.end(JSON.stringify(dados));
}

function gerarCodigo() {
  const letras = "abcdefghijklmnopqrstuvwxyz0123456789";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += letras[Math.floor(Math.random() * letras.length)];
  }
  return codigo;
}

async function lerCorpo(req) {
  let corpo = "";
  for await (const pedaco of req) corpo += pedaco;
  return JSON.parse(corpo);
}

const servidor = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost:3000");
  const [, recurso, codigo] = url.pathname.split("/");
  console.log(req.method, url.pathname);

  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }

  if (recurso === "links" && !codigo) {
    if (req.method === "GET") {
      const { rows } = await pool.query("SELECT * FROM links ORDER BY codigo");
      return responder(res, 200, rows);
    }
    if (req.method === "POST") {
      let dados;
      try {
        dados = await lerCorpo(req);
      } catch {
        return responder(res, 400, { erro: "JSON inválido" });
      }
      try {
        const { rows } = await pool.query(
          "INSERT INTO links (codigo, url) VALUES ($1, $2) RETURNING *",
          [dados.codigo ?? gerarCodigo(), dados.url],
        );
        return responder(res, 201, rows[0]);
      } catch (erro) {
        if (erro.code === "23505") return responder(res, 409, { erro: "Código já existe" });
        throw erro;
      }
    }
  }

  if (recurso === "links" && codigo) {
    if (req.method === "GET") {
      const { rows } = await pool.query("SELECT * FROM links WHERE codigo = $1", [codigo]);
      if (!rows.length) return responder(res, 404, { erro: "Link não encontrado" });
      return responder(res, 200, rows[0]);
    }
    if (req.method === "DELETE") {
      const r = await pool.query("DELETE FROM links WHERE codigo = $1", [codigo]);
      if (!r.rowCount) return responder(res, 404, { erro: "Link não encontrado" });
      res.writeHead(204, CORS);
      return res.end();
    }
  }

  if (req.method === "GET" && recurso && !codigo) {
    const { rows } = await pool.query(
      "UPDATE links SET cliques = cliques + 1 WHERE codigo = $1 RETURNING url",
      [recurso],
    );
    if (rows.length) {
      res.writeHead(302, { Location: rows[0].url });
      return res.end();
    }
  }
  responder(res, 404, { erro: "Não encontrado" });
});

if (import.meta.main) {
  servidor.listen(3000, "localhost", () => {
    console.log("Encurtador em http://localhost:3000");
  });
}

export { servidor, pool };
