# Inventory Management System

A small inventory app for an online store: **CLI**, **local web UI**, and **Vercel-ready** serverless API + static frontend.

Built with **Node.js** (ES modules).

## Features

1. **Add product** — SKU (normalized to uppercase), name, quantity  
2. **View products** — sorted by SKU  
3. **Update quantity** — by SKU  
4. **Bulk CSV import** — messy `incoming_stock.csv` with grouped import report  

## Quick start

```bash
cd inventory-cli
npm install
```

### CLI (take-home requirement)

```bash
npm start
```

### Web UI (local)

```bash
npm run web
```

Open [http://localhost:3000](http://localhost:3000). Data is stored in `inventory.json`.

## Deploy to Vercel

1. Push this folder to GitHub.  
2. [vercel.com](https://vercel.com) → **Add New Project** → import the repo.  
   - Set **Root Directory** to `inventory-cli` if the repo root is the parent `Stronium` folder.  
3. In the Vercel project → **Storage** → add **Upstash Redis** (or another Redis integration from the [Vercel Marketplace](https://vercel.com/marketplace?category=storage&search=redis)). This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.  
4. Redeploy. Production uses Redis (not `inventory.json` on disk).

```bash
npm i -g vercel
cd inventory-cli
vercel
vercel --prod
```

After deploy, open your `*.vercel.app` URL.

### Why KV on Vercel?

Serverless functions have **ephemeral disk** — `inventory.json` would reset between invocations. Redis (via `@vercel/kv`) persists inventory in production. Locally, without Redis env vars, the app uses `inventory.json`.

## API (web + Vercel)

| Method | Path | Body |
|--------|------|------|
| `GET` | `/api/products` | — |
| `POST` | `/api/products` | `{ "id", "name", "quantity" }` |
| `PATCH` | `/api/products/:id` | `{ "quantity" }` |
| `POST` | `/api/import` | raw CSV (`Content-Type: text/csv`) |

## Design decisions

### Data structure

Each product is `{ id, name, quantity }`. Inventory is an object keyed by normalized SKU for O(1) lookup.

### Data storage

- **Local CLI / `npm run web`:** `inventory.json`  
- **Vercel:** Upstash Redis via `@vercel/kv` when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set  

### User interaction

- CLI: numbered menu (`readline`)  
- Web: static HTML + `fetch` to `/api/*`  

### Error handling

Duplicate SKU on add, missing SKU on update, and invalid quantities return clear errors without crashing.

### Import decisions (messy CSV)

| Situation | Behavior |
|-----------|----------|
| Invalid / negative / empty quantity | Skip row, continue import |
| Missing name for new SKU | Skip row |
| Unknown SKU with valid name + qty | Auto-create |
| Duplicate rows in file | Last valid row wins for quantity |
| Case variants (`sku-001`) | Normalize to uppercase |
| Name differs on update | Keep existing name; warn in report |

### Technology choice

**JavaScript (Node.js)** — shared logic for CLI, Express locally, and Vercel serverless; no frontend framework required.

## Project layout

```text
inventory-cli/
  api/              # Vercel serverless routes
  public/           # Web UI
  src/
    product.js
    inventory.js
    csvImport.js
    storage.js      # sync file (CLI)
    storageAsync.js # file or KV (web / Vercel)
    apiHandlers.js
    cli.js
    server.js
  incoming_stock.csv
```

## Manual test checklist

- [ ] `npm start` — add, list, update, import, restart — data persists  
- [ ] `npm run web` — same flows in browser  
- [ ] Vercel — KV linked — add product, refresh page — still there  
- [ ] Import `incoming_stock.csv` — read grouped report  
