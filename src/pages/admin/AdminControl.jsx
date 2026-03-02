import { useContent } from '../../context/ContentContext';
import AdminCard from '../../components/admin/AdminCard';

function AdminControl() {
  const { content } = useContent();

  const contentStr = JSON.stringify(content);
  const usedBytes = new Blob([contentStr]).size;
  const maxBytes = 5 * 1024 * 1024; // 5MB límite típico
  const usedKB = (usedBytes / 1024).toFixed(1);
  const maxKB = (maxBytes / 1024).toFixed(0);
  const percentage = ((usedBytes / maxBytes) * 100).toFixed(2);

  const totalProducts = content.products?.items?.length || 0;
  const totalCategories = content.categories?.items?.length || 0;
  const totalTestimonials = content.testimonials?.items?.length || 0;
  const totalCountries = content.worldwide?.countries?.length || 0;
  const totalSteps = content.process?.steps?.length || 0;
  const totalFeatures = content.about?.features?.length || 0;

  const sections = [
    { label: 'Productos', count: totalProducts, icon: 'fa-box' },
    { label: 'Categorías', count: totalCategories, icon: 'fa-th-large' },
    { label: 'Testimonios', count: totalTestimonials, icon: 'fa-quote-left' },
    { label: 'Países', count: totalCountries, icon: 'fa-globe' },
    { label: 'Pasos proceso', count: totalSteps, icon: 'fa-cogs' },
    { label: 'Features', count: totalFeatures, icon: 'fa-star' },
  ];

  const getBarColor = () => {
    if (percentage < 50) return '#4caf50';
    if (percentage < 80) return '#e8a862';
    return '#e05555';
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Control</h1>
      <p className="admin-page-subtitle">Estado del sistema y almacenamiento</p>

      <AdminCard title="Almacenamiento">
        <div className="control-storage">
          <div className="control-storage-bar">
            <div className="control-storage-fill" style={{ width: `${Math.min(percentage, 100)}%`, background: getBarColor() }}></div>
          </div>
          <div className="control-storage-info">
            <span><strong>{usedKB} KB</strong> de {maxKB} KB usados</span>
            <span>{percentage}%</span>
          </div>
        </div>
        <p className="control-note">
          <i className="fas fa-info-circle"></i> Almacenamiento local. Se conectará a base de datos en el futuro.
        </p>
      </AdminCard>

      <AdminCard title="Resumen de contenido">
        <div className="control-stats">
          {sections.map((s, i) => (
            <div key={i} className="control-stat-card">
              <i className={`fas ${s.icon} control-stat-icon`}></i>
              <span className="control-stat-count">{s.count}</span>
              <span className="control-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Estado del sistema">
        <div className="control-status-list">
          <div className="control-status-item">
            <span className="control-status-dot online"></span>
            <span>Sitio web</span>
            <span className="control-status-tag">En línea</span>
          </div>
          <div className="control-status-item">
            <span className="control-status-dot pending"></span>
            <span>Base de datos</span>
            <span className="control-status-tag pending">Pendiente</span>
          </div>
          <div className="control-status-item">
            <span className="control-status-dot online"></span>
            <span>Panel de administración</span>
            <span className="control-status-tag">Activo</span>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

export default AdminControl;
