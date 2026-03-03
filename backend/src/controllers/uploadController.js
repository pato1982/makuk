// POST /api/upload
export function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ninguna imagen' });
  }

  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
}
