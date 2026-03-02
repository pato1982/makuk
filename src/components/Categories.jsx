import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

function Categories() {
  const { content } = useContent();
  const { title, subtitle, items } = content.categories;
  const productos = content.products.items;

  const getPortada = (slug) => {
    const destacado = productos.find(p => p.categoria === slug && p.destacado);
    return destacado?.imagen || null;
  };

  const primeraFila = items.slice(0, 5);
  const segundaFila = items.slice(5, 10);

  return (
    <section id="categorias" className="categories">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="copper-divider center"></div>
        <p className="section-subtitle">{subtitle}</p>

        <div className="categories-row">
          {primeraFila.map((cat) => (
            <Link
              key={cat.slug}
              to={`/productos?cat=${cat.slug}`}
              className="category-card"
            >
              <div className="category-img">
                <img src={getPortada(cat.slug) || cat.imagen} alt={cat.nombre} />
              </div>
              <div className="category-info">
                <h4>{cat.nombre}</h4>
                <p>{cat.descripcion}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="categories-row">
          {segundaFila.map((cat) => (
            <Link
              key={cat.slug}
              to={`/productos?cat=${cat.slug}`}
              className="category-card"
            >
              <div className="category-img">
                <img src={getPortada(cat.slug) || cat.imagen} alt={cat.nombre} />
              </div>
              <div className="category-info">
                <h4>{cat.nombre}</h4>
                <p>{cat.descripcion}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
