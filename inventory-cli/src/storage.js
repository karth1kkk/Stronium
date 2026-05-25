import fs from "fs";
import path from "path";

const inventoryFile = path.join(process.cwd(), "inventory.json");

export function loadInventory(filePath = inventoryFile) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);

    return typeof data === "object" && data !== null ? data : {};
  } catch {
    console.error("Could not read inventory.json. Starting fresh.");
    return {};
  }
}

export function saveInventory(inventory, filePath = inventoryFile) {
  fs.writeFileSync(filePath, JSON.stringify(inventory, null, 2), "utf8");
}
