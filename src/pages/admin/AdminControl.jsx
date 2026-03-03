import { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';
import AdminCard from '../../components/admin/AdminCard';

function AdminControl() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(data => setStats(data))
      .catch(err => setError(err.message || 'Error cargando estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">Control</h1>
        <p className="admin-page-subtitle">Estado del sistema y almacenamiento</p>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">Control</h1>
        <p className="admin-page-subtitle">Estado del sistema y almacenamiento</p>
        <div className="save-error"><i className="fas fa-exclamation-circle"></i> {error}</div>
      </div>
    );
  }

  const dbSizeKB = (stats.dbSizeBytes / 1024).toFixed(1);
  const dbMaxMB = 100; // Límite típico MySQL shared hosting
  const dbMaxKB = dbMaxMB * 1024;
  const dbPercentage = ((stats.dbSizeBytes / (dbMaxMB * 1024 * 1024)) * 100).toFixed(2);

  const sections = [
    { label: 'Productos', count: stats.products, icon: 'fa-box' },
    { label: 'Categorías', count: stats.categories, icon: 'fa-th-large' },
    { label: 'Testimonios', count: stats.testimonials, icon: 'fa-quote-left' },
    { label: 'Países', count: stats.countries, icon: 'fa-globe' },
    { label: 'Pasos proceso', count: stats.processSteps, icon: 'fa-cogs' },
    { label: 'Features', count: stats.aboutFeatures, icon: 'fa-star' },
  ];

  const getBarColor = () => {
    if (dbPercentage < 50) return '#4caf50';
    if (dbPercentage < 80) return '#e8a862';
    return '#e05555';
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Control</h1>
      <p className="admin-page-subtitle">Estado del sistema y almacenamiento</p>

      <AdminCard title="Almacenamiento MySQL">
        <div className="control-storage">
          <div className="control-storage-bar">
            <div className="control-storage-fill" style={{ width: `${Math.min(dbPercentage, 100)}%`, background: getBarColor() }}></div>
          </div>
          <div className="control-storage-info">
            <span><strong>{dbSizeKB} KB</strong> de {dbMaxKB.toLocaleString()} KB disponibles</span>
            <span>{dbPercentage}%</span>
          </div>
        </div>
        <p className="control-note">
          <i className="fas fa-info-circle"></i> Almacenamiento en base de datos MySQL.
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
            <span className="control-status-dot online"></span>
            <span>Base de datos</span>
            <span className="control-status-tag">Conectada</span>
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
