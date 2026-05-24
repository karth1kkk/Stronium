import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  handleListProducts,
  handleAddProduct,
  handleUpdateQuantity,
  handleImportCsv,
} from "./apiHandlers.js";
import { getStorageMode } from "./storageAsync.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.text({ type: ["text/csv", "text/plain"], limit: "2mb" }));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/products", async (_req, res) => {
  try {
    res.json(await handleListProducts());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { status, body } = await handleAddProduct(req.body);
    res.status(status).json(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/products/:id", async (req, res) => {
  try {
    const { status, body } = await handleUpdateQuantity(
      req.params.id,
      req.body.quantity
    );
    res.status(status).json(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/import", async (req, res) => {
  try {
    const csvText =
      typeof req.body === "string" ? req.body : req.body?.csv ?? "";
    const fileLabel =
      typeof req.body === "object" && req.body?.filename
        ? req.body.filename
        : "upload.csv";
    const { status, body } = await handleImportCsv(csvText, fileLabel);
    res.status(status).json(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Inventory web app: http://localhost:${PORT}`);
  console.log(`Storage: ${getStorageMode()}`);
});
