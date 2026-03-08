import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { getThumb } from '../utils/imageUtils';

function Categories() {
  const { content } = useContent();
  const { title, subtitle, items } = content.categories;
  const productos = content.products.items;

  const getPortada = (slug) => {
    const destacado = productos.find(p => p.categoria === slug && p.destacado);
    return destacado?.imagen || null;
  };

  const filas = [];
  for (let i = 0; i < items.length; i += 5) {
    filas.push(items.slice(i, i + 5));
  }

  return (
    <section id="categorias" className="categories">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="copper-divider center"></div>
        <p className="section-subtitle">{subtitle}</p>

        {filas.map((fila, fi) => (
          <div key={fi} className="categories-row">
            {fila.map((cat) => (
              <Link
                key={cat.slug}
                to={`/productos?cat=${cat.slug}`}
                className="category-card"
              >
                <div className="category-img">
                  {getPortada(cat.slug) ? (
                    <img src={getThumb(getPortada(cat.slug))} alt={cat.nombre} loading="lazy" />
                  ) : (
                    <div className="category-img-placeholder"><i className="fas fa-image"></i></div>
                  )}
                </div>
                <div className="category-info">
                  <h4>{cat.nombre}</h4>
                  <p>{cat.descripcion}</p>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
