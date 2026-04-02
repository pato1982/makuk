import pool from '../config/db.js';
import { logAudit } from '../utils/auditLog.js';

// PUT /api/admin/header
export async function updateHeader(req, res) {
  const { logo, tagline, navItems } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE header SET logo = ?, tagline = ? WHERE id = 1', [logo, tagline]);
    await conn.query('DELETE FROM nav_items WHERE header_id = 1');
    for (let i = 0; i < navItems.length; i++) {
      const n = navItems[i];
      await conn.query(
        'INSERT INTO nav_items (header_id, label, section_id, sort_order) VALUES (1, ?, ?, ?)',
        [n.label, n.sectionId, i + 1]
      );
    }
    await conn.commit();
    await logAudit(req, 'editar', 'header', `Logo: "${logo}", Tagline: "${tagline}", NavItems: ${navItems.length}`);
    res.json({ message: 'Header actualizado' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updateHeader:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    conn.release();
  }
}

// PUT /api/admin/hero
export async function updateHero(req, res) {
  const { title, subtitle, ctaText, backgroundImage } = req.body;
  try {
    await pool.query(
      'UPDATE hero SET title = ?, subtitle = ?, cta_text = ?, background_image = ? WHERE id = 1',
      [title, subtitle, ctaText, backgroundImage]
    );
    await logAudit(req, 'editar', 'hero', `Título: "${title}", CTA: "${ctaText}"`);
    res.json({ message: 'Hero actualizado' });
  } catch (err) {
    console.error('Error updateHero:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// PUT /api/admin/intro
export async function updateIntro(req, res) {
  const { title, paragraph } = req.body;
  try {
    await pool.query('UPDATE intro SET title = ?, paragraph = ? WHERE id = 1', [title, paragraph]);
    await logAudit(req, 'editar', 'intro', `Título: "${title}"`);
    res.json({ message: 'Intro actualizado' });
  } catch (err) {
    console.error('Error updateIntro:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// PUT /api/admin/categories
export async function updateCategories(req, res) {
  const { title, subtitle, items } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE categories_section SET title = ?, subtitle = ? WHERE id = 1', [title, subtitle]);
    await conn.query('DELETE FROM categories');
    for (let i = 0; i < items.length; i++) {
      const c = items[i];
      await conn.query(
        'INSERT INTO categories (slug, nombre, descripcion, imagen, sort_order) VALUES (?, ?, ?, ?, ?)',
        [c.slug, c.nombre, c.descripcion, c.imagen, i + 1]
      );
    }
    await conn.commit();
    await logAudit(req, 'editar', 'categories', `${items.length} categorías: ${items.map(c => c.nombre).join(', ')}`);
    res.json({ message: 'Categorías actualizadas' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updateCategories:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    conn.release();
  }
}

// Helper: ejecuta una función con retry automático en deadlocks (hasta 3 intentos)
async function withDeadlockRetry(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err.code === 'ER_LOCK_DEADLOCK' && attempt < maxRetries) {
        console.warn(`Deadlock detectado, reintentando (intento ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, 50 * attempt)); // backoff breve
        continue;
      }
      throw err;
    }
  }
}

// PUT /api/admin/products
export async function updateProducts(req, res) {
  const { items, nombresCategorias } = req.body;

  try {
    await withDeadlockRetry(async () => {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        // IDs que vienen del frontend (productos existentes)
        const incomingIds = items.filter(p => p.id).map(p => p.id);

        // Borrar solo los productos que ya no están en la lista
        if (incomingIds.length > 0) {
          await conn.query(
            `DELETE FROM products WHERE id NOT IN (${incomingIds.map(() => '?').join(',')})`,
            incomingIds
          );
        } else {
          await conn.query('DELETE FROM products');
        }

        // Upsert: UPDATE existentes, INSERT nuevos
        for (let i = 0; i < items.length; i++) {
          const p = items[i];
          const params = [p.nombre, p.categoria, p.imagen, p.imagen2 || '', p.imagen3 || '', p.precioActual || 0, p.precioAnterior || 0, p.descripcion, p.deliveryTime || '', p.destacado ? 1 : 0, i + 1, p.imagePosX ?? 50, p.imagePosY ?? 50, p.imageZoom ?? 1, p.image2PosX ?? 50, p.image2PosY ?? 50, p.image2Zoom ?? 1, p.image3PosX ?? 50, p.image3PosY ?? 50, p.image3Zoom ?? 1];

          if (p.id) {
            // Producto existente → UPDATE
            await conn.query(
              `UPDATE products SET nombre=?, categoria=?, imagen=?, imagen_2=?, imagen_3=?, precio_actual=?, precio_anterior=?, descripcion=?, delivery_time=?, destacado=?, sort_order=?, image_pos_x=?, image_pos_y=?, image_zoom=?, image2_pos_x=?, image2_pos_y=?, image2_zoom=?, image3_pos_x=?, image3_pos_y=?, image3_zoom=? WHERE id=?`,
              [...params, p.id]
            );
          } else {
            // Producto nuevo → INSERT
            await conn.query(
              'INSERT INTO products (nombre, categoria, imagen, imagen_2, imagen_3, precio_actual, precio_anterior, descripcion, delivery_time, destacado, sort_order, image_pos_x, image_pos_y, image_zoom, image2_pos_x, image2_pos_y, image2_zoom, image3_pos_x, image3_pos_y, image3_zoom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              params
            );
          }
        }

        // Sincronizar nombres de categorías si vienen
        if (nombresCategorias) {
          for (const [slug, nombre] of Object.entries(nombresCategorias)) {
            if (slug === 'unicas') continue;
            await conn.query(
              'UPDATE categories SET nombre = ? WHERE slug = ?',
              [nombre, slug]
            );
          }
        }

        await conn.commit();
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    });

    const newCount = items.filter(p => !p.id).length;
    const updatedCount = items.filter(p => p.id).length;
    await logAudit(req, 'editar', 'products', `${items.length} productos (${updatedCount} actualizados, ${newCount} nuevos)`);
    res.json({ message: 'Productos actualizados' });
  } catch (err) {
    console.error('Error updateProducts:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// PUT /api/admin/unique-pieces
// Solo guarda título y subtítulo de la sección.
// Los productos de piezas-unicas se guardan via PUT /api/admin/products
// (AdminUniquePieces llama updateSection('products') aparte).
export async function updateUniquePieces(req, res) {
  const { title, subtitle } = req.body;
  try {
    await pool.query(
      'UPDATE unique_pieces_section SET title = ?, subtitle = ? WHERE id = 1',
      [title, subtitle]
    );
    await logAudit(req, 'editar', 'unique-pieces', `Título: "${title}", Subtítulo: "${subtitle}"`);
    res.json({ message: 'Piezas únicas actualizadas' });
  } catch (err) {
    console.error('Error updateUniquePieces:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// PUT /api/admin/about
export async function updateAbout(req, res) {
  const { title, image, paragraphs, features } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE about SET title = ?, image = ?, paragraphs = ? WHERE id = 1',
      [title, image, JSON.stringify(paragraphs)]
    );
    await conn.query('DELETE FROM about_features WHERE about_id = 1');
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      await conn.query(
        'INSERT INTO about_features (about_id, icon, text, sort_order) VALUES (1, ?, ?, ?)',
        [f.icon, f.text, i + 1]
      );
    }
    await conn.commit();
    await logAudit(req, 'editar', 'about', `Título: "${title}", ${features.length} features`);
    res.json({ message: 'About actualizado' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updateAbout:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    conn.release();
  }
}

// PUT /api/admin/process
export async function updateProcess(req, res) {
  const { title, steps } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE process_section SET title = ? WHERE id = 1', [title]);
    await conn.query('DELETE FROM process_steps WHERE process_id = 1');
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      await conn.query(
        'INSERT INTO process_steps (process_id, icon, title, description, sort_order) VALUES (1, ?, ?, ?, ?)',
        [s.icon, s.title, s.description, i + 1]
      );
    }
    await conn.commit();
    await logAudit(req, 'editar', 'process', `Título: "${title}", ${steps.length} pasos`);
    res.json({ message: 'Proceso actualizado' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updateProcess:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    conn.release();
  }
}

// PUT /api/admin/testimonials
export async function updateTestimonials(req, res) {
  const { title, items } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE testimonials_section SET title = ? WHERE id = 1', [title]);
    await conn.query('DELETE FROM testimonials WHERE section_id = 1');
    for (let i = 0; i < items.length; i++) {
      const t = items[i];
      await conn.query(
        'INSERT INTO testimonials (section_id, texto, nombre, ubicacion, sort_order) VALUES (1, ?, ?, ?, ?)',
        [t.texto, t.nombre, t.ubicacion, i + 1]
      );
    }
    await conn.commit();
    await logAudit(req, 'editar', 'testimonials', `${items.length} testimonios`);
    res.json({ message: 'Testimonios actualizados' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updateTestimonials:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    conn.release();
  }
}

// PUT /api/admin/footer
export async function updateFooter(req, res) {
  const { logo, description, facebookUrl, instagramUrl, email, whatsappNumber, whatsappDisplay, address, copyright, credits } = req.body;
  try {
    await pool.query(
      `UPDATE footer SET logo = ?, description = ?, facebook_url = ?, instagram_url = ?,
       email = ?, whatsapp_number = ?, whatsapp_display = ?, address = ?, copyright = ?, credits = ? WHERE id = 1`,
      [logo, description, facebookUrl, instagramUrl, email, whatsappNumber, whatsappDisplay, address, copyright, credits]
    );
    await logAudit(req, 'editar', 'footer', `Email: "${email}", WhatsApp: "${whatsappNumber}"`);
    res.json({ message: 'Footer actualizado' });
  } catch (err) {
    console.error('Error updateFooter:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// PUT /api/admin/products-page
export async function updateProductsPage(req, res) {
  const { title, subtitle, filterAllText, sortLabels } = req.body;
  try {
    await pool.query(
      'UPDATE products_page SET title = ?, subtitle = ?, filter_all_text = ?, sort_labels = ? WHERE id = 1',
      [title, subtitle, filterAllText, JSON.stringify(sortLabels)]
    );
    await logAudit(req, 'editar', 'products-page', `Título: "${title}", Subtítulo: "${subtitle}"`);
    res.json({ message: 'Página productos actualizada' });
  } catch (err) {
    console.error('Error updateProductsPage:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// GET /api/admin/audit-log
export async function getAuditLog(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    const section = req.query.section || null;

    let query = 'SELECT * FROM admin_audit_log';
    const params = [];

    if (section) {
      query += ' WHERE section = ?';
      params.push(section);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM admin_audit_log${section ? ' WHERE section = ?' : ''}`,
      section ? [section] : []
    );

    res.json({ items: rows, total });
  } catch (err) {
    console.error('Error getAuditLog:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// GET /api/admin/stats
export async function getStats(req, res) {
  try {
    const { statfs } = await import('node:fs/promises');

    const [
      [[prodCount]],
      [[catCount]],
      [[testCount]],
      [[stepsCount]],
      [[featuresCount]],
      [[dbSizeRow]],
      [[weeklyVisits]],
      [[monthlyVisits]],
      [[dailyAvg]],
      [[uniqueVisitors]],
      [[uniqueWeekly]],
      [[uniqueMonthly]],
      [[returningRow]]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM products'),
      pool.query('SELECT COUNT(*) as total FROM categories'),
      pool.query('SELECT COUNT(*) as total FROM testimonials'),
      pool.query('SELECT COUNT(*) as total FROM process_steps'),
      pool.query('SELECT COUNT(*) as total FROM about_features'),
      pool.query(
        `SELECT SUM(data_length + index_length) as dbSize
         FROM information_schema.tables WHERE table_schema = DATABASE()`
      ),
      pool.query(
        `SELECT COUNT(*) as total FROM page_visits
         WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
      ),
      pool.query(
        `SELECT COUNT(*) as total FROM page_visits
         WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      ),
      pool.query(
        `SELECT IFNULL(ROUND(COUNT(*) / NULLIF(DATEDIFF(NOW(), MIN(visited_at)), 0), 1), 0) as avg_daily
         FROM page_visits`
      ),
      pool.query('SELECT COUNT(DISTINCT ip) as total FROM page_visits'),
      pool.query(
        `SELECT COUNT(DISTINCT ip) as total FROM page_visits
         WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
      ),
      pool.query(
        `SELECT COUNT(DISTINCT ip) as total FROM page_visits
         WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      ),
      pool.query(
        `SELECT COUNT(*) as total FROM (
           SELECT ip FROM page_visits GROUP BY ip HAVING COUNT(*) > 1
         ) as returning_visitors`
      )
    ]);

    // Disk usage (sin execSync, usando fs.statfs nativo)
    let diskTotal = 0, diskUsed = 0;
    try {
      const stats = await statfs('/');
      diskTotal = stats.blocks * stats.bsize;
      const diskFree = stats.bfree * stats.bsize;
      diskUsed = diskTotal - diskFree;
    } catch {}

    res.json({
      products: prodCount.total,
      categories: catCount.total,
      testimonials: testCount.total,
      processSteps: stepsCount.total,
      aboutFeatures: featuresCount.total,
      dbSizeBytes: Number(dbSizeRow.dbSize) || 0,
      diskTotal,
      diskUsed,
      visitsWeekly: weeklyVisits.total,
      visitsMonthly: monthlyVisits.total,
      visitsDailyAvg: Number(dailyAvg.avg_daily) || 0,
      uniqueVisitors: uniqueVisitors.total,
      uniqueWeekly: uniqueWeekly.total,
      uniqueMonthly: uniqueMonthly.total,
      returningVisitors: returningRow.total
    });
  } catch (err) {
    console.error('Error getStats:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
