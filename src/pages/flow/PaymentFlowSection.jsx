import { useState } from 'react';
import { flowPost, flowGet } from '../../services/flowApi';
import FlowRequestResponse from './FlowRequestResponse';

const PHASES = [
  {
    num: 1,
    label: 'Creación de orden',
    sublabel: 'POST /payment/create',
    description: 'El comercio genera la orden en Flow y obtiene la URL de pago + token para redirigir al cliente.',
  },
  {
    num: 2,
    label: 'Pago de la orden',
    sublabel: 'GET /payment/getStatus',
    description: 'Flow notifica el pago via POST a tu urlConfirmation. El comercio verifica el estado con el token recibido.',
  },
  {
    num: 3,
    label: 'Finalización',
    sublabel: 'GET /payment/getStatus',
    description: 'Flow redirige al cliente a tu urlReturn. El comercio verifica el estado final para mostrar la página de resultado.',
  },
];

const CREATE_FIELDS = [
  { name: 'commerceOrder', label: 'commerceOrder', required: true, placeholder: 'ej: order-001' },
  { name: 'subject', label: 'subject', required: true, placeholder: 'ej: Compra producto X' },
  { name: 'amount', label: 'amount', required: true, type: 'number', placeholder: 'ej: 5000' },
  { name: 'email', label: 'email', required: true, type: 'email', placeholder: 'ej: cliente@email.com' },
  { name: 'currency', label: 'currency', placeholder: 'CLP' },
  {
    name: 'paymentMethod', label: 'paymentMethod', type: 'select', options: [
      { value: '9', label: '9 — Todos los medios' },
      { value: '1', label: '1 — Webpay' },
      { value: '2', label: '2 — Servipag' },
      { value: '3', label: '3 — Multicaja' },
      { value: '5', label: '5 — Onepay' },
      { value: '26', label: '26 — Mach' },
    ],
  },
  { name: 'urlConfirmation', label: 'urlConfirmation', required: true, full: true, placeholder: 'https://tu-sitio.com/flow/confirm' },
  { name: 'urlReturn', label: 'urlReturn', required: true, full: true, placeholder: 'https://tu-sitio.com/flow/return' },
];

function PhaseHeader({ phase, currentPhase, onEdit }) {
  const p = PHASES[phase - 1];
  const isDone = currentPhase > phase;
  const isActive = currentPhase === phase;
  const isLocked = currentPhase < phase;

  return (
    <div className={`flow-pf__phase-header ${isActive ? 'flow-pf__phase-header--active' : ''} ${isDone ? 'flow-pf__phase-header--done' : ''} ${isLocked ? 'flow-pf__phase-header--locked' : ''}`}>
      <div className={`flow-pf__phase-num ${isActive ? 'flow-pf__phase-num--active' : ''} ${isDone ? 'flow-pf__phase-num--done' : ''}`}>
        {isDone ? '✓' : phase}
      </div>
      <div className="flow-pf__phase-info">
        <div className="flow-pf__phase-title">{p.label}</div>
        <div className="flow-pf__phase-endpoint">{p.sublabel}</div>
      </div>
      {isDone && onEdit && (
        <button className="flow-btn flow-btn--secondary flow-btn--sm" onClick={onEdit}>
          Editar
        </button>
      )}
      {isLocked && (
        <span className="flow-pf__locked-badge">Requiere token</span>
      )}
    </div>
  );
}

