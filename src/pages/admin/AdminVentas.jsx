import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdminOrders, getAdminOrderDetail, updateOrderAdminStatus } from '../../services/api';
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
  { value: 'en_proceso',   label: 'En proceso',    icon: 'fa-spinner',      color: '#5b9bd5', bg: 'rgba(91,155,213,0.1)' },
  { value: 'en_transito',  label: 'En tránsito',   icon: 'fa-truck',        color: '#9b59b6', bg: 'rgba(155,89,182,0.1)' },
  { value: 'entregado',    label: 'Entregado',     icon: 'fa-check-circle', color: '#4caf50', bg: 'rgba(76,175,80,0.1)' },
  { value: 'cancelado',    label: 'Cancelado',     icon: 'fa-ban',          color: '#888',    bg: 'rgba(136,136,136,0.1)' },
  { value: 'produciendo',  label: 'Produciendo',   icon: 'fa-cog',          color: '#e8a862', bg: 'rgba(232,168,98,0.1)' },
  { value: 'enviado',      label: 'Enviado',       icon: 'fa-truck',        color: '#9b59b6', bg: 'rgba(155,89,182,0.1)' },
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

function AdminVentas() {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPages, setOrdersPages] = useState(1);
  const ORDERS_LIMIT = 20;

  // Filtros
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterPayStatus, setFilterPayStatus] = useState('');
  const [filterAdminStatus, setFilterAdminStatus] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

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

  const loadOrders = useCallback((page = 1) => {
    setOrdersLoading(true);
    setOrdersError('');
    const params = {
      page,
      limit: ORDERS_LIMIT,
      ...(filterSearch && { search: filterSearch }),
      ...(filterDateFrom && { dateFrom: filterDateFrom }),
      ...(filterDateTo && { dateTo: filterDateTo }),
      ...(filterPayStatus && { status: filterPayStatus }),
      ...(filterAdminStatus && { adminStatus: filterAdminStatus }),
      sortBy,
      sortDir,
    };
    getAdminOrders(params)
      .then(data => {
        setOrders(data.orders || []);
        setOrdersTotal(data.total || 0);
        setOrdersPage(data.page || 1);
        setOrdersPages(data.pages || 1);
      })
      .catch(err => setOrdersError(err.message || 'Error cargando órdenes'))
      .finally(() => setOrdersLoading(false));
  }, [filterSearch, filterDateFrom, filterDateTo, filterPayStatus, filterAdminStatus, sortBy, sortDir]);

  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const handleFilterReset = () => {
    setFilterSearch('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterPayStatus('');
    setFilterAdminStatus('');
    setSortBy('date');
    setSortDir('desc');
  };

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

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <i className="fas fa-sort ventas-sort-icon ventas-sort-inactive"></i>;
    return <i className={`fas fa-sort-${sortDir === 'asc' ? 'up' : 'down'} ventas-sort-icon`}></i>;
  };

  const renderContent = () => {
    const hasFilters = filterSearch || filterDateFrom || filterDateTo || filterPayStatus || filterAdminStatus;

    if (ordersError) {
      return (
        <div className="save-error">
          <i className="fas fa-exclamation-circle"></i> {ordersError}
          <button className="ventas-reload-btn" onClick={() => loadOrders(ordersPage)} style={{ marginLeft: '1rem' }}>
            <i className="fas fa-redo"></i> Reintentar
          </button>
        </div>
      );
    }

    return (
      <div className="ventas-layout">
        {/* Columna izquierda: tabla de órdenes */}
        <div className="ventas-table-col">
          {/* Barra de filtros */}
          <div className="ventas-filters">
            <div className="ventas-filters-row">
              <div className="ventas-filter-search">
                <i className="fas fa-search ventas-filter-search-icon"></i>
                <input
                  type="text"
                  className="ventas-filter-input"
                  placeholder="Buscar orden, nombre o email..."
                  value={filterSearch}
                  onChange={e => setFilterSearch(e.target.value)}
                />
              </div>
              <div className="ventas-filter-dates">
                <input
                  type="date"
                  className="ventas-filter-date"
                  title="Desde"
                  value={filterDateFrom}
                  onChange={e => setFilterDateFrom(e.target.value)}
                />
                <span className="ventas-filter-date-sep">→</span>
                <input
                  type="date"
                  className="ventas-filter-date"
                  title="Hasta"
                  value={filterDateTo}
                  onChange={e => setFilterDateTo(e.target.value)}
                />
              </div>
              <select
                className="ventas-filter-select"
                value={filterPayStatus}
                onChange={e => setFilterPayStatus(e.target.value)}
              >
                <option value="">Pago: todos</option>
                {Object.entries(FLOW_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <select
                className="ventas-filter-select"
                value={filterAdminStatus}
                onChange={e => setFilterAdminStatus(e.target.value)}
              >
                <option value="">Estado: todos</option>
                {ADMIN_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {hasFilters && (
                <button className="ventas-filter-reset" onClick={handleFilterReset} title="Limpiar filtros">
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          <AdminCard title={
            <span className="ventas-table-title">
              <span>Órdenes{ordersTotal > 0 ? ` (${ordersTotal})` : ''}</span>
              {ordersLoading && <i className="fas fa-spinner fa-spin" style={{ fontSize: '0.9rem', color: '#888' }}></i>}
            </span>
          }>
            <div className="ventas-table-wrapper">
              <table className="ventas-table">
                <thead>
                  <tr>
                    <th className="ventas-th-sortable" onClick={() => handleSort('date')}>
                      Fecha <SortIcon col="date" />
                    </th>
                    <th className="ventas-th-sortable" onClick={() => handleSort('order')}>
                      Orden <SortIcon col="order" />
                    </th>
                    <th className="ventas-th-sortable" onClick={() => handleSort('total')}>
                      Total <SortIcon col="total" />
                    </th>
                    <th>Pago</th>
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
                        <td className="ventas-cell-payment">
                          {(() => {
                            const st = getStatusInfo(order.status);
                            return (
                              <span className="ventas-payment-badge" style={{ color: st.color, borderColor: st.color, background: st.color + '18' }}>
                                <i className={`fas ${st.icon}`}></i> {st.label}
                              </span>
                            );
                          })()}
                        </td>
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
              {!ordersLoading && orders.length === 0 && (
                <div className="ventas-empty">
                  <i className="fas fa-receipt"></i>
                  <p>{hasFilters ? 'Sin resultados para los filtros aplicados' : 'No hay órdenes registradas'}</p>
                </div>
              )}
            </div>

            {/* Paginación */}
            {ordersPages > 1 && (
              <div className="ventas-pagination">
                <button
                  className="ventas-page-btn"
                  disabled={ordersPage <= 1 || ordersLoading}
                  onClick={() => loadOrders(ordersPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="ventas-page-info">
                  Página {ordersPage} de {ordersPages}
                </span>
                <button
                  className="ventas-page-btn"
                  disabled={ordersPage >= ordersPages || ordersLoading}
                  onClick={() => loadOrders(ordersPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
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
            const pagoSt = getStatusInfo(selectedOrder.status);

            return (
              <AdminCard title={
                <span className="ventas-detail-header">
                  <span>{selectedOrder.commerce_order}</span>
                  <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="ventas-payment-badge ventas-payment-badge--lg" style={{ color: pagoSt.color, borderColor: pagoSt.color, background: pagoSt.color + '18' }}>
                      <i className={`fas ${pagoSt.icon}`}></i> {pagoSt.label}
                    </span>
                    <span className="ventas-detail-header-status" style={{ color: adminSt.color }}>
                      <i className={`fas ${adminSt.icon}`}></i> {adminSt.label}
                    </span>
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

                      {(selectedOrder.shipping_commune || selectedOrder.shipping_region) && (
                        <>
                          <h4 className="ventas-detail-section-title"><i className="fas fa-truck"></i> Despacho</h4>
                          <div className="ventas-detail-rows">
                            {selectedOrder.shipping_region && (
                              <div className="ventas-detail-row">
                                <span className="ventas-detail-label">Región</span>
                                <span className="ventas-detail-value">{selectedOrder.shipping_region}</span>
                              </div>
                            )}
                            {selectedOrder.shipping_commune && (
                              <div className="ventas-detail-row">
                                <span className="ventas-detail-label">Comuna</span>
                                <span className="ventas-detail-value">{selectedOrder.shipping_commune}</span>
                              </div>
                            )}
                            {selectedOrder.shipping_cost > 0 && (
                              <div className="ventas-detail-row">
                                <span className="ventas-detail-label">Costo despacho</span>
                                <span className="ventas-detail-value">{formatPrice(selectedOrder.shipping_cost)}</span>
                              </div>
                            )}
                            {selectedOrder.document_type && (
                              <div className="ventas-detail-row">
                                <span className="ventas-detail-label">Documento</span>
                                <span className="ventas-detail-value" style={{ textTransform: 'capitalize' }}>{selectedOrder.document_type}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {selectedOrder.document_type === 'factura' && selectedOrder.factura_rut && (
                        <>
                          <h4 className="ventas-detail-section-title"><i className="fas fa-file-invoice-dollar"></i> Datos de Factura</h4>
                          <div className="ventas-detail-rows">
                            <div className="ventas-detail-row">
                              <span className="ventas-detail-label">RUT</span>
                              <span className="ventas-detail-value" style={{ fontFamily: 'monospace' }}>{selectedOrder.factura_rut}</span>
                            </div>
                            <div className="ventas-detail-row">
                              <span className="ventas-detail-label">Razón Social</span>
                              <span className="ventas-detail-value">{selectedOrder.factura_razon_social}</span>
                            </div>
                            <div className="ventas-detail-row">
                              <span className="ventas-detail-label">Giro</span>
                              <span className="ventas-detail-value">{selectedOrder.factura_giro}</span>
                            </div>
                            <div className="ventas-detail-row">
                              <span className="ventas-detail-label">Dirección</span>
                              <span className="ventas-detail-value">{selectedOrder.factura_direccion}</span>
                            </div>
                            <div className="ventas-detail-row">
                              <span className="ventas-detail-label">Comuna</span>
                              <span className="ventas-detail-value">{selectedOrder.factura_comuna}</span>
                            </div>
                          </div>
                        </>
                      )}

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
                        {selectedOrder.shipping_cost > 0 && (
                          <div className="ventas-detail-total-row">
                            <span><i className="fas fa-truck" style={{ marginRight: 4 }}></i>Despacho ({selectedOrder.shipping_commune})</span>
                            <span>{formatPrice(selectedOrder.shipping_cost)}</span>
                          </div>
                        )}
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
      <h1 className="admin-page-title">Registro de Ventas</h1>
      <p className="admin-page-subtitle">Gestión de órdenes y pagos</p>
      {renderContent()}
    </div>
  );
}

export default AdminVentas;
