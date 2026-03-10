import { useState } from 'react';

const STATUSES = [
  { value: 'pendiente', label: 'Pendiente', icon: 'fa-clock', color: '#e8a862' },
  { value: 'fabricando', label: 'Fabricando', icon: 'fa-hammer', color: '#5b9bd5' },
  { value: 'enviado', label: 'Enviado', icon: 'fa-truck', color: '#8b5cf6' },
  { value: 'entregado', label: 'Entregado', icon: 'fa-check-circle', color: '#4caf50' },
];

// Mock: mismas órdenes que en AdminControl (después se conectará a la API)
const MOCK_ORDERS = [
  {
    id: 1, orderNumber: 'MK-20260310-001', status: 'fabricando',
    createdAt: '2026-03-10',
    items: [
      { productName: 'Anillo Ópalo Fuego', quantity: 1, unitPrice: 89000 },
      { productName: 'Collar Lapislázuli', quantity: 1, unitPrice: 125000 },
    ],
    shippingCost: 3990,
  },
  {
    id: 2, orderNumber: 'MK-20260308-001', status: 'enviado',
    createdAt: '2026-03-08',
    items: [
      { productName: 'Pulsera Turquesa', quantity: 2, unitPrice: 45000 },
    ],
    shippingCost: 5990,
  },
  {
    id: 3, orderNumber: 'MK-20260305-001', status: 'entregado',
    createdAt: '2026-03-05',
    items: [
      { productName: 'Aros Cuarzo Rosa', quantity: 1, unitPrice: 62000 },
      { productName: 'Anillo Amatista', quantity: 1, unitPrice: 78000 },
      { productName: 'Cadena Plata 925', quantity: 1, unitPrice: 35000 },
    ],
    shippingCost: 8500,
  },
  {
    id: 4, orderNumber: 'MK-20260310-002', status: 'pendiente',
    createdAt: '2026-03-10',
    items: [
      { productName: 'Collar Obsidiana', quantity: 1, unitPrice: 95000 },
    ],
    shippingCost: 7200,
  },
];

function TrackingModal({ show, onClose }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const found = MOCK_ORDERS.find(o => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase());
    if (found) {
      setResult(found);
    } else {
      setError('No se encontró una orden con ese número');
    }
  };

  const handleClose = () => {
    setOrderNumber('');
    setResult(null);
    setError('');
    onClose();
  };

  const formatPrice = (n) => '$' + n.toLocaleString('es-CL');
  const getStatusInfo = (status) => STATUSES.find(s => s.value === status) || STATUSES[0];

  const renderTimeline = (currentStatus) => {
    const currentIndex = STATUSES.findIndex(s => s.value === currentStatus);
    return (
      <div className="tracking-timeline">
        {STATUSES.map((s, i) => {
          const done = i <= currentIndex;
          return (
            <div key={s.value} className={`tracking-step ${done ? 'done' : ''}`}>
              <div className="tracking-step-dot" style={{ borderColor: done ? s.color : '#ccc', background: done ? s.color : '#fff' }}>
                <i className={`fas ${s.icon}`} style={{ color: done ? '#fff' : '#ccc' }}></i>
              </div>
              <span className="tracking-step-label" style={{ color: done ? s.color : '#aaa' }}>{s.label}</span>
              {i < STATUSES.length - 1 && (
                <div className="tracking-step-line" style={{ background: i < currentIndex ? STATUSES[i + 1].color : '#ddd' }}></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`contacto-modal ${show ? 'active' : ''}`}>
      <div className="contacto-modal-overlay" onClick={handleClose}></div>
      <div className="contacto-modal-content tracking-modal-content">
        <button className="contacto-modal-close" onClick={handleClose}>
          <i className="fas fa-times"></i>
        </button>

        <form className="tracking-header-row" onSubmit={handleSearch}>
          <h2 className="tracking-title">Seguimiento de orden</h2>
          <div className="tracking-input-row">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Ej: MK-20260310-001"
              required
            />
            <button type="submit">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>

        {error && (
          <div className="tracking-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {result && (() => {
          const st = getStatusInfo(result.status);
          const subtotal = result.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
          const shipping = result.shippingCost || 0;
          const iva = Math.round(subtotal * 0.19);
          const total = subtotal + iva + shipping;

          return (
            <div className="tracking-result">
              {/* Timeline de estados */}
              {renderTimeline(result.status)}

              {/* Info de la orden */}
              <div className="tracking-order-info">
                <div className="tracking-order-row">
                  <span>Orden</span>
                  <span className="tracking-order-number">{result.orderNumber}</span>
                </div>
                <div className="tracking-order-row">
                  <span>Fecha</span>
                  <span>{result.createdAt}</span>
                </div>
                <div className="tracking-order-row">
                  <span>Estado</span>
                  <span style={{ color: st.color, fontWeight: 600 }}>
                    <i className={`fas ${st.icon}`}></i> {st.label}
                  </span>
                </div>
              </div>

              {/* Productos */}
              <div className="tracking-products">
                <h4>Productos</h4>
                {result.items.map((item, i) => (
                  <div key={i} className="tracking-product-row">
                    <span>{item.productName} <small>x{item.quantity}</small></span>
                    <span>{formatPrice(item.quantity * item.unitPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="tracking-totals">
                <div className="tracking-total-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="tracking-total-row">
                  <span>IVA (19%)</span>
                  <span>{formatPrice(iva)}</span>
                </div>
                <div className="tracking-total-row">
                  <span>Envío</span>
                  <span>{shipping > 0 ? formatPrice(shipping) : 'Gratis'}</span>
                </div>
                <div className="tracking-total-row tracking-total-final">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default TrackingModal;
