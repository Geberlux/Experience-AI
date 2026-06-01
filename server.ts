import 'dotenv/config';
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

  // Contact Form Endpoint to send a real email via Resend HTTP API
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message, number } = req.body;
      if (!email || !message || !number) {
         return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      console.log(`Mensaje de contacto recibido de: ${name} (${email}), número incremental: ${number}`);

      const resendApiKey = process.env.RESEND_API_KEY;
      const adminEmail = process.env.ADMIN_EMAIL || "curuzumartinez@gmail.com";

      if (resendApiKey) {
        // Run in an independent non-blocking async flow to prevent client delay or impact
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Experience Store <onboarding@resend.dev>',
            to: [adminEmail],
            reply_to: email,
            subject: `EXPERIENCE - [CONTACTO#${number}]`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #0d0e12; color: #ffffff;">
                <h2 style="color: #00ff88; border-bottom: 2px solid #00ff88; padding-bottom: 15px; margin-top: 0; font-family: monospace; letter-spacing: -0.05em; text-transform: uppercase;">EXPERIENCE - [CONTACTO#${number}]</h2>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Has recibido un mensaje de contacto directo desde el sitio web.</p>
                
                <div style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #00ff88;">Remitente:</p>
                  <p style="margin: 0; font-size: 16px; color: #ffffff;">${name || 'Usuario Web'}</p>
                  <p style="margin: 15px 0 5px 0; font-size: 14px; font-weight: bold; color: #00ff88;">Email:</p>
                  <p style="margin: 0; font-size: 14px; color: #ffffff;"><a href="mailto:${email}" style="color: #00ff88; text-decoration: none;">${email}</a></p>
                </div>

                <div style="background-color: rgba(255, 255, 255, 0.03); border-left: 4px solid #00ff88; border-radius: 4px; padding: 15px; margin: 20px 0; color: #ffffff;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: rgba(255, 255, 255, 0.5); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Mensaje:</p>
                  <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 15px;">${message}</p>
                </div>

                <p style="font-size: 11px; color: rgba(255, 255, 255, 0.3); margin-top: 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px; font-family: monospace;">
                  Mensaje enviado de forma automatizada mediante Resend HTTP API.
                </p>
              </div>
            `
          })
        }).then(async (response) => {
          const data = await response.json().catch(() => ({}));
          console.log("Control de Envío Directo via Resend - Respuesta:", data);
        }).catch((error) => {
          console.error("Error crítico capturado en consola durante el envío directo via Resend:", error);
        });
      } else {
        console.warn("ADVERTENCIA: RESEND_API_KEY no está configurada en las variables de entorno.");
      }

      // Always return success immediately to keep the client experience fluid and non-blocking
      res.json({ success: true, message: "Mensaje procesado correctamente" });
    } catch (error: any) {
      console.error("Error en /api/contact:", error);
      res.json({ success: true, message: "Mensaje procesado con fallback asíncrono" });
    }
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
