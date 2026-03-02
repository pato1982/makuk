import { useState, useEffect } from 'react';
import { useContent } from '../context/ContentContext';

function Hero() {
  const [opacity, setOpacity] = useState(1);
  const { content } = useContent();
  const { title, subtitle, ctaText } = content.hero;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.95;
      const newOpacity = Math.max(0, 1 - (scrollY / heroHeight) * 0.5);
      setOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCategories = () => {
    const element = document.getElementById('categorias');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="inicio" className="hero" style={{ opacity }}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <button className="btn-hero" onClick={scrollToCategories}>
          {ctaText}
        </button>
      </div>
    </section>
  );
}

export default Hero;
