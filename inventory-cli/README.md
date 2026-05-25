# Inventory Management CLI

A command-line inventory system for a small online store. Built with **Node.js** (ES modules, no external dependencies).

## Setup & run

```bash
cd inventory-cli
npm start
```

Run from the `inventory-cli` folder so `incoming_stock.csv` and `inventory.json` resolve correctly.

## Features

| # | Menu option | Description |
|---|-------------|-------------|
| 1 | Add product | SKU, name, quantity (SKU normalized to uppercase) |
| 2 | View products | Table of ID, name, quantity |
| 3 | Update quantity | Change stock for an existing SKU |
| 4 | Import CSV | Bulk import from `incoming_stock.csv` (or custom path) |
| 5 | Exit | Saves data and quits |

## Design decisions

### Data structure

Each product is a plain object `{ id, name, quantity }`. All products live in an object keyed by normalized SKU (`inventory["SKU-001"]`) for fast lookup on update and import.

### Data storage

`inventory.json` in the project root. Loaded on startup and saved after add, update, and import so data persists between runs.

### User interaction

Numbered CLI menu using Node’s built-in `readline` module.

### Error handling

- **Duplicate SKU on add** → clear error, app continues  
- **Unknown SKU on update** → clear error  
- **Invalid quantity** (non-numeric, negative, empty) → rejected on add/update; invalid CSV rows are skipped during import  

### Import decisions (messy CSV)

The sample `incoming_stock.csv` includes duplicate SKUs, case variants (`sku-001`), invalid quantities, and rows for products not yet in inventory.

| Situation | Behavior | Why |
|-----------|----------|-----|
| Invalid / negative / empty quantity | Skip row, continue import | Partial success — one bad row should not block the rest |
| Missing name for a **new** SKU | Skip row | Cannot create a product without a name |
| Unknown SKU with valid name + qty | Auto-create | Restock files often introduce new SKUs |
| Duplicate rows in file | Last valid row wins for **quantity** | Simple, predictable; report groups by SKU |
| Case-only ID difference | Normalize to uppercase | `sku-002` and `SKU-002` are the same product |
| Name differs on update row | Keep existing name; warn in report | Quantity import should not silently rename products |

After import, the CLI prints a summary, per-SKU timeline, skipped table, and warnings so you can see exactly what happened.

### Technology choice

**JavaScript (Node.js)** — quick to build a CLI with built-in `fs`, `readline`, and JSON persistence; no extra packages required.

## Project layout

```text
inventory-cli/
  src/
    cli.js         # menu and user input
    inventory.js   # add, list, update
    product.js     # product shape and validation
    csvImport.js   # CSV import and report
    storage.js     # load/save inventory.json
  incoming_stock.csv
  inventory.json   # created at runtime (gitignored)
```

## Manual test checklist

- [ ] Add a product, list it, exit, run again — data still there  
- [ ] Add duplicate SKU → error  
- [ ] Update missing SKU → error  
- [ ] Import `incoming_stock.csv` → read grouped report  
- [ ] List products — expect 13 unique SKUs after a fresh import (with default skip rules)
