import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mercadopago from 'mercadopago';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // MercadoPago Integration (Server-side)
  app.post("/api/checkout", async (req, res) => {
    try {
      const { items } = req.body;
      // In a real app, you'd initialize MP with a secret key from process.env
      // Here we just mock a preference creation or return a placeholder
      // For the sake of the demo, I'll show where the logic goes
      
      // const client = new mercadopago.MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
      // const preference = new mercadopago.Preference(client);
      // const result = await preference.create({ body: { items } });
      
      res.json({ id: "mock_preference_id", url: "https://www.mercadopago.com.ar" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create checkout" });
    }
  });

  // Admin Actions proxy or logic could go here

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicit SPA fallback for dev mode
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      
      try {
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
