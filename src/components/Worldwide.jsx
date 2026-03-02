import { useContent } from '../context/ContentContext';

function Worldwide() {
  const { content } = useContent();
  const { title, subtitle, paragraph, stats, countries } = content.worldwide;

  return (
    <section id="mundial" className="worldwide">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="copper-divider center"></div>
        <p className="section-subtitle">{subtitle}</p>

        <div className="world-content">
          <div className="world-text">
            <p>{paragraph}</p>
          </div>

          <div className="countries-grid">
            {countries.map((pais, index) => (
              <div key={index} className="country-card">
                <img src={pais.imagen} alt={pais.nombre} />
                <div className="country-overlay">
                  <h4>{pais.nombre}</h4>
                  <p>{pais.descripcion}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="stats-row">
            {stats.map((stat, index) => (
              <div key={index} className={`stat${index === stats.length - 1 ? ' stat-hide-mobile' : ''}`}>
                <span className="stat-number">{stat.numero}</span>
                <span className="stat-label stat-label-full">{stat.label}</span>
                <span className="stat-label stat-label-short">{stat.labelCorta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Worldwide;
