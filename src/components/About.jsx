import { useContent } from '../context/ContentContext';

function About() {
  const { content } = useContent();
  const { title, image, paragraphs, features } = content.about;

  return (
    <section id="nosotros" className="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-image">
            <img src={image} alt="Joya de cobre artesanal" loading="lazy" />
          </div>
          <div className="about-content">
            <h2>{title}</h2>
            <div className="copper-divider"></div>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="about-features">
              {features.map((f, i) => (
                <div key={i} className="feature">
                  <i className={`fas ${f.icon}`}></i>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
