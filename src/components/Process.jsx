import { useContent } from '../context/ContentContext';

function Process() {
  const { content } = useContent();
  const { title, steps } = content.process;

  return (
    <section className="process">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <div className="copper-divider center"></div>
        <div className="process-grid">
          {steps.map((paso, index) => (
            <div key={index} className="process-step">
              <div className="step-icon">
                <i className={`fas ${paso.icon}`}></i>
              </div>
              <h4>{paso.title}</h4>
              <p>{paso.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Process;
