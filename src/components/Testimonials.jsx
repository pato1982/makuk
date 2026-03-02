import { useContent } from '../context/ContentContext';

function Testimonials() {
  const { content } = useContent();
  const { title, items } = content.testimonials;

  // Duplicamos los testimonios para el loop infinito
  const testimoniosDuplicados = [...items, ...items];

  return (
    <section className="testimonials">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="copper-divider center"></div>
        <div className="testimonials-carousel">
          <div className="testimonials-track">
            {testimoniosDuplicados.map((testimonio, index) => (
              <div key={index} className="testimonial-card">
                <div className="quote-icon">
                  <i className="fas fa-quote-left"></i>
                </div>
                <p>"{testimonio.texto}"</p>
                <div className="testimonial-author">
                  <span className="name">{testimonio.nombre}</span>
                  <span className="location">{testimonio.ubicacion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
