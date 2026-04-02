import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import sharp from 'sharp';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLog.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/makuk/uploads';
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Multer guarda temporalmente en memoria para que sharp procese
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG, WebP o GIF'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

const router = Router();

router.post('/', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'La imagen no puede superar 5MB' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ninguna imagen' });
  }

  try {
    const id = uuidv4();
    const mainFilename = `${id}.webp`;
    const thumbFilename = `${id}_thumb.webp`;

    // Imagen principal: max 1200px de ancho, calidad 80
    await sharp(req.file.buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(UPLOAD_DIR, mainFilename));

    // Thumbnail: max 400px de ancho, calidad 75
    await sharp(req.file.buffer)
      .resize(400, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(path.join(UPLOAD_DIR, thumbFilename));

    const url = `/uploads/${mainFilename}`;
    const thumbUrl = `/uploads/${thumbFilename}`;
    await logAudit(req, 'crear', 'imagen', `Subida: ${url} (${req.file.originalname})`);
    res.json({ url, thumbUrl });
  } catch (err) {
    console.error('Error procesando imagen:', err);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});

// DELETE /api/upload — elimina imagen del servidor
router.delete('/', requireAuth, async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('/uploads/')) {
    return res.status(400).json({ error: 'URL inválida' });
  }

  const filename = path.basename(url);
  // Validar que el nombre sea un UUID válido con extensión webp
  if (!/^[a-f0-9-]+\.webp$/.test(filename)) {
    return res.status(400).json({ error: 'Nombre de archivo inválido' });
  }

  const { unlink } = await import('node:fs/promises');
  const mainPath = path.join(UPLOAD_DIR, filename);
  const thumbPath = path.join(UPLOAD_DIR, filename.replace('.webp', '_thumb.webp'));

  try {
    await unlink(mainPath).catch(() => {});
    await unlink(thumbPath).catch(() => {});
    await logAudit(req, 'eliminar', 'imagen', `Eliminada: ${url}`);
    res.json({ message: 'Imagen eliminada' });
  } catch (err) {
    console.error('Error eliminando imagen:', err);
    res.status(500).json({ error: 'Error al eliminar la imagen' });
  }
});

export default router;
