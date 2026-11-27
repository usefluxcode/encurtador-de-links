# Encurtador de links

API em Node.js que transforma links compridos em códigos curtos, com os dados no PostgreSQL, e uma página para usar no navegador.

## O que ele faz

- Cria links com código sorteado ou escolhido
- Redireciona `/codigo` para o link original e conta os cliques
- Lista, mostra e apaga links, pela API ou pela página

## Como rodar

Precisa do Node.js 26 e de um PostgreSQL com a tabela `links`:

```sql
CREATE TABLE links (codigo TEXT PRIMARY KEY, url TEXT NOT NULL, cliques INTEGER NOT NULL DEFAULT 0);
```

Crie um arquivo `.env` com o endereço do seu banco (ele fica fora do Git):

```
DATABASE_URL=postgres://usuario:senha@localhost:5432/postgres
```

Depois instale e ligue a API:

```powershell
npm install
node --env-file=.env server.js
```

Com a API ligada, sirva a página em outro terminal e abra `http://localhost:5500`:

```powershell
npx -y serve -l 5500 pagina
```

## Testes

```powershell
node --env-file=.env --test
```
