import { useState, useCallback } from 'react';
import { getFlowConfig } from '../../services/flowApi';
import FlowConfig from './FlowConfig';
import PaymentSection from './PaymentSection';
import PaymentFlowSection from './PaymentFlowSection';
import CustomerSection from './CustomerSection';
import RefundSection from './RefundSection';
import FlowMonitor from './FlowMonitor';
import '../../styles/flow.css';

const SECTIONS = [
  {
    id: 'config',
    label: 'Configuracion',
    icon: '\u2699',
    category: 'General',
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: '\u25C9',
    category: 'General',
  },
  {
    id: 'payment-flow',
    label: 'Flujo de Pago',
    icon: '\u25B6',
    category: 'Flujos',
    badge: 'nuevo',
  },
  {
    id: 'payment',
    label: 'Payment',
    category: 'Endpoints',
    endpoints: [
      { method: 'POST', name: 'create' },
      { method: 'POST', name: 'createEmail' },
      { method: 'GET', name: 'getStatus' },
      { method: 'GET', name: 'getStatusByCommerceId' },
      { method: 'GET', name: 'getStatusByFlowOrder' },
      { method: 'GET', name: 'getPayments' },
    ],
  },
  {
    id: 'customer',
    label: 'Customer',
    category: 'Endpoints',
    endpoints: [
      { method: 'POST', name: 'create' },
      { method: 'GET', name: 'get' },
      { method: 'GET', name: 'list' },
      { method: 'POST', name: 'edit' },
      { method: 'POST', name: 'register' },
      { method: 'POST', name: 'charge' },
      { method: 'POST', name: 'collect' },
      { method: 'POST', name: 'delete' },
    ],
  },
  {
    id: 'refund',
    label: 'Refund',
    category: 'Endpoints',
    endpoints: [
      { method: 'POST', name: 'create' },
      { method: 'GET', name: 'getStatus' },
      { method: 'POST', name: 'cancel' },
    ],
  },
];

export default function FlowTestPage() {
  const [active, setActive] = useState('config');
  const [requestLog, setRequestLog] = useState([]);
  const config = getFlowConfig();

  const addToLog = useCallback((entry) => {
    setRequestLog((prev) => {
      const id = prev.length + 1;
      return [{ id, ...entry }, ...prev];
    });
  }, []);

  function clearLog() {
    setRequestLog([]);
  }

  function renderContent() {
    switch (active) {
      case 'config':
        return <FlowConfig />;
      case 'monitor':
        return <FlowMonitor logs={requestLog} onClear={clearLog} />;
      case 'payment-flow':
        return <PaymentFlowSection onLog={addToLog} />;
      case 'payment':
        return <PaymentSection onLog={addToLog} />;
      case 'customer':
        return <CustomerSection onLog={addToLog} />;
      case 'refund':
        return <RefundSection onLog={addToLog} />;
      default:
        return null;
    }
  }

  const activeSection = SECTIONS.find((s) => s.id === active);
  let lastCategory = '';

  return (
    <div className="flow-app">
      {/* Sidebar */}
      <aside className="flow-sidebar">
        <div className="flow-sidebar__header">
          <div className="flow-sidebar__logo">Flow API Tester</div>
          <div className="flow-sidebar__version">v3.0.1 — Sandbox Testing</div>
        </div>

        <nav className="flow-sidebar__nav">
          {SECTIONS.map((section) => {
            const showCategory = section.category !== lastCategory;
            lastCategory = section.category;

            return (
              <div key={section.id}>
                {showCategory && (
                  <div className="flow-sidebar__section">{section.category}</div>
                )}
                <button
                  className={`flow-sidebar__link ${active === section.id ? 'flow-sidebar__link--active' : ''}`}
                  onClick={() => setActive(section.id)}
                >
                  {section.icon ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {section.icon} {section.label}
                      {section.id === 'monitor' && requestLog.length > 0 && (
                        <span className="flow-sidebar__badge">{requestLog.length}</span>
                      )}
                      {section.badge === 'nuevo' && (
                        <span className="flow-sidebar__new-badge">nuevo</span>
                      )}
                    </span>
                  ) : (
                    <span>{section.label}</span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="flow-sidebar__env">
          <span className={`flow-sidebar__env-badge flow-sidebar__env-badge--${config.environment || 'sandbox'}`}>
            {(config.environment || 'sandbox').toUpperCase()}
          </span>
        </div>
      </aside>

      {/* Main */}
      <main className="flow-main">
        <div className="flow-topbar">
          <span className="flow-topbar__title">
            {activeSection ? activeSection.label : 'Flow API'}
            {activeSection?.endpoints && (
              <span style={{ color: '#71717a', fontWeight: 400, fontSize: '0.82rem', marginLeft: '8px' }}>
                {activeSection.endpoints.length} endpoints
              </span>
            )}
            {active === 'monitor' && requestLog.length > 0 && (
              <span style={{ color: '#71717a', fontWeight: 400, fontSize: '0.82rem', marginLeft: '8px' }}>
                {requestLog.length} registros
              </span>
            )}
          </span>
          <div className="flow-topbar__actions">
            <a
              href="https://developers.flow.cl/en/api"
              target="_blank"
              rel="noopener noreferrer"
              className="flow-btn flow-btn--secondary flow-btn--sm"
            >
              Docs oficiales &#8599;
            </a>
          </div>
        </div>

        <div className="flow-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
