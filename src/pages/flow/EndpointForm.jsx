import { useState } from 'react';
import FlowRequestResponse from './FlowRequestResponse';

/**
 * Componente genérico para probar un endpoint de Flow.
 * @param {object} props
 * @param {string} props.method - 'GET' o 'POST'
 * @param {string} props.path - Ej: '/payment/create'
 * @param {string} props.description - Descripción del endpoint
 * @param {Array} props.fields - [{ name, label, required, type, placeholder, options }]
 * @param {function} props.onSubmit - Función que ejecuta la llamada y retorna el resultado
 * @param {function} [props.onLog] - Callback para registrar la llamada en el monitor
 */
export default function EndpointForm({ method, path, description, fields, onSubmit, onLog }) {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await onSubmit(values);
      setResult(res);
      if (onLog) {
        onLog({
          method,
          endpoint: path,
          ...res,
        });
      }
    } catch (err) {
      const errResult = { request: null, ok: false, status: 0, data: null, raw: err.message, duration: 0 };
      setResult(errResult);
      if (onLog) {
        onLog({ method, endpoint: path, ...errResult });
      }
    }
    setLoading(false);
  }

  function handleClear() {
    setValues({});
    setResult(null);
  }

  return (
    <div className="flow-endpoint">
      <div className="flow-endpoint__header">
        <span className={`flow-endpoint__method flow-endpoint__method--${method.toLowerCase()}`}>
          {method}
        </span>
        <span className="flow-endpoint__path">{path}</span>
      </div>

      {description && <div className="flow-endpoint__desc">{description}</div>}

      <form className="flow-endpoint__body" onSubmit={handleSubmit}>
        <div className="flow-endpoint__fields">
          {fields.map((field) => (
            <div key={field.name} className={`flow-field ${field.full ? 'flow-field--full' : ''}`}>
              <label className="flow-field__label">
                {field.label || field.name}
                {field.required && <span className="flow-field__req">requerido</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className="flow-field__textarea"
                  placeholder={field.placeholder || ''}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  rows={3}
                />
              ) : field.type === 'select' ? (
                <select
                  className="flow-field__input"
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  className="flow-field__input"
                  placeholder={field.placeholder || ''}
                  value={values[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="flow-btn flow-btn--primary" disabled={loading}>
            {loading ? <><span className="flow-spinner" /> Enviando...</> : 'Enviar request'}
          </button>
          <button type="button" className="flow-btn flow-btn--secondary" onClick={handleClear}>
            Limpiar
          </button>
        </div>
      </form>

      <div style={{ padding: '0 20px 20px' }}>
        <FlowRequestResponse result={result} />
      </div>
    </div>
  );
}
