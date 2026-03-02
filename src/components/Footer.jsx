import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

function Footer() {
  const { content } = useContent();
  const footer = content.footer;
  const categories = content.categories.items;

  const firstCol = categories.slice(0, 5);
  const secondCol = categories.slice(5, 10);

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

          {/* Categorías */}
          <div className="footer-section">
            <h4>Colecciones</h4>
            <ul>
              {firstCol.map((cat) => (
                <li key={cat.slug}><Link to={`/productos?cat=${cat.slug}`}>{cat.nombre}</Link></li>
              ))}
            </ul>
          </div>

          {/* Más categorías */}
          <div className="footer-section">
            <h4>Más Joyas</h4>
            <ul>
              {secondCol.map((cat) => (
                <li key={cat.slug}><Link to={`/productos?cat=${cat.slug}`}>{cat.nombre}</Link></li>
              ))}
            </ul>
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
                <i className="fab fa-whatsapp"></i>
                <a href={`https://wa.me/${footer.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
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
