import { useState, useEffect, useCallback } from 'react';
import { getAuditLog } from '../../services/api';

const ACTION_LABELS = {
  crear: { label: 'Creado', icon: 'fa-plus-circle', color: '#22c55e' },
  editar: { label: 'Editado', icon: 'fa-edit', color: '#b87333' },
  eliminar: { label: 'Eliminado', icon: 'fa-trash', color: '#e05555' },
};

const SECTION_LABELS = {
  header: 'Header',
  hero: 'Banner',
  intro: 'Intro',
  categories: 'Categorías',
  products: 'Productos',
  'unique-pieces': 'Piezas Únicas',
  about: 'Nosotros',
  process: 'Proceso',
  testimonials: 'Testimonios',
  footer: 'Footer',
  'products-page': 'Página Productos',
  imagen: 'Imagen',
};

function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filterSection, setFilterSection] = useState('');
  const limit = 30;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit, offset: page * limit };
      if (filterSection) params.section = filterSection;
      const data = await getAuditLog(params);
      setLogs(data.items);
      setTotal(data.total);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filterSection]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Registro de Cambios</h1>
      <p className="admin-page-subtitle">Historial de todas las acciones realizadas en el panel</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
        <select
          value={filterSection}
          onChange={(e) => { setFilterSection(e.target.value); setPage(0); }}
          style={{ padding: '6px 10px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #333', background: '#1a1a2e', color: '#e4e4e7' }}
        >
          <option value="">Todas las secciones</option>
          {Object.entries(SECTION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>{total} registro{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', color: '#b87333' }}></i>
        </div>
      ) : logs.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <i className="fas fa-clipboard-check" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}></i>
          No hay registros aún
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#16162a', color: '#b87333', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Fecha</th>
                <th style={{ padding: '10px 12px' }}>Acción</th>
                <th style={{ padding: '10px 12px' }}>Sección</th>
                <th style={{ padding: '10px 12px' }}>Detalle</th>
                <th style={{ padding: '10px 12px' }}>Usuario</th>
                <th style={{ padding: '10px 12px' }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const actionInfo = ACTION_LABELS[log.action] || { label: log.action, icon: 'fa-circle', color: '#888' };
                return (
                  <tr key={log.id} style={{ borderTop: '1px solid #222' }}>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', color: '#aaa' }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: actionInfo.color, fontWeight: 600 }}>
                        <i className={`fas ${actionInfo.icon}`} style={{ marginRight: '4px' }}></i>
                        {actionInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#e4e4e7' }}>
                      {SECTION_LABELS[log.section] || log.section}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#ccc', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#aaa' }}>
                      {log.user_email}
                    </td>
                    <td style={{ padding: '8px 12px', color: '#666', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {log.ip}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #333', background: page === 0 ? '#111' : '#1a1a2e', color: page === 0 ? '#444' : '#e4e4e7', cursor: page === 0 ? 'default' : 'pointer' }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span style={{ padding: '6px 12px', color: '#aaa', fontSize: '0.85rem' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #333', background: page >= totalPages - 1 ? '#111' : '#1a1a2e', color: page >= totalPages - 1 ? '#444' : '#e4e4e7', cursor: page >= totalPages - 1 ? 'default' : 'pointer' }}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminAuditLog;
