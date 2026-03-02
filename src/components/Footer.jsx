import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

function Footer() {
  const { content } = useContent();
  const footer = content.footer;

  return (
    <footer id="contacto" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Logo y descripción */}
          <div className="footer-section">
            <h3 className="footer-logo">{footer.logo}</h3>
            <p>{footer.description}</p>
            <div className="social-links">
              <a href={footer.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href={footer.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Colecciones y Más Joyas */}
          <div className="footer-section footer-links-col">
            <h4><Link to="/productos">Colecciones</Link></h4>
            <h4><Link to="/productos?cat=unicas">Más Joyas</Link></h4>
          </div>

          {/* Contacto */}
          <div className="footer-section">
            <h4>Contacto</h4>
            <div className="contact-info">
              <p>
                <i className="fas fa-envelope"></i>
                <a href={`mailto:${footer.email}`}>{footer.email}</a>
              </p>
              <p>
                <i className="fas fa-phone"></i>
                <a href={`tel:${footer.whatsappDisplay}`}>
                  {footer.whatsappDisplay}
                </a>
              </p>
              <p>
                <i className="fas fa-map-marker-alt"></i>
                {footer.address}
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            {footer.copyright}
            {' '}| Hecho con <i className="fas fa-heart"></i>
          </p>
          <span className="credits">{footer.credits}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
