import {
  handleListProducts,
  handleAddProduct,
} from "../src/apiHandlers.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const products = await handleListProducts();
      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      const { id, name, quantity } = req.body ?? {};
      const { status, body } = await handleAddProduct({ id, name, quantity });
      return res.status(status).json(body);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
