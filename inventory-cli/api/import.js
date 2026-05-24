import { handleImportCsv } from "../src/apiHandlers.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    let csvText = "";
    let fileLabel = "upload.csv";

    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
      csvText = typeof req.body === "string" ? req.body : "";
    } else if (typeof req.body === "object" && req.body?.csv) {
      csvText = req.body.csv;
      fileLabel = req.body.filename || fileLabel;
    } else if (typeof req.body === "string") {
      csvText = req.body;
    }

    const { status, body } = await handleImportCsv(csvText, fileLabel);
    return res.status(status).json(body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
