import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { getThumb } from '../utils/imageUtils';

function UniquePieces() {
  const { content } = useContent();
  const { title, subtitle, items } = content.uniquePieces;
  const [popupPieza, setPopupPieza] = useState(null);
  const [popupImgIndex, setPopupImgIndex] = useState(0);

  const popupImagenes = useMemo(() => {
    if (!popupPieza) return [];
    return [
      { url: popupPieza.imagen, posX: popupPieza.imagePosX, posY: popupPieza.imagePosY, zoom: popupPieza.imageZoom },
      { url: popupPieza.imagen2, posX: popupPieza.image2PosX, posY: popupPieza.image2PosY, zoom: popupPieza.image2Zoom },
      { url: popupPieza.imagen3, posX: popupPieza.image3PosX, posY: popupPieza.image3PosY, zoom: popupPieza.image3Zoom },
    ].filter(img => img.url);
  }, [popupPieza]);

  const openPopup = (pieza) => {
    setPopupImgIndex(0);
    setPopupPieza(pieza);
  };

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

        {items && items.length > 0 && (
          <div className="unique-row">
            {items.map((pieza, index) => (
              <div key={index} className="unique-card" onClick={() => openPopup(pieza)} style={{ cursor: 'pointer' }}>
                <div className="unique-img">
                  <div className="unique-img-wrapper" style={{
                    '--img-zoom': pieza.imageZoom ?? 1,
                    '--img-tx': `${50 - (pieza.imagePosX ?? 50)}%`,
                    '--img-ty': `${50 - (pieza.imagePosY ?? 50)}%`,
                  }}>
                    <img src={getThumb(pieza.imagen)} alt={pieza.nombre} loading="lazy" />
                  </div>
                </div>
                <h4>{pieza.nombre}</h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {popupPieza && (
        <div className="producto-popup-overlay" onClick={() => setPopupPieza(null)}>
          <div className="producto-popup" onClick={(e) => e.stopPropagation()}>
            <button className="producto-popup-close" onClick={() => setPopupPieza(null)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="popup-img-editor">
              <div className="popup-carousel">
                {popupImagenes.length > 1 && (
                  <button type="button" className="carousel-arrow carousel-arrow-left" onClick={() => setPopupImgIndex((prev) => (prev - 1 + popupImagenes.length) % popupImagenes.length)}>
                    <i className="fas fa-chevron-left"></i>
                  </button>
                )}
                <div className="producto-popup-img">
                  <div className="popup-img-pan-wrapper" style={{
                    transform: `scale(${popupImagenes[popupImgIndex]?.zoom ?? 1}) translate(${50 - (popupImagenes[popupImgIndex]?.posX ?? 50)}%, ${50 - (popupImagenes[popupImgIndex]?.posY ?? 50)}%)`,
                  }}>
                    <img src={popupImagenes[popupImgIndex]?.url} alt={popupPieza.nombre} />
                  </div>
                </div>
                {popupImagenes.length > 1 && (
                  <button type="button" className="carousel-arrow carousel-arrow-right" onClick={() => setPopupImgIndex((prev) => (prev + 1) % popupImagenes.length)}>
                    <i className="fas fa-chevron-right"></i>
                  </button>
                )}
              </div>
              {popupImagenes.length > 1 && (
                <div className="carousel-dots">
                  {popupImagenes.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`carousel-dot ${idx === popupImgIndex ? 'active' : ''}`}
                      onClick={() => setPopupImgIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="producto-popup-info">
              <div className="producto-popup-nombre-desc-row">
                <h3 className="producto-popup-nombre">{popupPieza.nombre}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default UniquePieces;
