import pool from '../config/db.js';

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
    res.json({ message: 'Categorías actualizadas' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updateCategories:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    conn.release();
  }
}

// PUT /api/admin/products
export async function updateProducts(req, res) {
  const { items, nombresCategorias } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM products');
    for (let i = 0; i < items.length; i++) {
      const p = items[i];
      await conn.query(
        'INSERT INTO products (nombre, categoria, imagen, precio_actual, precio_anterior, descripcion, destacado, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [p.nombre, p.categoria, p.imagen, p.precioActual || 0, p.precioAnterior || 0, p.descripcion, p.destacado ? 1 : 0, i + 1]
      );
    }
    // Sincronizar nombres de categorías si vienen
    if (nombresCategorias) {
      for (const [slug, nombre] of Object.entries(nombresCategorias)) {
        if (slug === 'unicas') continue; // 'unicas' no es una categoría real en la tabla
        await conn.query(
          'UPDATE categories SET nombre = ? WHERE slug = ?',
          [nombre, slug]
        );
      }
    }
    await conn.commit();
    res.json({ message: 'Productos actualizados' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updateProducts:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    conn.release();
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
    res.json({ message: 'Proceso actualizado' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updateProcess:', err);
    res.status(500).json({ error: 'Error del servidor' });
  } finally {
    conn.release();
  }
}

// PUT /api/admin/worldwide
export async function updateWorldwide(req, res) {
  const { title, subtitle, paragraph, stats, countries } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE worldwide SET title = ?, subtitle = ?, paragraph = ? WHERE id = 1',
      [title, subtitle, paragraph]
    );
    await conn.query('DELETE FROM worldwide_stats WHERE worldwide_id = 1');
    for (let i = 0; i < stats.length; i++) {
      const s = stats[i];
      await conn.query(
        'INSERT INTO worldwide_stats (worldwide_id, numero, label, label_corta, sort_order) VALUES (1, ?, ?, ?, ?)',
        [s.numero, s.label, s.labelCorta, i + 1]
      );
    }
    await conn.query('DELETE FROM worldwide_countries WHERE worldwide_id = 1');
    for (let i = 0; i < countries.length; i++) {
      const c = countries[i];
      await conn.query(
        'INSERT INTO worldwide_countries (worldwide_id, nombre, descripcion, imagen, sort_order) VALUES (1, ?, ?, ?, ?)',
        [c.nombre, c.descripcion, c.imagen, i + 1]
      );
    }
    await conn.commit();
    res.json({ message: 'Worldwide actualizado' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updateWorldwide:', err);
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
    res.json({ message: 'Página productos actualizada' });
  } catch (err) {
    console.error('Error updateProductsPage:', err);
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
      [[countryCount]],
      [[stepsCount]],
      [[featuresCount]],
      [[dbSizeRow]]
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as total FROM products'),
      pool.query('SELECT COUNT(*) as total FROM categories'),
      pool.query('SELECT COUNT(*) as total FROM testimonials'),
      pool.query('SELECT COUNT(*) as total FROM worldwide_countries'),
      pool.query('SELECT COUNT(*) as total FROM process_steps'),
      pool.query('SELECT COUNT(*) as total FROM about_features'),
      pool.query(
        `SELECT SUM(data_length + index_length) as dbSize
         FROM information_schema.tables WHERE table_schema = DATABASE()`
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
      countries: countryCount.total,
      processSteps: stepsCount.total,
      aboutFeatures: featuresCount.total,
      dbSizeBytes: Number(dbSizeRow.dbSize) || 0,
      diskTotal,
      diskUsed
    });
  } catch (err) {
    console.error('Error getStats:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
