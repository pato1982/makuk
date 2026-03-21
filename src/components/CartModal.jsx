import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartModal() {
  const navigate = useNavigate();
  const {
    carrito,
    showCartModal,
    setShowCartModal,
    eliminarDelCarrito,
    vaciarCarrito,
    formatearPrecio,
    calcularDesglose,
    getTotales
  } = useCart();

  if (!showCartModal) return null;

  const { totalCantidad, totalNeto, totalIva, totalTotal } = getTotales();

  const handleVaciar = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      vaciarCarrito();
    }
  };

  return (
    <div className={`carrito-modal ${showCartModal ? 'active' : ''}`}>
      <div className="carrito-modal-overlay" onClick={() => setShowCartModal(false)}></div>
      <div className="carrito-modal-content">
        <button className="carrito-modal-close" onClick={() => setShowCartModal(false)}>
          <i className="fas fa-times"></i>
        </button>

        <div className="carrito-header">
          <h2>Carrito de Compras</h2>
          <div className="copper-divider center"></div>
        </div>

        <div className="carrito-body">
          {carrito.length === 0 ? (
            <div className="carrito-vacio">
              <i className="fas fa-shopping-cart"></i>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="carrito-tabla-container visible">
              <table className="carrito-tabla">
                <thead>
                  <tr>
                    <th className="col-producto">Producto</th>
                    <th className="col-cantidad">Cant.</th>
                    <th className="col-neto">Neto</th>
                    <th className="col-iva">IVA (19%)</th>
                    <th className="col-total">Total</th>
                    <th className="col-acciones"></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item, index) => {
                    const desglose = calcularDesglose(item.precioTotal, item.cantidad);
                    return (
                      <tr key={index}>
                        <td className="producto-nombre">{item.nombre}</td>
                        <td className="producto-cantidad">{item.cantidad}</td>
                        <td className="producto-neto">{formatearPrecio(desglose.neto)}</td>
                        <td className="producto-iva">{formatearPrecio(desglose.iva)}</td>
                        <td className="producto-total">{formatearPrecio(desglose.total)}</td>
                        <td className="producto-acciones">
                          <button
                            className="btn-eliminar-item"
                            onClick={() => eliminarDelCarrito(item.nombre)}
                            aria-label="Eliminar"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="carrito-totales">
                    <td className="totales-label">TOTAL</td>
                    <td className="totales-cantidad">{totalCantidad}</td>
                    <td className="totales-neto">{formatearPrecio(totalNeto)}</td>
                    <td className="totales-iva">{formatearPrecio(totalIva)}</td>
                    <td className="totales-total">{formatearPrecio(totalTotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {carrito.length > 0 && (
          <div className="carrito-footer">
            <button className="btn-vaciar-carrito" onClick={handleVaciar}>
              <i className="fas fa-trash-alt"></i> Vaciar carrito
            </button>
            <button className="btn-finalizar-compra" onClick={() => { setShowCartModal(false); navigate('/checkout'); }}>
              Finalizar compra <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartModal;
