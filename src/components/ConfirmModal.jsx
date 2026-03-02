import { useCart } from '../context/CartContext';

function ConfirmModal() {
  const { showConfirmModal, setShowConfirmModal, setShowCartModal } = useCart();

  if (!showConfirmModal) return null;

  const handleVerCarrito = () => {
    setShowConfirmModal(false);
    setShowCartModal(true);
  };

  return (
    <div className={`carrito-confirm-modal ${showConfirmModal ? 'active' : ''}`}>
      <div className="carrito-confirm-overlay" onClick={() => setShowConfirmModal(false)}></div>
      <div className="carrito-confirm-content">
        <div className="carrito-icono">
          <i className="fas fa-check-circle"></i>
        </div>
        <h3>Producto agregado</h3>
        <p>El producto se encuentra disponible en el carrito de compras</p>
        <div className="carrito-modal-botones">
          <button className="btn-ir-carrito" onClick={handleVerCarrito}>
            Ir a carrito de compra
          </button>
          <button className="btn-seguir-comprando" onClick={() => setShowConfirmModal(false)}>
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
