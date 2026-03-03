import { useContent } from '../../context/ContentContext';

function Dashboard() {
  const { content } = useContent();

  const stats = [
    { label: 'Categorías', value: content.categories.items.length, icon: 'fa-th-large' },
    { label: 'Productos', value: content.products.items.length, icon: 'fa-box' },
    { label: 'Piezas Únicas', value: content.uniquePieces.items.length, icon: 'fa-gem' },
    { label: 'Testimonios', value: content.testimonials.items.length, icon: 'fa-quote-left' },
    { label: 'Países', value: content.worldwide.countries.length, icon: 'fa-globe' },
    { label: 'Pasos del Proceso', value: content.process.steps.length, icon: 'fa-cogs' },
  ];

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-subtitle">Resumen del contenido del sitio</p>

      <div className="dashboard-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="dashboard-stat-card">
            <div className="stat-icon">
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3><i className="fas fa-info-circle"></i> Cómo funciona</h3>
          <ul>
            <li>Usa el menú lateral para navegar entre las secciones editables</li>
            <li>Los cambios se guardan en la base de datos al hacer click en "Guardar cambios"</li>
            <li>Los cambios se reflejan en el sitio público al recargar la página</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
