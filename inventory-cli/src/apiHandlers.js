import { addProduct, listProducts, updateQuantity } from "./inventory.js";
import { loadInventory, saveInventory } from "./storageAsync.js";
import { importFromCsv, formatImportReport } from "./csvImport.js";
import fs from "fs";
import os from "os";
import path from "path";

export async function handleListProducts() {
  const inventory = await loadInventory();
  return listProducts(inventory);
}

export async function handleAddProduct({ id, name, quantity }) {
  const inventory = await loadInventory();
  const result = addProduct(inventory, id, name, quantity);
  if (!result.ok) {
    return { status: 400, body: { error: result.error } };
  }
  await saveInventory(inventory);
  return { status: 201, body: result.product };
}

export async function handleUpdateQuantity(id, quantity) {
  const inventory = await loadInventory();
  const result = updateQuantity(inventory, id, quantity);
  if (!result.ok) {
    return { status: 400, body: { error: result.error } };
  }
  await saveInventory(inventory);
  return { status: 200, body: result.product };
}

export async function handleImportCsv(csvText, fileLabel = "upload.csv") {
  if (!csvText || typeof csvText !== "string" || !csvText.trim()) {
    return { status: 400, body: { error: "Expected CSV text body" } };
  }

  const tmpPath = path.join(os.tmpdir(), `import-${Date.now()}.csv`);
  fs.writeFileSync(tmpPath, csvText, "utf8");

  try {
    const inventory = await loadInventory();
    const report = importFromCsv(inventory, tmpPath);
    await saveInventory(inventory);
    return {
      status: 200,
      body: {
        report,
        reportText: formatImportReport(report, fileLabel),
      },
    };
  } catch (err) {
    return { status: 500, body: { error: err.message } };
  } finally {
    try {
      fs.unlinkSync(tmpPath);
    } catch {
      /* ignore */
    }
  }
}
