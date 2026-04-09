import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Intro from '../components/Intro';
import Categories from '../components/Categories';
import UniquePieces from '../components/UniquePieces';
import About from '../components/About';
import Process from '../components/Process';
import Testimonials from '../components/Testimonials';
import Logros from '../components/Logros';
import Footer from '../components/Footer';

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const id = location.state.scrollTo;
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      window.history.replaceState({}, '');
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Intro />
        <Categories />
        <UniquePieces />
        <About />
        <Process />
        <Logros />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}

export default Home;