export default function PaymentFlowSection({ onLog }) {
  const [currentPhase, setCurrentPhase] = useState(1);

  // Phase 1
  const [createValues, setCreateValues] = useState({ currency: 'CLP' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState(null);

  // Extracted from Phase 1 response
  const [token, setToken] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [flowOrder, setFlowOrder] = useState('');

  // Phase 2
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);

  // Phase 3
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnResult, setReturnResult] = useState(null);

  function handleCreateChange(name, value) {
    setCreateValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateResult(null);
    setToken('');
    setCheckoutUrl('');
    setFlowOrder('');
    setConfirmResult(null);
    setReturnResult(null);
    try {
      const res = await flowPost('/payment/create', createValues);
      setCreateResult(res);
      if (res.ok && res.data) {
        const t = res.data.token || '';
        const u = res.data.url || '';
        const fo = res.data.flowOrder || '';
        setToken(t);
        setFlowOrder(String(fo));
        if (u && t) {
          setCheckoutUrl(`${u}?token=${t}`);
        } else if (u) {
          setCheckoutUrl(u);
        }
        if (t) setCurrentPhase(2);
      }
      if (onLog) onLog({ method: 'POST', endpoint: '/payment/create', ...res });
    } catch (err) {
      const r = { request: null, ok: false, status: 0, data: null, raw: err.message, duration: 0 };
      setCreateResult(r);
      if (onLog) onLog({ method: 'POST', endpoint: '/payment/create', ...r });
    }
    setCreateLoading(false);
  }

  async function handleGetStatus(phaseNum) {
    const setLoading = phaseNum === 2 ? setConfirmLoading : setReturnLoading;
    const setResult = phaseNum === 2 ? setConfirmResult : setReturnResult;

    setLoading(true);
    setResult(null);
    try {
      const res = await flowGet('/payment/getStatus', { token });
      setResult(res);
      if (res.ok && phaseNum === 2) setCurrentPhase(3);
      if (onLog) onLog({ method: 'GET', endpoint: '/payment/getStatus', ...res });
    } catch (err) {
      const r = { request: null, ok: false, status: 0, data: null, raw: err.message, duration: 0 };
      setResult(r);
      if (onLog) onLog({ method: 'GET', endpoint: '/payment/getStatus', ...r });
    }
    setLoading(false);
  }

  function handleReset() {
    setCurrentPhase(1);
    setCreateValues({ currency: 'CLP' });
    setCreateResult(null);
    setToken('');
    setCheckoutUrl('');
    setFlowOrder('');
    setConfirmResult(null);
    setReturnResult(null);
  }

  const paymentStatusCode = (confirmResult || returnResult)?.data?.status;

  return (
    <div className="flow-pf">
      {/* Stepper */}
      <div className="flow-pf__stepper">
        {PHASES.map((p) => {
          const isDone = currentPhase > p.num;
          const isActive = currentPhase === p.num;
          return (
            <div key={p.num} className="flow-pf__step-wrap">
              <div className={`flow-pf__step ${isActive ? 'flow-pf__step--active' : ''} ${isDone ? 'flow-pf__step--done' : ''}`}>
                <div className={`flow-pf__step-circle ${isActive ? 'flow-pf__step-circle--active' : ''} ${isDone ? 'flow-pf__step-circle--done' : ''}`}>
                  {isDone ? '✓' : p.num}
                </div>
                <div>
                  <div className="flow-pf__step-name">{p.label}</div>
                  <div className="flow-pf__step-sub">{p.sublabel}</div>
                </div>
              </div>
              {p.num < PHASES.length && <div className={`flow-pf__step-line ${isDone ? 'flow-pf__step-line--done' : ''}`} />}
            </div>
          );
        })}
        {currentPhase > 1 && (
          <button className="flow-btn flow-btn--secondary flow-btn--sm" onClick={handleReset} style={{ marginLeft: 'auto' }}>
            Reiniciar
          </button>
        )}
      </div>

      {/* ── FASE 1: payment/create ── */}
      <div className={`flow-pf__card ${currentPhase === 1 ? 'flow-pf__card--active' : ''}`}>
        <PhaseHeader
          phase={1}
          currentPhase={currentPhase}
          onEdit={() => { setCurrentPhase(1); setCreateResult(null); setToken(''); setConfirmResult(null); setReturnResult(null); }}
        />

        {(currentPhase === 1 || createResult) && (
          <div className="flow-pf__body">
            <p className="flow-pf__desc">{PHASES[0].description}</p>

            {currentPhase === 1 && (
              <form onSubmit={handleCreateSubmit}>
                <div className="flow-pf__fields">
                  {CREATE_FIELDS.map((field) => (
                    <div key={field.name} className={`flow-field ${field.full ? 'flow-field--full' : ''}`}>
                      <label className="flow-field__label">
                        {field.label}
                        {field.required && <span className="flow-field__req">requerido</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          className="flow-field__input"
                          value={createValues[field.name] || ''}
                          onChange={(e) => handleCreateChange(field.name, e.target.value)}
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
                          value={createValues[field.name] || ''}
                          onChange={(e) => handleCreateChange(field.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <button type="submit" className="flow-btn flow-btn--primary" disabled={createLoading}>
                  {createLoading ? <><span className="flow-spinner" /> Creando orden...</> : 'Crear orden de pago'}
                </button>
              </form>
            )}

            {createResult && <FlowRequestResponse result={createResult} />}

            {/* Token + Checkout URL */}
            {token && (
              <div className="flow-pf__token-block">
                <div className="flow-pf__token-row">
                  <span className="flow-pf__token-label">Token</span>
                  <code className="flow-pf__token-value">{token}</code>
                </div>
                {flowOrder && (
                  <div className="flow-pf__token-row">
                    <span className="flow-pf__token-label">Flow Order</span>
                    <code className="flow-pf__token-value">{flowOrder}</code>
                  </div>
                )}
                {checkoutUrl && (
                  <div className="flow-pf__token-row">
                    <span className="flow-pf__token-label">Checkout URL</span>
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flow-pf__checkout-link"
                    >
                      {checkoutUrl} ↗
                    </a>
                  </div>
                )}
                <div className="flow-pf__token-hint">
                  Abre el Checkout URL en el navegador para completar el pago en el sandbox de Flow.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FASE 2: urlConfirmation → getStatus ── */}
      <div className={`flow-pf__card ${currentPhase === 2 ? 'flow-pf__card--active' : ''} ${currentPhase < 2 ? 'flow-pf__card--locked' : ''}`}>
        <PhaseHeader phase={2} currentPhase={currentPhase} />

        {currentPhase >= 2 && (
          <div className="flow-pf__body">
            <p className="flow-pf__desc">{PHASES[1].description}</p>

            <div className="flow-pf__info-box">
              <span className="flow-pf__info-icon">&#9432;</span>
              <span>
                Flow enviará un <strong>POST</strong> a tu <code>urlConfirmation</code> con el token.
                Simula aquí la verificación que tu backend debe hacer al recibirlo.
              </span>
            </div>

            <div className="flow-pf__token-row flow-pf__token-row--inline" style={{ marginBottom: '16px' }}>
              <span className="flow-pf__token-label">Token</span>
              <code className="flow-pf__token-value">{token}</code>
            </div>

            {currentPhase === 2 && (
              <button
                className="flow-btn flow-btn--primary"
                onClick={() => handleGetStatus(2)}
                disabled={confirmLoading}
              >
                {confirmLoading ? <><span className="flow-spinner" /> Verificando...</> : 'Verificar estado (urlConfirmation)'}
              </button>
            )}

            {confirmResult && <FlowRequestResponse result={confirmResult} />}

            {confirmResult?.ok && currentPhase === 3 && (
              <div className="flow-pf__status-badge flow-pf__status-badge--ok">
                ✓ Confirmación registrada — avanzando a Finalización
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FASE 3: urlReturn → getStatus ── */}
      <div className={`flow-pf__card ${currentPhase === 3 ? 'flow-pf__card--active' : ''} ${currentPhase < 3 ? 'flow-pf__card--locked' : ''}`}>
        <PhaseHeader phase={3} currentPhase={currentPhase} />

        {currentPhase >= 3 && (
          <div className="flow-pf__body">
            <p className="flow-pf__desc">{PHASES[2].description}</p>

            <div className="flow-pf__info-box">
              <span className="flow-pf__info-icon">&#9432;</span>
              <span>
                Flow redirige al cliente a tu <code>urlReturn</code> con el token.
                Simula aquí la verificación final para mostrar la página de resultado.
              </span>
            </div>

            <div className="flow-pf__token-row flow-pf__token-row--inline" style={{ marginBottom: '16px' }}>
              <span className="flow-pf__token-label">Token</span>
              <code className="flow-pf__token-value">{token}</code>
            </div>

            <button
              className="flow-btn flow-btn--primary"
              onClick={() => handleGetStatus(3)}
              disabled={returnLoading}
            >
              {returnLoading ? <><span className="flow-spinner" /> Verificando...</> : 'Verificar estado (urlReturn)'}
            </button>

            {returnResult && <FlowRequestResponse result={returnResult} />}

            {returnResult?.ok && returnResult?.data && (
              <div className={`flow-pf__status-badge ${returnResult.data.status === 2 ? 'flow-pf__status-badge--ok' : 'flow-pf__status-badge--warn'}`}>
                {returnResult.data.status === 2
                  ? '✓ Pago exitoso — flujo completado'
                  : `Estado del pago: ${returnResult.data.status ?? 'desconocido'}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
