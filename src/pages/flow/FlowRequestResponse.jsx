import { useState } from 'react';

export default function FlowRequestResponse({ result }) {
  const [tab, setTab] = useState('response');

  if (!result) return null;

  const { request, ok, status, data, raw, duration } = result;

  function formatJson(obj) {
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }

  function formatTime(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="flow-rr">
      {/* Header con tabs y status */}
      <div className="flow-rr__header">
        <div className="flow-rr__tabs">
          <button
            className={`flow-rr__tab ${tab === 'request' ? 'flow-rr__tab--active' : ''}`}
            onClick={() => setTab('request')}
          >
            Request
          </button>
          <button
            className={`flow-rr__tab ${tab === 'response' ? 'flow-rr__tab--active' : ''}`}
            onClick={() => setTab('response')}
          >
            Response
          </button>
        </div>
        <div className="flow-rr__meta">
          <span className={`flow-rr__status ${ok ? 'flow-rr__status--ok' : 'flow-rr__status--err'}`}>
            {status || 'ERR'} {ok ? 'OK' : 'Error'}
          </span>
          <span className="flow-rr__time">{duration}ms</span>
        </div>
      </div>

      {/* Content */}
      <div className="flow-rr__body">
        {tab === 'request' && request && (
          <div className="flow-rr__section">
            <div className="flow-rr__row">
              <span className={`flow-rr__method flow-rr__method--${request.method.toLowerCase()}`}>
                {request.method}
              </span>
              <span className="flow-rr__url">{request.url}</span>
            </div>

            {request.timestamp && (
              <div className="flow-rr__label-row">
                <span className="flow-rr__label">Timestamp</span>
                <span className="flow-rr__value">{formatTime(request.timestamp)}</span>
              </div>
            )}

            {request.headers && Object.keys(request.headers).length > 0 && (
              <>
                <div className="flow-rr__divider" />
                <div className="flow-rr__sub-title">Headers</div>
                <pre className="flow-rr__json">{formatJson(request.headers)}</pre>
              </>
            )}

            {request.params && (
              <>
                <div className="flow-rr__divider" />
                <div className="flow-rr__sub-title">Parametros (firmados)</div>
                <pre className="flow-rr__json">{formatJson(request.params)}</pre>
              </>
            )}
          </div>
        )}

        {tab === 'request' && !request && (
          <div className="flow-rr__empty">Sin datos de request disponibles</div>
        )}

        {tab === 'response' && (
          <div className="flow-rr__section">
            <div className="flow-rr__label-row">
              <span className="flow-rr__label">Status</span>
              <span className={`flow-rr__value ${ok ? 'flow-rr__value--ok' : 'flow-rr__value--err'}`}>
                {status || 'Error'} {ok ? 'OK' : 'Error'}
              </span>
            </div>
            <div className="flow-rr__label-row">
              <span className="flow-rr__label">Duracion</span>
              <span className="flow-rr__value">{duration}ms</span>
            </div>
            <div className="flow-rr__divider" />
            <div className="flow-rr__sub-title">Body</div>
            <pre className="flow-rr__json">{formatJson(data)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
