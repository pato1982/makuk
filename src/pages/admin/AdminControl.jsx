import { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';

function AdminControl() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(data => setStats(data))
      .catch(err => setStatsError(err.message || 'Error cargando estadísticas'))
      .finally(() => setStatsLoading(false));
  }, []);

  const getBarColor = (pct) => {
    if (pct < 50) return '#4caf50';
    if (pct < 80) return '#e8a862';
    return '#e05555';
  };

  // SVG semicircle gauge
  const Gauge = ({ percentage, color, size = 140, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius;
    const filled = (Math.min(percentage, 100) / 100) * circumference;

    return (
      <svg viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`} className="ctrl-gauge-svg">
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="#e9ecef"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className="ctrl-gauge-fill"
        />
      </svg>
    );
  };

  // Donut ring for visit KPIs
  const DonutRing = ({ value, max, color, size = 100, strokeWidth = 9 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = max > 0 ? Math.min(value / max, 1) : 0;
    const filled = pct * circumference;

    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="ctrl-donut-svg">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e9ecef" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          className="ctrl-donut-fill"
        />
      </svg>
    );
  };

  if (statsLoading) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">Control</h1>
        <p className="admin-page-subtitle">Estado del sistema y almacenamiento</p>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="admin-page">
        <h1 className="admin-page-title">Control</h1>
        <p className="admin-page-subtitle">Estado del sistema y almacenamiento</p>
        <div className="save-error"><i className="fas fa-exclamation-circle"></i> {statsError}</div>
      </div>
    );
  }

  const dbSizeKB = (stats.dbSizeBytes / 1024).toFixed(1);
  const dbMaxMB = 100;
  const dbMaxKB = dbMaxMB * 1024;
  const dbPct = Number(((stats.dbSizeBytes / (dbMaxMB * 1024 * 1024)) * 100).toFixed(2));

  const diskTotalGB = (stats.diskTotal / (1024 ** 3)).toFixed(1);
  const diskUsedGB = (stats.diskUsed / (1024 ** 3)).toFixed(1);
  const diskFreeGB = ((stats.diskTotal - stats.diskUsed) / (1024 ** 3)).toFixed(1);
  const diskPct = stats.diskTotal ? Number(((stats.diskUsed / stats.diskTotal) * 100).toFixed(1)) : 0;

  const contentItems = [
    { label: 'Productos', count: stats.products, icon: 'fa-box', color: '#5b9bd5' },
    { label: 'Categorías', count: stats.categories, icon: 'fa-th-large', color: '#b87333' },
    { label: 'Piezas únicas', count: stats.uniquePieces, icon: 'fa-gem', color: '#9b59b6' },
    { label: 'Testimonios', count: stats.testimonials, icon: 'fa-quote-left', color: '#e8a862' },
  ];

  const systemItems = [
    { label: 'Sitio web', tag: 'En línea' },
    { label: 'Base de datos', tag: 'Conectada' },
    { label: 'Servidor', tag: 'Activo' },
    { label: 'Panel admin', tag: 'Activo' },
  ];

  const visitMax = Math.max(stats.visitsMonthly, 1);

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Control</h1>
      <p className="admin-page-subtitle">Estado del sistema y almacenamiento</p>

      {/* ── Visitas ── */}
      <div className="ctrl-section">
        <h3 className="ctrl-section-title"><i className="fas fa-chart-bar"></i> Visitas al sitio</h3>
        <div className="ctrl-visits-grid">
          <div className="ctrl-visit-card">
            <div className="ctrl-donut-wrap">
              <DonutRing value={stats.visitsWeekly} max={visitMax} color="#5b9bd5" />
              <span className="ctrl-donut-value">{stats.visitsWeekly}</span>
            </div>
            <span className="ctrl-visit-label">Última semana</span>
          </div>
          <div className="ctrl-visit-card">
            <div className="ctrl-donut-wrap">
              <DonutRing value={stats.visitsMonthly} max={visitMax} color="#b87333" />
              <span className="ctrl-donut-value">{stats.visitsMonthly}</span>
            </div>
            <span className="ctrl-visit-label">Último mes</span>
          </div>
          <div className="ctrl-visit-card">
            <div className="ctrl-donut-wrap">
              <DonutRing value={stats.visitsDailyAvg} max={Math.max(stats.visitsDailyAvg, 1)} color="#4caf50" />
              <span className="ctrl-donut-value">{stats.visitsDailyAvg}</span>
            </div>
            <span className="ctrl-visit-label">Promedio diario</span>
          </div>
        </div>
      </div>

      {/* ── Almacenamiento ── */}
      <div className="ctrl-section">
        <h3 className="ctrl-section-title"><i className="fas fa-hdd"></i> Almacenamiento</h3>
        <div className="ctrl-storage-grid">
          <div className="ctrl-storage-card">
            {/* Gauge for mobile */}
            <div className="ctrl-gauge-wrap ctrl-mobile-only">
              <Gauge percentage={dbPct} color={getBarColor(dbPct)} />
              <span className="ctrl-gauge-pct" style={{ color: getBarColor(dbPct) }}>{dbPct}%</span>
            </div>
            {/* Bar for desktop */}
            <div className="ctrl-bar-block ctrl-desktop-only">
              <div className="ctrl-bar-header">
                <span className="ctrl-storage-name"><i className="fas fa-database"></i> MySQL</span>
                <span className="ctrl-bar-pct" style={{ color: getBarColor(dbPct) }}>{dbPct}%</span>
              </div>
              <div className="ctrl-bar-track">
                <div className="ctrl-bar-fill" style={{ width: `${Math.min(dbPct, 100)}%`, background: getBarColor(dbPct) }}></div>
              </div>
              <span className="ctrl-storage-detail">{dbSizeKB} KB <span className="ctrl-storage-sep">/</span> {dbMaxKB.toLocaleString()} KB</span>
            </div>
            {/* Info for mobile */}
            <div className="ctrl-storage-info ctrl-mobile-only">
              <span className="ctrl-storage-name"><i className="fas fa-database"></i> MySQL</span>
              <span className="ctrl-storage-detail">{dbSizeKB} KB <span className="ctrl-storage-sep">/</span> {dbMaxKB.toLocaleString()} KB</span>
            </div>
          </div>
          <div className="ctrl-storage-card">
            {/* Gauge for mobile */}
            <div className="ctrl-gauge-wrap ctrl-mobile-only">
              <Gauge percentage={diskPct} color={getBarColor(diskPct)} />
              <span className="ctrl-gauge-pct" style={{ color: getBarColor(diskPct) }}>{diskPct}%</span>
            </div>
            {/* Bar for desktop */}
            <div className="ctrl-bar-block ctrl-desktop-only">
              <div className="ctrl-bar-header">
                <span className="ctrl-storage-name"><i className="fas fa-server"></i> Servidor</span>
                <span className="ctrl-bar-pct" style={{ color: getBarColor(diskPct) }}>{diskPct}%</span>
              </div>
              <div className="ctrl-bar-track">
                <div className="ctrl-bar-fill" style={{ width: `${Math.min(diskPct, 100)}%`, background: getBarColor(diskPct) }}></div>
              </div>
              <span className="ctrl-storage-detail">{diskUsedGB} GB <span className="ctrl-storage-sep">/</span> {diskTotalGB} GB <span className="ctrl-storage-free">({diskFreeGB} GB libres)</span></span>
            </div>
            {/* Info for mobile */}
            <div className="ctrl-storage-info ctrl-mobile-only">
              <span className="ctrl-storage-name"><i className="fas fa-server"></i> Servidor</span>
              <span className="ctrl-storage-detail">{diskUsedGB} GB <span className="ctrl-storage-sep">/</span> {diskTotalGB} GB <span className="ctrl-storage-free">({diskFreeGB} GB libres)</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="ctrl-section">
        <h3 className="ctrl-section-title"><i className="fas fa-layer-group"></i> Contenido</h3>
        <div className="ctrl-content-grid">
          {contentItems.map((item, i) => (
            <div key={i} className="ctrl-content-card">
              <div className="ctrl-content-icon-wrap" style={{ background: item.color + '18', color: item.color }}>
                <i className={`fas ${item.icon}`}></i>
              </div>
              <div className="ctrl-content-data">
                <span className="ctrl-content-count">{item.count}</span>
                <span className="ctrl-content-label">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sistema ── */}
      <div className="ctrl-section">
        <h3 className="ctrl-section-title"><i className="fas fa-heartbeat"></i> Estado del sistema</h3>
        <div className="ctrl-system-grid">
          {systemItems.map((item, i) => (
            <div key={i} className="ctrl-system-card">
              <span className="ctrl-system-pulse"></span>
              <span className="ctrl-system-name">{item.label}</span>
              <span className="ctrl-system-tag">{item.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminControl;
