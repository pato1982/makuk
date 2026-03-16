import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendContact(req, res) {
  const { nombre, telefono, correo, mensaje } = req.body;

  if (!nombre || !telefono || !correo || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    await transporter.sendMail({
      from: `"Makuk Web" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_TO_EMAIL || process.env.GMAIL_USER,
      replyTo: correo,
      subject: `Consulta de ${nombre} - Makuk`,
      html: `
        <h2>Nueva consulta desde la web</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <hr>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `,
    });

    res.json({ message: 'Mensaje enviado correctamente' });
  } catch (err) {
    console.error('Error enviando correo:', err);
    res.status(500).json({ error: 'No se pudo enviar el mensaje. Intenta más tarde.' });
  }
}
