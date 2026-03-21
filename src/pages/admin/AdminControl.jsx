import { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/api';
import AdminCard from '../../components/admin/AdminCard';

const STATUSES = [
  { value: 'pendiente', label: 'Pendiente', icon: 'fa-clock', color: '#e8a862' },
  { value: 'fabricando', label: 'Fabricando', icon: 'fa-hammer', color: '#5b9bd5' },
  { value: 'enviado', label: 'Enviado', icon: 'fa-truck', color: '#8b5cf6' },
  { value: 'entregado', label: 'Entregado', icon: 'fa-check-circle', color: '#4caf50' },
];

const MOCK_ORDERS = [
  {
    id: 1, orderNumber: 'MK-20260310-001', status: 'fabricando',
    createdAt: '2026-03-10',
    customer: { name: 'María González', email: 'maria@email.com', phone: '+56 9 1234 5678', rut: '12.345.678-9', address: 'Av. Providencia 1234, Depto 56', city: 'Santiago', region: 'Metropolitana' },
    shippingAddress: 'Av. Providencia 1234, Depto 56, Santiago',
    shippingCost: 3990,
    shippingNotes: 'Dejar con el conserje, piso 3',
    items: [
      { productName: 'Anillo Ópalo Fuego', quantity: 1, unitPrice: 89000 },
      { productName: 'Collar Lapislázuli', quantity: 1, unitPrice: 125000 },
    ],
  },
  {
    id: 2, orderNumber: 'MK-20260308-001', status: 'enviado',
    createdAt: '2026-03-08',
    customer: { name: 'Carlos Muñoz', email: 'carlos@email.com', phone: '+56 9 8765 4321', rut: '9.876.543-2', address: 'Los Leones 567', city: 'Viña del Mar', region: 'Valparaíso' },
    shippingAddress: 'Los Leones 567, Viña del Mar',
    shippingCost: 5990,
    shippingNotes: '',
    items: [
      { productName: 'Pulsera Turquesa', quantity: 2, unitPrice: 45000 },
    ],
  },
  {
    id: 3, orderNumber: 'MK-20260305-001', status: 'entregado',
    createdAt: '2026-03-05',
    customer: { name: 'Ana López', email: 'ana@email.com', phone: '+56 9 5555 1234', rut: '15.432.109-K', address: 'Calle Baquedano 89', city: 'Temuco', region: 'La Araucanía' },
    shippingAddress: 'Calle Baquedano 89, Of. 3, Temuco',
    shippingCost: 8500,
    shippingNotes: 'Llamar antes de entregar, preguntar por Juan',
    items: [
      { productName: 'Aros Cuarzo Rosa', quantity: 1, unitPrice: 62000 },
      { productName: 'Anillo Amatista', quantity: 1, unitPrice: 78000 },
      { productName: 'Cadena Plata 925', quantity: 1, unitPrice: 35000 },
    ],
  },
  {
    id: 4, orderNumber: 'MK-20260310-002', status: 'pendiente',
    createdAt: '2026-03-10',
    customer: { name: 'Pedro Soto', email: 'pedro@email.com', phone: '+56 9 3333 7777', rut: '18.765.432-1', address: 'Av. Libertad 456', city: 'Concepción', region: 'Biobío' },
    shippingAddress: 'Av. Libertad 456, Concepción',
    shippingCost: 7200,
    shippingNotes: 'Enviar por Starken, sucursal Concepción centro',
    items: [
      { productName: 'Collar Obsidiana', quantity: 1, unitPrice: 95000 },
    ],
  },
];

function AdminControl() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('contenido');
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(null);
  const [detailTab, setDetailTab] = useState('info');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusMenuOpen !== null && !e.target.closest('.ventas-status-wrapper')) {
        setStatusMenuOpen(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [statusMenuOpen]);

  useEffect(() => {
    getAdminStats()
      .then(data => setStats(data))
      .catch(err => setError(err.message || 'Error cargando estadísticas'))
      .finally(() => setLoading(false));
  }, []);

  const getBarColor = (pct) => {
    if (pct < 50) return '#4caf50';
    if (pct < 80) return '#e8a862';
    return '#e05555';
  };

  const renderContenido = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem' }}></i>
        </div>
      );
    }

    if (error) {
      return <div className="save-error"><i className="fas fa-exclamation-circle"></i> {error}</div>;
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

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setStatusMenuOpen(null);
  };

  const formatPrice = (n) => '$' + n.toLocaleString('es-CL');

  const getStatusInfo = (status) => STATUSES.find(s => s.value === status) || STATUSES[0];

  const renderVentas = () => {
    return (
      <div className="ventas-layout">
        {/* Columna izquierda: tabla de órdenes */}
        <div className="ventas-table-col">
          <AdminCard title="Órdenes">
            <div className="ventas-table-wrapper">
              <table className="ventas-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Orden</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const st = getStatusInfo(order.status);
                    const isSelected = selectedOrderId === order.id;

                    return (
                      <tr
                        key={order.id}
                        className={isSelected ? 'ventas-row-selected' : ''}
                        onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                      >
                        <td className="ventas-cell-date">{order.createdAt}</td>
                        <td className="ventas-cell-order">{order.orderNumber}</td>
                        <td className="ventas-cell-status" onClick={e => e.stopPropagation()}>
                          <div className="ventas-status-wrapper">
                            <button
                              className="ventas-status-btn"
                              style={{ background: 'none', color: st.color, borderColor: 'transparent' }}
                              onClick={() => setStatusMenuOpen(statusMenuOpen === order.id ? null : order.id)}
                            >
                              <i className={`fas ${st.icon}`}></i> {st.label}
                              <i className="fas fa-chevron-down ventas-status-chevron"></i>
                            </button>
                            {statusMenuOpen === order.id && (
                              <div className="ventas-status-menu">
                                {STATUSES.map(s => (
                                  <button
                                    key={s.value}
                                    className={`ventas-status-option ${order.status === s.value ? 'active' : ''}`}
                                    style={{ color: s.color }}
                                    onClick={() => handleStatusChange(order.id, s.value)}
                                  >
                                    <i className={`fas ${s.icon}`}></i> {s.label}
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
          {selectedOrder ? (() => {
            const subtotal = selectedOrder.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
            const shipping = selectedOrder.shippingCost || 0;
            const iva = Math.round(subtotal * 0.19);
            const total = subtotal + iva + shipping;
            const st = getStatusInfo(selectedOrder.status);

            return (
              <AdminCard title={
                <span className="ventas-detail-header">
                  <span>Orden {selectedOrder.orderNumber}</span>
                  <span className="ventas-detail-header-status" style={{ color: st.color }}>
                    <i className={`fas ${st.icon}`}></i> {st.label}
                  </span>
                </span>
              }>
                <div className="ventas-detail">
                  {/* Pestañas del detalle */}
                  <div className="ventas-detail-tabs">
                    <button className={`ventas-detail-tab ${detailTab === 'info' ? 'active' : ''}`} onClick={() => setDetailTab('info')}>
                      <i className="fas fa-user"></i> Cliente
                    </button>
                    <button className={`ventas-detail-tab ${detailTab === 'compra' ? 'active' : ''}`} onClick={() => setDetailTab('compra')}>
                      <i className="fas fa-shopping-bag"></i> Compra
                    </button>
                  </div>

                  {detailTab === 'info' && (
                    <>
                      <h4 className="ventas-detail-section-title"><i className="fas fa-user"></i> Cliente</h4>
                      <div className="ventas-detail-rows">
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Nombre</span>
                          <span className="ventas-detail-value">{selectedOrder.customer.name}</span>
                        </div>
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">RUT</span>
                          <span className="ventas-detail-value">{selectedOrder.customer.rut}</span>
                        </div>
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Email</span>
                          <span className="ventas-detail-value">{selectedOrder.customer.email}</span>
                        </div>
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Teléfono</span>
                          <span className="ventas-detail-value">{selectedOrder.customer.phone}</span>
                        </div>
                        <div className="ventas-detail-row">
                          <span className="ventas-detail-label">Dirección</span>
                          <span className="ventas-detail-value">
                            {selectedOrder.customer.address}<br />
                            {selectedOrder.customer.city}, {selectedOrder.customer.region}
                          </span>
                        </div>
                      </div>

                      <h4 className="ventas-detail-section-title"><i className="fas fa-map-marker-alt"></i> Dirección de despacho</h4>
                      <div className="ventas-detail-shipping-notes">
                        {selectedOrder.shippingAddress || <span className="ventas-detail-no-notes">Misma dirección del cliente</span>}
                      </div>

                      <h4 className="ventas-detail-section-title"><i className="fas fa-shipping-fast"></i> Detalles de envío</h4>
                      <div className="ventas-detail-shipping-notes">
                        {selectedOrder.shippingNotes || <span className="ventas-detail-no-notes">Sin indicaciones del cliente</span>}
                      </div>
                    </>
                  )}

                  {detailTab === 'compra' && (
                    <>
                      <div className="ventas-detail-items">
                        {selectedOrder.items.map((item, i) => (
                          <div key={i} className="ventas-detail-item">
                            <div className="ventas-detail-item-info">
                              <span className="ventas-detail-item-name">{item.productName}</span>
                              <span className="ventas-detail-item-qty">x{item.quantity}</span>
                            </div>
                            <span className="ventas-detail-item-price">{formatPrice(item.quantity * item.unitPrice)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="ventas-detail-totals">
                        <div className="ventas-detail-total-row">
                          <span>Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="ventas-detail-total-row">
                          <span>IVA (19%)</span>
                          <span>{formatPrice(iva)}</span>
                        </div>
                        <div className="ventas-detail-total-row">
                          <span>Envío</span>
                          <span>{shipping > 0 ? formatPrice(shipping) : 'Gratis'}</span>
                        </div>
                        <div className="ventas-detail-total-row ventas-detail-total-final">
                          <span>Total</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      </div>

                      <div className="ventas-detail-date">
                        <i className="fas fa-calendar-alt"></i> {selectedOrder.createdAt}
                      </div>
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
