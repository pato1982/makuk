import { useState } from 'react';
import FlowRequestResponse from './FlowRequestResponse';

function formatTime(iso) {
  if (!iso) return '--:--:--';
  try {
    return new Date(iso).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function FlowMonitor({ logs, onClear }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!logs || logs.length === 0) {
    return (
      <div className="flow-monitor">
        <div className="flow-monitor__empty">
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>&#128269;</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Sin llamadas registradas</div>
          <div style={{ color: '#71717a', fontSize: '0.82rem' }}>
            Las llamadas que realices desde los endpoints apareceran aqui.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flow-monitor">
      <div className="flow-monitor__toolbar">
        <span className="flow-monitor__count">{logs.length} llamada{logs.length !== 1 ? 's' : ''}</span>
        <button className="flow-btn flow-btn--secondary flow-btn--sm" onClick={onClear}>
          Limpiar historial
        </button>
      </div>

      <div className="flow-monitor__list">
        {logs.map((entry) => {
          const isExpanded = expandedId === entry.id;
          return (
            <div key={entry.id} className="flow-monitor__item">
              <button
                className={`flow-monitor__row ${isExpanded ? 'flow-monitor__row--active' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <span className="flow-monitor__num">#{entry.id}</span>
                <span className={`flow-monitor__method flow-monitor__method--${entry.method.toLowerCase()}`}>
                  {entry.method}
                </span>
                <span className="flow-monitor__endpoint">{entry.endpoint}</span>
                <span className={`flow-monitor__status ${entry.ok ? 'flow-monitor__status--ok' : 'flow-monitor__status--err'}`}>
                  {entry.status || 'ERR'}
                </span>
                <span className="flow-monitor__duration">{entry.duration}ms</span>
                <span className="flow-monitor__time">{formatTime(entry.request?.timestamp)}</span>
                <span className="flow-monitor__chevron">{isExpanded ? '\u25B2' : '\u25BC'}</span>
              </button>

              {isExpanded && (
                <div className="flow-monitor__detail">
                  <FlowRequestResponse result={entry} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
