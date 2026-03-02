import { useRef, useEffect, useCallback } from 'react';

function AdminFormField({ label, type = 'text', value, onChange, placeholder, rows = 3, options, helpText }) {
  const id = `field-${typeof label === 'string' ? label.replace(/\s/g, '-').toLowerCase() : 'field'}`;
  const textareaRef = useRef(null);

  const autoResize = useCallback((el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  useEffect(() => {
    if (type === 'textarea' && textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [value, type, autoResize]);

  if (type === 'textarea') {
    return (
      <div className="admin-field">
        <label htmlFor={id}>{label}</label>
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => { onChange(e.target.value); autoResize(e.target); }}
          placeholder={placeholder}
          rows={rows}
          className="textarea-auto"
        />
        {helpText && <span className="field-help">{helpText}</span>}
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className="admin-field">
        <label htmlFor={id}>{label}</label>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {helpText && <span className="field-help">{helpText}</span>}
      </div>
    );
  }

  if (type === 'toggle') {
    return (
      <div className="admin-field admin-field-toggle">
        <label>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="toggle-slider"></span>
          {label}
        </label>
        {helpText && <span className="field-help">{helpText}</span>}
      </div>
    );
  }

  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
      />
      {helpText && <span className="field-help">{helpText}</span>}
    </div>
  );
}

export default AdminFormField;
