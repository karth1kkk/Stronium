export function normalizeId(sku) {
    return String(sku ?? "").trim().toUpperCase();
}

export function createProduct(id, name, quantity) {
    return {
        id: normalizeId(id),
        name: String(name ?? "").trim(),
        quantity: Number(quantity),
    };
}

export function isValidQuantity(value) {
    if (value === "" || value === null || value === undefined) return false;
    const num = Number(value);
    return Number.isInteger(num) && num >= 0;
}