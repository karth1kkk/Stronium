const addForm = document.getElementById("add-form");
const addMessage = document.getElementById("add-message");
const productRows = document.getElementById("product-rows");
const emptyState = document.getElementById("empty-state");
const refreshBtn = document.getElementById("refresh-btn");
const importForm = document.getElementById("import-form");
const importReport = document.getElementById("import-report");

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadProducts() {
  const res = await fetch("/api/products");
  const products = await res.json();

  if (!res.ok) {
    addMessage.textContent = products.error || "Failed to load products";
    addMessage.className = "message error";
    return;
  }

  emptyState.classList.toggle("hidden", products.length > 0);
  productRows.innerHTML = products
    .map((p) => {
      const id = escapeHtml(p.id);
      return `
      <tr>
        <td>${id}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${p.quantity}</td>
        <td class="update-cell">
          <input type="number" min="0" step="1" value="${p.quantity}" data-id="${id}" class="qty-input" />
          <button type="button" data-id="${id}" class="update-btn">Save</button>
        </td>
      </tr>`;
    })
    .join("");

  document.querySelectorAll(".update-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const input = document.querySelector(`.qty-input[data-id="${CSS.escape(id)}"]`);
      const quantity = input.value;

      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        addMessage.textContent = data.error;
        addMessage.className = "message error";
        return;
      }

      addMessage.textContent = `Updated ${data.id} → qty ${data.quantity}`;
      addMessage.className = "message ok";
      await loadProducts();
    });
  });
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(addForm);

  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: form.get("id"),
      name: form.get("name"),
      quantity: form.get("quantity"),
    }),
  });

  const data = await res.json();
  addMessage.textContent = res.ok ? `Added ${data.id}` : data.error;
  addMessage.className = res.ok ? "message ok" : "message error";

  if (res.ok) {
    addForm.reset();
    await loadProducts();
  }
});

importForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(importForm);
  const file = formData.get("file");
  if (!file) return;

  importReport.textContent = "Importing…";

  const csvText = await file.text();
  const res = await fetch("/api/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv: csvText, filename: file.name }),
  });

  const data = await res.json();
  if (!res.ok) {
    importReport.textContent = data.error || "Import failed";
    return;
  }

  importReport.textContent = data.reportText;
  importForm.reset();
  await loadProducts();
});

refreshBtn.addEventListener("click", loadProducts);
loadProducts();
