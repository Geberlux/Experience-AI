export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { name, email, message, number } = req.body;

    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL || 'curuzumartinez@gmail.com';

    if (!resendApiKey) {
      console.warn("ADVERTENCIA: RESEND_API_KEY no está configurada.");
      return res.status(200).json({ success: true, warning: 'RESEND_API_KEY falante' });
    }

    // Petición HTTP directa a Resend snake_case
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Experience Store <onboarding@resend.dev>',
        to: [adminEmail],
        reply_to: email,
        subject: `EXPERIENCE - [CONTACTO#${number || '00000'}]`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #0d0e12; color: #ffffff;">
            <h2 style="color: #00ff88; border-bottom: 2px solid #00ff88; padding-bottom: 15px; margin-top: 0; font-family: monospace; letter-spacing: -0.05em; text-transform: uppercase;">EXPERIENCE - [CONTACTO#${number || '00000'}]</h2>
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
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error en serverless function api/contact.js:", error);
    return res.status(200).json({ success: true, warning: 'Error non-blocking en mail' });
  }
}
