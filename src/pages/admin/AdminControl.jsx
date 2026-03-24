import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdminStats, getAdminOrders, getAdminOrderDetail, updateOrderAdminStatus } from '../../services/api';
import AdminCard from '../../components/admin/AdminCard';

const FLOW_STATUSES = {
  paid:       { label: 'Pagado',     icon: 'fa-check-circle',      color: '#4caf50' },
  rejected:   { label: 'Rechazado',  icon: 'fa-times-circle',      color: '#e05555' },
  cancelled:  { label: 'Cancelado',  icon: 'fa-ban',               color: '#888' },
  processing: { label: 'En proceso', icon: 'fa-spinner',            color: '#5b9bd5' },
  pending:    { label: 'Pendiente',  icon: 'fa-clock',             color: '#e8a862' },
  error:      { label: 'Error',      icon: 'fa-exclamation-circle', color: '#e05555' },
};

const ADMIN_STATUSES = [
  { value: 'en_proceso',   label: 'En proceso',   icon: 'fa-spinner',      color: '#5b9bd5', bg: 'rgba(91,155,213,0.1)' },
  { value: 'produciendo',  label: 'Produciendo',   icon: 'fa-cog',          color: '#e8a862', bg: 'rgba(232,168,98,0.1)' },
  { value: 'enviado',      label: 'Enviado',       icon: 'fa-truck',        color: '#9b59b6', bg: 'rgba(155,89,182,0.1)' },
  { value: 'entregado',    label: 'Entregado',     icon: 'fa-check-circle', color: '#4caf50', bg: 'rgba(76,175,80,0.1)' },
  { value: 'cancelado',    label: 'Cancelado',     icon: 'fa-ban',          color: '#888',    bg: 'rgba(136,136,136,0.1)' },
];

function getAdminStatusInfo(status) {
  return ADMIN_STATUSES.find(s => s.value === status) || ADMIN_STATUSES[0];
}

