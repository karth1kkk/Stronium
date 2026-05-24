import { handleUpdateQuantity } from "../../src/apiHandlers.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "PATCH") {
      res.setHeader("Allow", "PATCH");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const id = req.query.id;
    const { quantity } = req.body ?? {};
    const { status, body } = await handleUpdateQuantity(id, quantity);
    return res.status(status).json(body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
