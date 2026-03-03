import pool from '../config/db.js';

// GET /api/content
export async function getAllContent(req, res) {
  try {
    // Ejecutar todas las queries en paralelo
    const [
      [headerRows],
      [navRows],
      [heroRows],
      [introRows],
      [catSectionRows],
      [categoryRows],
      [productRows],
      [uniqueSectionRows],
      [aboutRows],
      [aboutFeaturesRows],
      [processSectionRows],
      [processStepsRows],
      [worldwideRows],
      [worldwideStatsRows],
      [worldwideCountriesRows],
      [testimonialsSectionRows],
      [testimonialRows],
      [footerRows],
      [productsPageRows]
    ] = await Promise.all([
      pool.query('SELECT * FROM header WHERE id = 1'),
      pool.query('SELECT label, section_id FROM nav_items WHERE header_id = 1 ORDER BY sort_order'),
      pool.query('SELECT * FROM hero WHERE id = 1'),
      pool.query('SELECT * FROM intro WHERE id = 1'),
      pool.query('SELECT * FROM categories_section WHERE id = 1'),
      pool.query('SELECT * FROM categories ORDER BY sort_order'),
      pool.query('SELECT * FROM products ORDER BY sort_order'),
      pool.query('SELECT * FROM unique_pieces_section WHERE id = 1'),
      pool.query('SELECT * FROM about WHERE id = 1'),
      pool.query('SELECT icon, text FROM about_features WHERE about_id = 1 ORDER BY sort_order'),
      pool.query('SELECT * FROM process_section WHERE id = 1'),
      pool.query('SELECT icon, title, description FROM process_steps WHERE process_id = 1 ORDER BY sort_order'),
      pool.query('SELECT * FROM worldwide WHERE id = 1'),
      pool.query('SELECT numero, label, label_corta FROM worldwide_stats WHERE worldwide_id = 1 ORDER BY sort_order'),
      pool.query('SELECT nombre, descripcion, imagen FROM worldwide_countries WHERE worldwide_id = 1 ORDER BY sort_order'),
      pool.query('SELECT * FROM testimonials_section WHERE id = 1'),
      pool.query('SELECT texto, nombre, ubicacion FROM testimonials WHERE section_id = 1 ORDER BY sort_order'),
      pool.query('SELECT * FROM footer WHERE id = 1'),
      pool.query('SELECT * FROM products_page WHERE id = 1')
    ]);

    const header = headerRows[0] || {};
    const hero = heroRows[0] || {};
    const intro = introRows[0] || {};
    const catSection = catSectionRows[0] || {};
    const uniqueSection = uniqueSectionRows[0] || {};
    const about = aboutRows[0] || {};
    const processSection = processSectionRows[0] || {};
    const worldwide = worldwideRows[0] || {};
    const testimonialsSection = testimonialsSectionRows[0] || {};
    const footer = footerRows[0] || {};
    const productsPage = productsPageRows[0] || {};

    // Construir nombresCategorias desde categories + piezas unicas
    const nombresCategorias = {};
    categoryRows.forEach(c => { nombresCategorias[c.slug] = c.nombre; });
    nombresCategorias['unicas'] = 'Piezas Únicas';

    // Armar JSON con la misma forma que content.json
    const content = {
      header: {
        logo: header.logo,
        tagline: header.tagline,
        navItems: navRows.map(n => ({ label: n.label, sectionId: n.section_id }))
      },
      hero: {
        title: hero.title,
        subtitle: hero.subtitle,
        ctaText: hero.cta_text,
        backgroundImage: hero.background_image
      },
      intro: {
        title: intro.title,
        paragraph: intro.paragraph
      },
      categories: {
        title: catSection.title,
        subtitle: catSection.subtitle,
        items: categoryRows.map(c => ({
          slug: c.slug,
          nombre: c.nombre,
          descripcion: c.descripcion,
          imagen: c.imagen
        }))
      },
      uniquePieces: {
        title: uniqueSection.title,
        subtitle: uniqueSection.subtitle,
        items: productRows
          .filter(p => p.categoria === 'piezas-unicas' && p.destacado === 1)
          .map(p => ({ nombre: p.nombre, imagen: p.imagen }))
      },
      about: {
        title: about.title,
        image: about.image,
        paragraphs: typeof about.paragraphs === 'string'
          ? JSON.parse(about.paragraphs)
          : (about.paragraphs || []),
        features: aboutFeaturesRows.map(f => ({ icon: f.icon, text: f.text }))
      },
      process: {
        title: processSection.title,
        steps: processStepsRows.map(s => ({
          icon: s.icon,
          title: s.title,
          description: s.description
        }))
      },
      worldwide: {
        title: worldwide.title,
        subtitle: worldwide.subtitle,
        paragraph: worldwide.paragraph,
        stats: worldwideStatsRows.map(s => ({
          numero: s.numero,
          label: s.label,
          labelCorta: s.label_corta
        })),
        countries: worldwideCountriesRows.map(c => ({
          nombre: c.nombre,
          descripcion: c.descripcion,
          imagen: c.imagen
        }))
      },
      testimonials: {
        title: testimonialsSection.title,
        items: testimonialRows.map(t => ({
          texto: t.texto,
          nombre: t.nombre,
          ubicacion: t.ubicacion
        }))
      },
      footer: {
        logo: footer.logo,
        description: footer.description,
        facebookUrl: footer.facebook_url,
        instagramUrl: footer.instagram_url,
        email: footer.email,
        whatsappNumber: footer.whatsapp_number,
        whatsappDisplay: footer.whatsapp_display,
        address: footer.address,
        copyright: footer.copyright,
        credits: footer.credits
      },
      products: {
        items: productRows.map(p => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          imagen: p.imagen,
          precioActual: p.precio_actual,
          precioAnterior: p.precio_anterior,
          descripcion: p.descripcion,
          destacado: p.destacado === 1
        })),
        nombresCategorias
      },
      productsPage: {
        title: productsPage.title,
        subtitle: productsPage.subtitle,
        filterAllText: productsPage.filter_all_text,
        sortLabels: typeof productsPage.sort_labels === 'string'
          ? JSON.parse(productsPage.sort_labels)
          : (productsPage.sort_labels || {})
      }
    };

    res.json(content);
  } catch (err) {
    console.error('Error obteniendo contenido:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}
