# Take-Home Coding Assessment: Simple Inventory Management System

This assessment aims to understand your fundamental design thinking and problem-solving approach. We're looking for your thought process and how you'd structure a basic software solution, rather than a perfect, production-ready system. We want to see a minimal viable product that showcases your ability to think through a problem.

## Problem Statement

Your task is to build a very basic Inventory Management System for a small online retail store. This system should manage simple product records.

## Core Requirements

Your application should support these essential functionalities:

1. **Add Product:** Add a new product with at least:
   - A unique **Product ID** (e.g., SKU or auto-generated)
   - **Name**
   - **Quantity in stock**

2. **View Products:** Display a list of all products currently in the inventory (just the ID, Name, and Quantity is fine).

3. **Update Product Quantity:** Modify only the **quantity in stock** for an existing product, identified by its Product ID.

4. **Bulk Import from CSV:** Accept a CSV file of products and quantities (a sample, `incoming_stock.csv`, is provided) and apply it to the inventory. The file is realistically messy — expect duplicate rows, inconsistent formatting, invalid quantities, and at least one row referring to a product that doesn't yet exist. Decide how to handle each case, and make sure a user running the import can tell what happened.

## Key Considerations (Briefly Address These!)

While implementing the core features, please take a moment to briefly reflect on the following. Your answers here, provided in a short document, are key to understanding your approach:

- **Data Structure:** How would you represent a single product (e.g., what programming construct)? How would you store multiple products?
- **Data Storage:** How would the inventory data be saved so it's not lost when the application closes? A simple file (CSV, JSON, plain text) is perfectly acceptable.
- **User Interaction:** How would a user interact with your application? A simple command-line interface is perfectly fine and often the quickest to implement for this type of problem.
- **Error Handling:** What are one or two common issues a user might encounter (e.g., trying to update a non-existent product, invalid quantity), and how would your system provide feedback?
- **Import Decisions:** For the bulk import, what did you do with the bad rows — reject, skip, repair, auto-create, fail the whole import? Why is that the right call here?
- **Technology Choice:** What programming language did you choose and why for this particular problem?

## Submission Guidelines

Please provide:

1. **Your Code:** A working implementation of the core requirements. A command-line application is expected.
2. **Design Notes (or README):** A concise text document (or a well-structured `README.md` file) where you briefly address the "Key Considerations" listed above. **Aim for a few sentences per point, not lengthy paragraphs.**
3. **Instructions:** Clear, simple instructions on how to set up and run your application.

A sample CSV (`incoming_stock.csv`) is included for the import requirement.

Feel free to use any programming language. Good luck!
