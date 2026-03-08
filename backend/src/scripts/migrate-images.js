/**
 * Script para migrar imágenes existentes a WebP optimizado.
 * Uso: node src/scripts/migrate-images.js
 *
 * - Convierte JPG/PNG/JPEG/GIF a WebP
 * - Genera thumbnail (_thumb.webp)
 * - Actualiza las URLs en la base de datos (tabla products)
 * - No borra los archivos originales (por seguridad)
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import mysql from 'mysql2/promise';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/makuk/uploads';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

async function migrate() {
  const files = fs.readdirSync(UPLOAD_DIR);
  const imagesToMigrate = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  });

  if (imagesToMigrate.length === 0) {
    console.log('No hay imágenes para migrar.');
    return;
  }

  console.log(`Encontradas ${imagesToMigrate.length} imágenes para migrar.\n`);

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  for (const file of imagesToMigrate) {
    const basename = path.basename(file, path.extname(file));
    const srcPath = path.join(UPLOAD_DIR, file);
    const mainOut = path.join(UPLOAD_DIR, `${basename}.webp`);
    const thumbOut = path.join(UPLOAD_DIR, `${basename}_thumb.webp`);

    try {
      const buffer = fs.readFileSync(srcPath);

      // Imagen principal
      await sharp(buffer)
        .resize(1200, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(mainOut);

      // Thumbnail
      await sharp(buffer)
        .resize(400, null, { withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(thumbOut);

      const oldUrl = `/uploads/${file}`;
      const newUrl = `/uploads/${basename}.webp`;

      // Actualizar en BD
      const [result] = await db.execute(
        'UPDATE products SET imagen = ? WHERE imagen = ?',
        [newUrl, oldUrl]
      );

      const srcSize = fs.statSync(srcPath).size;
      const newSize = fs.statSync(mainOut).size;
      const thumbSize = fs.statSync(thumbOut).size;
      const savings = Math.round((1 - newSize / srcSize) * 100);

      console.log(`✓ ${file}`);
      console.log(`  Original: ${(srcSize / 1024).toFixed(0)}KB → WebP: ${(newSize / 1024).toFixed(0)}KB (${savings}% menos) | Thumb: ${(thumbSize / 1024).toFixed(0)}KB`);
      if (result.affectedRows > 0) {
        console.log(`  BD: ${result.affectedRows} registro(s) actualizado(s)`);
      }
      console.log('');
    } catch (err) {
      console.error(`✗ Error con ${file}:`, err.message);
    }
  }

  await db.end();
  console.log('Migración completada. Los archivos originales NO fueron eliminados.');
  console.log('Puedes borrarlos manualmente cuando confirmes que todo funciona.');
}

migrate().catch(console.error);
