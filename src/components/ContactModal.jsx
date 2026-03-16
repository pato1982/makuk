import { useState } from 'react';
import { sendContactForm } from '../services/api';

function ContactModal({ show, onClose }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', correo: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');

    try {
      await sendContactForm(form);
      setEnviado(true);
      setTimeout(() => {
        setEnviado(false);
        setForm({ nombre: '', telefono: '', correo: '', mensaje: '' });
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al enviar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleOverlayClick = () => {
    if (!enviado && !enviando) onClose();
  };

  return (
    <div className={`contacto-modal ${show ? 'active' : ''}`}>
      <div className="contacto-modal-overlay" onClick={handleOverlayClick}></div>
      <div className="contacto-modal-content">
        <button className="contacto-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        {enviado ? (
          <div className="contacto-enviado">
            <i className="fas fa-check-circle"></i>
            <h3>Mensaje enviado</h3>
            <p>Nos pondremos en contacto contigo pronto</p>
          </div>
        ) : (
          <>
            <div className="contacto-modal-header">
              <h2>Contáctanos</h2>
              <div className="copper-divider center"></div>
            </div>

            <form className="contacto-form" onSubmit={handleSubmit}>
              {error && <p className="contacto-error" style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
              <div className="contacto-campo">
                <label htmlFor="contact-nombre">Nombre</label>
                <input
                  id="contact-nombre"
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="contacto-campo">
                <label htmlFor="contact-telefono">Teléfono</label>
                <input
                  id="contact-telefono"
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Tu teléfono"
                  required
                />
              </div>
              <div className="contacto-campo">
                <label htmlFor="contact-correo">Correo</label>
                <input
                  id="contact-correo"
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="Tu correo electrónico"
                  required
                />
              </div>
              <div className="contacto-campo">
                <label htmlFor="contact-mensaje">Consulta</label>
                <textarea
                  id="contact-mensaje"
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  placeholder="Escribe tu consulta..."
                  rows="4"
                  required
                ></textarea>
              </div>
              <button type="submit" className="contacto-btn-enviar" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar consulta'} <i className={`fas ${enviando ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ContactModal;
