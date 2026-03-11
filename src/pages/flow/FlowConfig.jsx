import { useState, useEffect } from 'react';
import { getFlowConfig, saveFlowConfig } from '../../services/flowApi';

export default function FlowConfig() {
  const [config, setConfig] = useState(getFlowConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getFlowConfig();
    setConfig(stored);
  }, []);

  function handleChange(field, value) {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveFlowConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const hasKeys = config.apiKey && config.secretKey;

  return (
    <div className="flow-config">
      <h3 className="flow-config__title">Configuracion de Credenciales</h3>

      <div className="flow-config__row">
        <div className="flow-config__field">
          <label className="flow-config__label">API Key</label>
          <input
            type="text"
            className="flow-config__input"
            placeholder="Tu ApiKey de Flow"
            value={config.apiKey}
            onChange={(e) => handleChange('apiKey', e.target.value)}
          />
        </div>
        <div className="flow-config__field">
          <label className="flow-config__label">Entorno</label>
          <select
            className="flow-config__select"
            value={config.environment}
            onChange={(e) => handleChange('environment', e.target.value)}
          >
            <option value="sandbox">Sandbox</option>
            <option value="production">Produccion</option>
          </select>
        </div>
      </div>

      <div className="flow-config__row">
        <div className="flow-config__field">
          <label className="flow-config__label">Secret Key</label>
          <input
            type="password"
            className="flow-config__input"
            placeholder="Tu SecretKey de Flow"
            value={config.secretKey}
            onChange={(e) => handleChange('secretKey', e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="flow-btn flow-btn--primary" onClick={handleSave}>
          Guardar credenciales
        </button>
        {saved && (
          <span style={{ color: '#22c55e', fontSize: '0.82rem' }}>
            Guardado correctamente
          </span>
        )}
      </div>

      <div className="flow-config__status">
        <span className={`flow-config__dot ${hasKeys ? 'flow-config__dot--ok' : 'flow-config__dot--err'}`} />
        <span>{hasKeys ? 'Credenciales configuradas' : 'Sin credenciales'}</span>
      </div>
    </div>
  );
}
