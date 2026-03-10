import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { getThumb } from '../utils/imageUtils';

function UniquePieces() {
  const { content } = useContent();
  const { title, subtitle, items } = content.uniquePieces;

  if (!items || items.length === 0) return null;

  return (
    <section className="unique-pieces">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <Link to="/productos?cat=piezas-unicas" className="ver-todas">
            Ver todas <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className="copper-divider center"></div>
        <p className="section-subtitle">{subtitle}</p>

        <div className="unique-row">
          {items.map((pieza, index) => (
            <div key={index} className="unique-card">
              <div className="unique-img">
                <img src={getThumb(pieza.imagen)} alt={pieza.nombre} loading="lazy" style={{
                  objectPosition: `${pieza.imagePosX ?? 50}% ${pieza.imagePosY ?? 50}%`,
                  '--img-zoom': pieza.imageZoom ?? 1,
                }} />
              </div>
              <h4>{pieza.nombre}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UniquePieces;
