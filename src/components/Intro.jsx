import { useContent } from '../context/ContentContext';

function Intro() {
  const { content } = useContent();
  const { title, paragraph } = content.intro;

  return (
    <section className="intro">
      <div className="container">
        <div className="intro-content">
          <h3>{title}</h3>
          <div className="copper-divider center"></div>
          <p>{paragraph}</p>
        </div>
      </div>
    </section>
  );
}

export default Intro;
