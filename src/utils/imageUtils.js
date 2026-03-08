/**
 * Deriva la URL del thumbnail a partir de la URL de la imagen principal.
 * /uploads/uuid.webp → /uploads/uuid_thumb.webp
 * Si la imagen no es webp (legacy), devuelve la misma URL.
 */
export function getThumb(url) {
  if (!url || !url.endsWith('.webp')) return url;
  return url.replace('.webp', '_thumb.webp');
}
