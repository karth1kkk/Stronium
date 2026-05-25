import readline from "readline";
import path from "path";
import { addProduct, listProducts, updateQuantity } from "./inventory.js";
import { loadInventory, saveInventory } from "./storage.js";
import {importFromCsv, formatImportReport } from "./csvImport.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

function printMenu(){
    console.log(`
--- Inventory Management ---
1. Add product
2. View all products
3. Update quantity
4. Import from CSV
5. Exit
`);
}

function printProducts(inventory){
    const products = listProducts(inventory);
    if (products.length === 0){
        console.log("\nNo products in inventory.\n");
        return;
    }
    console.log("\nID          Name                          Qty");
    console.log("--------------------------------------------------");
    for(const p of products){
        console.log(
           `${p.id.padEnd(12)}${p.name.padEnd(30)}${p.quantity}`
        );
    }
    console.log("");
}

async function handleAdd(inventory){
    const id = await ask("Product ID: ");
    const name = await ask("Name: ");
    const qty = await ask("Quantity: ");
    const result = addProduct(inventory, id, name, qty);
    if (result.ok){
        saveInventory(inventory);
        console.log(`Added ${result.product.id}.`);
    }else {
        console.log(`Error: ${result.error}`);
    }
}

async function handleUpdate(inventory){
    const id = await ask("Product ID: ");
    const qty = await ask("New quantity: ");
    const result = updateQuantity(inventory, id, qty);
    if(result.ok){
        saveInventory(inventory);
        console.log(`Updated ${result.product.id} → qty ${result.product.quantity}.`);
    } else{
        console.log(`Error: ${result.error}`);
    }
}

async function handleImport(inventory){
    const defaultPath = path.join(process.cwd(), "incoming_stock.csv");
    const input = await ask(`CSV path [${defaultPath}]: `);
    const filePath = input.trim() || defaultPath;

    try{
        const report = importFromCsv(inventory, filePath);
        saveInventory(inventory);
        console.log(formatImportReport(report, filePath));
    } catch (err){
        console.log(`Import failed: ${err.message}`);
    }
}

async function main() {
    const inventory = loadInventory();
    console.log("Inventory loaded.");

    let running = true;
    while (running) {
        printMenu();
        const choice = (await ask("Choose (1-5): ")).trim();

        switch(choice){
            case "1":
                await handleAdd(inventory);
                break;
            case "2":
                printProducts(inventory);
                break;
            case "3":
                await handleUpdate(inventory);
                break;
            case "4":
                await handleImport(inventory);
                break;
            case "5":
                running = false;
                console.log("Goodbye!");
                break;
            default:
                console.log("Invalid choice. Please try again.");
                break;
        }
    }
    rl.close();
}

main();