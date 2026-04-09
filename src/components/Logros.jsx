import { useState } from 'react';
import { useContent } from '../context/ContentContext';
import defaultContent from '../data/content.json';

function Logros() {
  const { content } = useContent();
  const logros = content.logros || defaultContent.logros;
  const [imagenAbierta, setImagenAbierta] = useState(null);

  if (!logros) return null;
  const { title, subtitle, items } = logros;

  return (
    <section className="logros">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="copper-divider center"></div>
        <p className="section-subtitle">{subtitle}</p>
        <div className="logros-grid">
          {items.map((logro, index) => (
            <div key={index} className="logro-card" onClick={() => setImagenAbierta(logro)}>
              <div className="logro-img">
                <img src={logro.imagen} alt={logro.titulo} />
              </div>
              <div className="logro-info">
                <div className="logro-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <h4>{logro.titulo}</h4>
                <p>{logro.descripcion}</p>
                {logro.año && <span className="logro-year">{logro.año}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {imagenAbierta && (
        <div className="logro-modal" onClick={() => setImagenAbierta(null)}>
          <div className="logro-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="logro-modal-close" onClick={() => setImagenAbierta(null)}>
              <i className="fas fa-times"></i>
            </button>
            <img src={imagenAbierta.imagen} alt={imagenAbierta.titulo} />
            <h4>{imagenAbierta.titulo}</h4>
          </div>
        </div>
      )}
    </section>
  );
}

export default Logros;
