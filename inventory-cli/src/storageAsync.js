import fs from "fs";
import path from "path";

const INVENTORY_KEY = "inventory";
const inventoryFile = path.join(process.cwd(), "inventory.json");

function useKv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

let kvClient = null;

async function getKv() {
  if (!kvClient) {
    const { kv } = await import("@vercel/kv");
    kvClient = kv;
  }
  return kvClient;
}

export async function loadInventory() {
  if (useKv()) {
    const kv = await getKv();
    const data = await kv.get(INVENTORY_KEY);
    return data && typeof data === "object" ? data : {};
  }

  try {
    if (!fs.existsSync(inventoryFile)) return {};
    const raw = fs.readFileSync(inventoryFile, "utf8");
    const data = JSON.parse(raw);
    return typeof data === "object" && data !== null ? data : {};
  } catch {
    console.error("Could not read inventory file. Starting fresh.");
    return {};
  }
}

export async function saveInventory(inventory) {
  if (useKv()) {
    const kv = await getKv();
    await kv.set(INVENTORY_KEY, inventory);
    return;
  }

  fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2), "utf8");
}

export function getStorageMode() {
  return useKv() ? "vercel-kv" : "local-file";
}