function getStatusInfo(status) {
  return FLOW_STATUSES[status] || { label: status || 'Desconocido', icon: 'fa-question-circle', color: '#888' };
}

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-CL');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function AdminControl() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [tab, setTab] = useState('contenido');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersTotal, setOrdersTotal] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('info');
  const [openStatusMenu, setOpenStatusMenu] = useState(null);
  const statusMenuRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setOpenStatusMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdminStatusChange = async (commerceOrder, newStatus) => {
    setOpenStatusMenu(null);
    try {
      await updateOrderAdminStatus(commerceOrder, newStatus);
      setOrders(prev => prev.map(o =>
        o.commerce_order === commerceOrder ? { ...o, admin_status: newStatus } : o
      ));
      if (selectedOrder?.commerce_order === commerceOrder) {
        setSelectedOrder(prev => ({ ...prev, admin_status: newStatus }));
      }
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  // Load stats
  useEffect(() => {
    getAdminStats()
      .then(data => setStats(data))
      .catch(err => setStatsError(err.message || 'Error cargando estadísticas'))
      .finally(() => setStatsLoading(false));
  }, []);

  // Load orders when ventas tab is shown
  const loadOrders = useCallback(() => {
    setOrdersLoading(true);
    setOrdersError('');
    getAdminOrders({ limit: 50 })
      .then(data => {
        setOrders(data.orders || []);
        setOrdersTotal(data.total || 0);
      })
      .catch(err => setOrdersError(err.message || 'Error cargando órdenes'))
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    if (tab === 'ventas') loadOrders();
  }, [tab, loadOrders]);

  // Load detail when a row is clicked
  const handleSelectOrder = (commerceOrder) => {
    if (selectedOrder?.commerce_order === commerceOrder) {
      setSelectedOrder(null);
      return;
    }
    setDetailLoading(true);
    setDetailTab('info');
    getAdminOrderDetail(commerceOrder)
      .then(data => setSelectedOrder(data))
      .catch(() => setSelectedOrder(null))
      .finally(() => setDetailLoading(false));
  };

  const getBarColor = (pct) => {
    if (pct < 50) return '#4caf50';
    if (pct < 80) return '#e8a862';
    return '#e05555';
  };

  const renderContenido = () => {
    if (statsLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
        </div>
      );
    }

    if (statsError) {
      return <div className="save-error"><i className="fas fa-exclamation-circle"></i> {statsError}</div>;
    }

    const dbSizeKB = (stats.dbSizeBytes / 1024).toFixed(1);
    const dbMaxMB = 100;
    const dbMaxKB = dbMaxMB * 1024;
    const dbPercentage = ((stats.dbSizeBytes / (dbMaxMB * 1024 * 1024)) * 100).toFixed(2);

    const diskTotalGB = (stats.diskTotal / (1024 ** 3)).toFixed(1);
    const diskUsedGB = (stats.diskUsed / (1024 ** 3)).toFixed(1);
    const diskFreeGB = ((stats.diskTotal - stats.diskUsed) / (1024 ** 3)).toFixed(1);
    const diskPercentage = stats.diskTotal ? ((stats.diskUsed / stats.diskTotal) * 100).toFixed(1) : 0;

    const sections = [
      { label: 'Productos', count: stats.products, icon: 'fa-box' },
      { label: 'Categorías', count: stats.categories, icon: 'fa-th-large' },
      { label: 'Piezas únicas', count: stats.uniquePieces, icon: 'fa-gem' },
      { label: 'Testimonios', count: stats.testimonials, icon: 'fa-quote-left' },
    ];

    return (
      <>
        <AdminCard title="Almacenamiento">
          <div className="control-storage-row">
            <div className="control-storage">
              <h4 className="control-storage-title"><i className="fas fa-database"></i> MySQL</h4>
              <div className="control-storage-bar">
                <div className="control-storage-fill" style={{ width: `${Math.min(dbPercentage, 100)}%`, background: getBarColor(dbPercentage) }}></div>
              </div>
              <div className="control-storage-info">
                <span><strong>{dbSizeKB} KB</strong> de {dbMaxKB.toLocaleString()} KB</span>
                <span>{dbPercentage}%</span>
              </div>
            </div>
            <div className="control-storage">
              <h4 className="control-storage-title"><i className="fas fa-server"></i> Servidor</h4>
              <div className="control-storage-bar">
                <div className="control-storage-fill" style={{ width: `${Math.min(diskPercentage, 100)}%`, background: getBarColor(diskPercentage) }}></div>
              </div>
              <div className="control-storage-info">
                <span><strong>{diskUsedGB} GB</strong> de {diskTotalGB} GB ({diskFreeGB} GB libres)</span>
                <span>{diskPercentage}%</span>
              </div>
            </div>
          </div>
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
              <span>Servidor</span>
              <span className="control-status-tag">Activo</span>
            </div>
            <div className="control-status-item">
              <span className="control-status-dot online"></span>
              <span>Panel admin</span>
              <span className="control-status-tag">Activo</span>
            </div>
          </div>
        </AdminCard>
      </>
    );
  };

  const renderVentas = () => {
    if (ordersLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
        </div>
      );
    }

    if (ordersError) {
      return (
        <div className="save-error">
          <i className="fas fa-exclamation-circle"></i> {ordersError}
          <button className="ventas-reload-btn" onClick={loadOrders} style={{ marginLeft: '1rem' }}>
            <i className="fas fa-redo"></i> Reintentar
          </button>
        </div>
      );
    }

    return (
      <div className="ventas-layout">
        {/* Columna izquierda: tabla de órdenes */}
        <div className="ventas-table-col">
          <AdminCard title={`Órdenes${ordersTotal ? ` (${ordersTotal})` : ''}`}>
            <div className="ventas-table-wrapper">
              <table className="ventas-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Orden</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const adminSt = getAdminStatusInfo(order.admin_status);
                    const isSelected = selectedOrder?.commerce_order === order.commerce_order;
                    const isMenuOpen = openStatusMenu === order.commerce_order;

                    return (
                      <tr
                        key={order.id}
                        className={isSelected ? 'ventas-row-selected' : ''}
                        onClick={() => handleSelectOrder(order.commerce_order)}
                      >
                        <td className="ventas-cell-date">{formatDate(order.created_at).split(',')[0]}</td>
                        <td className="ventas-cell-order">{order.commerce_order}</td>
                        <td className="ventas-cell-total">{formatPrice(order.total)}</td>
                        <td className="ventas-cell-status">
                          <div className="ventas-status-wrapper" ref={isMenuOpen ? statusMenuRef : null}>
                            <button
                              className="ventas-status-btn"
                              style={{ color: adminSt.color, borderColor: adminSt.color, background: adminSt.bg }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenStatusMenu(isMenuOpen ? null : order.commerce_order);
                              }}
                            >
                              <i className={`fas ${adminSt.icon}`}></i>
                              {adminSt.label}
                              <i className="fas fa-chevron-down ventas-status-chevron"></i>
                            </button>
                            {isMenuOpen && (
                              <div className="ventas-status-menu">
                                {ADMIN_STATUSES.map(st => (
                                  <button
                                    key={st.value}
                                    className={`ventas-status-option${order.admin_status === st.value ? ' active' : ''}`}
                                    style={{ color: st.color }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAdminStatusChange(order.commerce_order, st.value);
                                    }}
                                  >
                                    <i className={`fas ${st.icon}`}></i> {st.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="ventas-empty">
                  <i className="fas fa-receipt"></i>
                  <p>No hay órdenes registradas</p>
                </div>
              )}
            </div>
          </AdminCard>
        </div>

        {/* Columna derecha: detalle de orden */}
        <div className="ventas-detail-col">
          {detailLoading ? (
            <AdminCard>
              <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
              </div>
            </AdminCard>
          ) : selectedOrder ? (() => {
            const adminSt = getAdminStatusInfo(selectedOrder.admin_status);

            return (
              <AdminCard title={
                <span className="ventas-detail-header">
                  <span>{selectedOrder.commerce_order}</span>
                  <span className="ventas-detail-header-status" style={{ color: adminSt.color }}>
                    <i className={`fas ${adminSt.icon}`}></i> {adminSt.label}
                  </span>
                </span>
              }>
                <div className="ventas-detail">
                  <div className="ventas-detail-tabs">
                    <button className={`ventas-detail-tab ${detailTab === 'info' ? 'active' : ''}`} onClick={() => setDetailTab('info')}>
                      <i className="fas fa-user"></i> Cliente
                    </button>
                    <button className={`ventas-detail-tab ${detailTab === 'compra' ? 'active' : ''}`} onClick={() => setDetailTab('compra')}>
                      <i className="fas fa-shopping-bag"></i> Compra
                    </button>
                    <button className={`ventas-detail-tab ${detailTab === 'pago' ? 'active' : ''}`} onClick={() => setDetailTab('pago')}>
                      <i className="fas fa-credit-card"></i> Pago
                    </button>
                  </div>

                  {detailTab === 'info' && (
                    <>
                      <h4 className="ventas-detail-section-title"><i className="fas fa-user"></i> Cliente</h4>
                      <div className="ventas-detail-rows">
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Nombre</span>
                          <span className="ventas-detail-value">{selectedOrder.customer_name}</span>
                        </div>
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Email</span>
                          <span className="ventas-detail-value">{selectedOrder.customer_email}</span>
                        </div>
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Teléfono</span>
                          <span className="ventas-detail-value">{selectedOrder.customer_phone || '—'}</span>
                        </div>
                      </div>

                      <h4 className="ventas-detail-section-title"><i className="fas fa-calendar-alt"></i> Fechas</h4>
                      <div className="ventas-detail-rows">
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Creada</span>
                          <span className="ventas-detail-value">{formatDate(selectedOrder.created_at)}</span>
                        </div>
                        {selectedOrder.paid_at && (
                          <div className="ventas-detail-row">
                            <span className="ventas-detail-label">Pagada</span>
                            <span className="ventas-detail-value">{formatDate(selectedOrder.paid_at)}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {detailTab === 'compra' && (
                    <>
                      <div className="ventas-detail-items">
                        {(selectedOrder.items || []).map((item, i) => (
                          <div key={i} className="ventas-detail-item">
                            <div className="ventas-detail-item-info">
                              <span className="ventas-detail-item-name">{item.product_name}</span>
                              <span className="ventas-detail-item-qty">x{item.quantity}</span>
                            </div>
                            <span className="ventas-detail-item-price">{formatPrice(item.line_total)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="ventas-detail-totals">
                        <div className="ventas-detail-total-row">
                          <span>Subtotal (neto)</span>
                          <span>{formatPrice(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="ventas-detail-total-row">
                          <span>IVA (19%)</span>
                          <span>{formatPrice(selectedOrder.iva)}</span>
                        </div>
                        <div className="ventas-detail-total-row ventas-detail-total-final">
                          <span>Total</span>
                          <span>{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {detailTab === 'pago' && (
                    <>
                      <h4 className="ventas-detail-section-title"><i className="fas fa-credit-card"></i> Transacción</h4>
                      <div className="ventas-detail-rows">
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Flow Order</span>
                          <span className="ventas-detail-value">{selectedOrder.flow_order ? `#${selectedOrder.flow_order}` : '—'}</span>
                        </div>
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Medio de pago</span>
                          <span className="ventas-detail-value">{selectedOrder.payment_method || '—'}</span>
                        </div>
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Email pagador</span>
                          <span className="ventas-detail-value">{selectedOrder.payer_email || '—'}</span>
                        </div>
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Estado Flow</span>
                          <span className="ventas-detail-value">{selectedOrder.flow_status ?? '—'}</span>
                        </div>
                      </div>

                      {(selectedOrder.statusLog || []).length > 0 && (
                        <>
                          <h4 className="ventas-detail-section-title"><i className="fas fa-history"></i> Historial</h4>
                          <div className="ventas-status-log">
                            {selectedOrder.statusLog.map((entry, i) => (
                              <div key={i} className="ventas-status-log-entry">
                                <span className="ventas-status-log-time">{formatDate(entry.created_at)}</span>
                                <span className="ventas-status-log-detail">
                                  {entry.previous_status ? `${entry.previous_status} → ` : ''}{entry.new_status}
                                  {entry.details ? ` — ${entry.details}` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </AdminCard>
            );
          })() : (
            <AdminCard>
              <div className="ventas-detail-empty">
                <i className="fas fa-hand-pointer"></i>
                <p>Selecciona una orden para ver el detalle</p>
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Control</h1>
      <p className="admin-page-subtitle">Estado del sistema y almacenamiento</p>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'contenido' ? 'active' : ''}`} onClick={() => setTab('contenido')}>
          <i className="fas fa-database"></i> Control de Contenido
        </button>
        <button className={`admin-tab ${tab === 'ventas' ? 'active' : ''}`} onClick={() => setTab('ventas')}>
          <i className="fas fa-cash-register"></i> Registro de Ventas
        </button>
      </div>

      <div className="admin-tab-content">
        {tab === 'contenido' && renderContenido()}
        {tab === 'ventas' && renderVentas()}
      </div>
    </div>
  );
}

export default AdminControl;
