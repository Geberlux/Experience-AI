import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import mercadopago from 'mercadopago';
import nodemailer from 'nodemailer';

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

  // Contact Form Endpoint to send a real email
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
         return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      console.log(`Mensaje de contacto de: ${name} (${email})`);

      const mailSubject = "EXPERIENCE - CONTACTO SITIO WEB";
      const mailBody = `
Has recibido un nuevo mensaje desde el sitio web EXPERIENCE:

Nombre: ${name}
Email: ${email}
Mensaje:
-------------------------------------------
${message}
-------------------------------------------
      `;

      // Check for custom SMTP credentials
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpHost) {
        try {
          console.log(`Intentando conectar a servidor SMTP (${smtpHost})...`);
          const transporterOpts: any = {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for port 465
            connectionTimeout: 8000, 
            greetingTimeout: 8000,
            tls: {
              rejectUnauthorized: false // self-signed support
            }
          };

          if (smtpUser && smtpPass) {
            transporterOpts.auth = {
              user: smtpUser,
              pass: smtpPass,
            };
          }

          const transporter = nodemailer.createTransport(transporterOpts);

          const info = await transporter.sendMail({
            from: smtpUser ? `"${name}" <${smtpUser}>` : `"${name}" <${email}>`, 
            replyTo: email,
            to: "heber.martinez@davinci.edu.ar",
            subject: mailSubject,
            text: mailBody,
          });
          console.log("Email enviado con éxito por SMTP:", info.messageId);
        } catch (mailErr: any) {
          console.error("No se pudo enviar el correo real:", mailErr.message);
          throw new Error(`Error en servidor de correo SMTP: ${mailErr.message}`);
        }
      } else {
        console.log("SMTP no configurado en las variables de entorno. Resguardado solo en Firestore.");
        throw new Error("El servidor no tiene configurado ningún servidor SMTP (SMTP_HOST en variables de entorno).");
      }

      res.json({ success: true, message: "Mensaje procesado correctamente" });
    } catch (error: any) {
      console.error("Error en /api/contact:", error);
      res.status(500).json({ error: error.message || "No se pudo enviar el correo" });
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
