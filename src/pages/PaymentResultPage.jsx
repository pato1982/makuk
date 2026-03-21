import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/checkout.css';

function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const commerceOrder = searchParams.get('order');
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      setError(
        errorParam === 'no_token' ? 'No se recibió el token de pago' :
        errorParam === 'order_not_found' ? 'Orden no encontrada' :
        'Error al procesar el pago'
      );
      setLoading(false);
      return;
    }

    if (!commerceOrder) {
      setError('No se encontró información de la orden');
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${commerceOrder}`)
      .then(res => {
        if (!res.ok) throw new Error('Orden no encontrada');
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [commerceOrder, errorParam]);

  const formatearPrecio = (valor) => {
    return '$' + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="payment-result loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Consultando estado del pago...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="payment-result error">
            <div className="result-icon error">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1>Error en el pago</h1>
            <p>{error}</p>
            <button className="checkout-btn secondary" onClick={() => navigate('/')}>
              <i className="fas fa-home"></i> Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = order.status === 'paid';
  const isRejected = order.status === 'rejected';
  const isCancelled = order.status === 'cancelled';
  const isPending = order.status === 'pending' || order.status === 'processing';

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className={`payment-result ${isPaid ? 'success' : isRejected || isCancelled ? 'error' : 'pending'}`}>
          {/* Ícono de estado */}
          <div className={`result-icon ${isPaid ? 'success' : isRejected || isCancelled ? 'error' : 'pending'}`}>
            <i className={`fas ${
              isPaid ? 'fa-check-circle' :
              isRejected ? 'fa-times-circle' :
              isCancelled ? 'fa-ban' :
              'fa-clock'
            }`}></i>
          </div>

          {/* Mensaje principal */}
          <h1>
            {isPaid && 'Pago Exitoso'}
            {isRejected && 'Pago Rechazado'}
            {isCancelled && 'Pago Cancelado'}
            {isPending && 'Pago Pendiente'}
          </h1>

          <p className="result-subtitle">
            {isPaid && 'Tu compra ha sido procesada correctamente. Recibirás un email de confirmación.'}
            {isRejected && 'El pago fue rechazado por el medio de pago. Puedes intentar nuevamente.'}
            {isCancelled && 'El pago fue cancelado. Si fue un error, puedes realizar una nueva compra.'}
            {isPending && 'Tu pago está siendo procesado. Recibirás un email cuando se confirme.'}
          </p>

          {/* Detalle de la orden */}
          <div className="result-details">
            <h2>Detalle de la Orden</h2>
            <div className="result-info-grid">
              <div className="result-info-item">
                <span className="label">Orden</span>
                <span className="value">{order.commerce_order}</span>
              </div>
              <div className="result-info-item">
                <span className="label">Estado</span>
                <span className={`value status-badge ${order.status}`}>
                  {isPaid ? 'Pagado' : isRejected ? 'Rechazado' : isCancelled ? 'Cancelado' : 'Pendiente'}
                </span>
              </div>
              <div className="result-info-item">
                <span className="label">Total</span>
                <span className="value">{formatearPrecio(order.total)}</span>
              </div>
              {order.payment_method && (
                <div className="result-info-item">
                  <span className="label">Medio de pago</span>
                  <span className="value">{order.payment_method}</span>
                </div>
              )}
              <div className="result-info-item">
                <span className="label">Email</span>
                <span className="value">{order.customer_email}</span>
              </div>
              {order.paid_at && (
                <div className="result-info-item">
                  <span className="label">Fecha de pago</span>
                  <span className="value">{new Date(order.paid_at).toLocaleString('es-CL')}</span>
                </div>
              )}
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="result-items">
                <h3>Productos</h3>
                {order.items.map((item, i) => (
                  <div key={i} className="result-item-row">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span>{formatearPrecio(item.line_total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="result-actions">
            <button className="checkout-btn primary" onClick={() => navigate('/')}>
              <i className="fas fa-home"></i> Volver al inicio
            </button>
            <button className="checkout-btn secondary" onClick={() => navigate('/productos')}>
              <i className="fas fa-shopping-bag"></i> Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentResultPage;
