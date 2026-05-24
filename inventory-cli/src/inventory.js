import { createProduct, normalizeId, isValidQuantity } from "./product.js";

export function createInventory() {
    return {};
}

export function addProduct(inventory, id, name, quantity){
    const sku = normalizeId(id);
    const nameTrimmed = String(name ?? "").trim();

    if(!sku) return {ok: false, error: "Product ID is required."};
    if (!nameTrimmed) return {ok: false, error: "Name is required."};
    if(!isValidQuantity(quantity)) {
        return {ok: false, error: "Quantity must be a non-negative integer."};
    }

    if(inventory[sku]){
        return {ok: false, error: `Product ${sku} already exists.`};
    }

    inventory[sku] = createProduct(sku, nameTrimmed, quantity);
    return {ok: true, product: inventory[sku]};
}

export function listProducts(inventory){
    return Object.values(inventory).sort((a, b) =>
    a.id.localeCompare(b.id)
   );
}

export function updateQuantity(inventory, id, quantity){
    const sku = normalizeId(id);

    if(!inventory[sku]){
        return {ok: false, error: `Product ${sku} not found.`};
    }
    if(!isValidQuantity(quantity)){
        return {ok: false, error: "Quantity must be a non-negative integer."};
    }

    inventory[sku].quantity = Number(quantity);
    return {ok: true, product: inventory[sku]};
}