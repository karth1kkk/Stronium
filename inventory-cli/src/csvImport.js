import fs from "fs";
import { normalizeId, isValidQuantity } from "./product.js";
import { createProduct } from "./product.js";

export function createImportReport() {
  return {
    filePath: "",
    totalRowsInFile: 0,
    applied: 0,
    appliedRows: [], // { line, sku, rawSku, action, qty, previousQty?, name }
    skipped: [], // { line, sku, reason }
    warnings: [], // { line, sku, reason }
  };
}

function parseCsvLine(line) {
  const parts = line.split(",").map((p) => p.trim());
  return { sku: parts[0], name: parts[1], quantity: parts[2] };
}

function groupAppliedBySku(appliedRows) {
  const map = new Map();
  for (const row of appliedRows) {
    if (!map.has(row.sku)) map.set(row.sku, []);
    map.get(row.sku).push(row);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function wasIdNormalized(rawSku, sku) {
  const raw = String(rawSku ?? "").trim();
  return raw && raw.toUpperCase() !== sku;
}

export function importFromCsv(inventory, filePath) {
  const report = createImportReport();
  report.filePath = filePath;

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  report.totalRowsInFile = Math.max(0, lines.length - 1); // exclude header

  for (let i = 1; i < lines.length; i++) {
    const lineNo = i + 1;
    const { sku: rawSku, name, quantity: qtyRaw } = parseCsvLine(lines[i]);
    const sku = normalizeId(rawSku);
    const nameTrimmed = String(name ?? "").trim();

    if (!sku) {
      report.skipped.push({
        line: lineNo,
        sku: rawSku || "(empty)",
        reason: "missing SKU",
      });
      continue;
    }

    // Warn when raw SKU differs from normalized form (e.g. sku-002 → SKU-002)
    if (wasIdNormalized(rawSku, sku)) {
      report.warnings.push({
        line: lineNo,
        sku,
        reason: `ID normalized: "${String(rawSku).trim()}" → ${sku}`,
      });
    }

    if (!isValidQuantity(qtyRaw)) {
      report.skipped.push({
        line: lineNo,
        sku,
        reason: `invalid quantity: "${qtyRaw}"`,
      });
      continue;
    }

    const qty = Number(qtyRaw);
    const existing = inventory[sku];

    if (existing) {
      const previousQty = existing.quantity;

      // Warn on duplicate SKU rows in the file
      if (previousQty === qty) {
        report.warnings.push({
          line: lineNo,
          sku,
          reason: `duplicate row (qty unchanged at ${qty})`,
        });
      } else {
        report.warnings.push({
          line: lineNo,
          sku,
          reason: `duplicate row (qty ${previousQty} → ${qty})`,
        });
      }

      // Warn when CSV name differs from stored name (name is not overwritten)
      if (nameTrimmed && nameTrimmed !== existing.name) {
        report.warnings.push({
          line: lineNo,
          sku,
          reason: `name in file "${nameTrimmed}" differs from "${existing.name}" (kept existing name)`,
        });
      }

      existing.quantity = qty;

      report.appliedRows.push({
        line: lineNo,
        sku,
        rawSku: String(rawSku ?? "").trim(),
        action: "updated",
        qty,
        previousQty,
        name: existing.name,
      });
    } else {
      if (!nameTrimmed) {
        report.skipped.push({
          line: lineNo,
          sku,
          reason: "missing name for new product",
        });
        continue;
      }

      inventory[sku] = createProduct(sku, nameTrimmed, qty);

      report.appliedRows.push({
        line: lineNo,
        sku,
        rawSku: String(rawSku ?? "").trim(),
        action: "created",
        qty,
        name: nameTrimmed,
      });
    }

    report.applied++;
  }

  return report;
}

export function formatImportReport(report, filePath) {
  const uniqueSkus = new Set(report.appliedRows.map((r) => r.sku)).size;
  const createdCount = report.appliedRows.filter((r) => r.action === "created").length;
  const updatedCount = report.appliedRows.filter((r) => r.action === "updated").length;
  const uniqueUpdated = new Set(
    report.appliedRows.filter((r) => r.action === "updated").map((r) => r.sku)
  ).size;

  const lines = [
    "",
    "══════════════════════════════════════════════════════════════",
    "  IMPORT SUMMARY",
    "══════════════════════════════════════════════════════════════",
    `  File:   ${filePath}`,
    "  Policy: IDs normalized to uppercase; invalid rows skipped;",
    "          duplicate SKUs in file → last valid row wins for quantity;",
    "          product names are set on create only (not overwritten on update).",
    "",
    `  Rows in file:          ${report.totalRowsInFile}`,
    `  Applied successfully:  ${report.applied}`,
    `  Skipped:               ${report.skipped.length}`,
    `  Warnings:              ${report.warnings.length}`,
    `  Unique SKUs touched:   ${uniqueSkus}`,
    `  Row actions:           ${createdCount} created, ${updatedCount} updated (${uniqueUpdated} unique SKUs updated)`,
    "══════════════════════════════════════════════════════════════",
    "",
    "Applied by product",
    "──────────────────────────────────────────────────────────────",
  ];

  const grouped = groupAppliedBySku(report.appliedRows);

  if (grouped.length === 0) {
    lines.push("  (none)");
  } else {
    for (const [sku, rows] of grouped) {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const prefix = i === 0 ? sku.padEnd(10) : "".padEnd(10);

        if (r.action === "created") {
          lines.push(
            `  ${prefix} line ${String(r.line).padStart(2)}  created  qty ${r.qty}  "${r.name}"`
          );
        } else {
          const unchanged = r.previousQty === r.qty;
          const changeNote = unchanged
            ? "(unchanged)"
            : `(was ${r.previousQty})`;
          lines.push(
            `  ${prefix} line ${String(r.line).padStart(2)}  updated  qty ${r.qty}  ${changeNote}`
          );
        }
      }

      const last = rows[rows.length - 1];
      lines.push(`  ${"".padEnd(10)} → final: ${last.name} | qty ${last.qty}`);
      lines.push("");
    }
  }

  lines.push("Skipped rows");
  lines.push("──────────────────────────────────────────────────────────────");

  if (report.skipped.length === 0) {
    lines.push("  (none)");
  } else {
    lines.push(
      `  ${"Line".padEnd(6)}${"SKU".padEnd(12)}Reason`
    );
    lines.push(
      `  ${"----".padEnd(6)}${"--------".padEnd(12)}${"------".padEnd(6)}`
    );
    for (const s of report.skipped) {
      lines.push(
        `  ${String(s.line).padEnd(6)}${String(s.sku).padEnd(12)}${s.reason}`
      );
    }
  }

  lines.push("");
  lines.push("Warnings (informational)");
  lines.push("──────────────────────────────────────────────────────────────");

  if (report.warnings.length === 0) {
    lines.push("  (none)");
  } else {
    for (const w of report.warnings) {
      lines.push(`  line ${w.line} [${w.sku}]: ${w.reason}`);
    }
  }

  lines.push("");
  return lines.join("\n");
}