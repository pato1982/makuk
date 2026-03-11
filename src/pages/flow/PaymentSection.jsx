import EndpointForm from './EndpointForm';
import { flowPost, flowGet } from '../../services/flowApi';

export default function PaymentSection({ onLog }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* payment/create */}
      <EndpointForm
        method="POST"
        path="/payment/create"
        description="Genera una orden de pago. Retorna URL + token para redirigir al pagador."
        fields={[
          { name: 'commerceOrder', label: 'commerceOrder', required: true, placeholder: 'ej: order-001' },
          { name: 'subject', label: 'subject', required: true, placeholder: 'ej: Compra producto X' },
          { name: 'amount', label: 'amount', required: true, type: 'number', placeholder: 'ej: 5000' },
          { name: 'email', label: 'email', required: true, type: 'email', placeholder: 'ej: cliente@email.com' },
          { name: 'currency', label: 'currency', placeholder: 'CLP' },
          { name: 'paymentMethod', label: 'paymentMethod', type: 'select', options: [
            { value: '9', label: '9 - Todos los medios' },
            { value: '1', label: '1 - Webpay' },
            { value: '2', label: '2 - Servipag' },
            { value: '3', label: '3 - Multicaja' },
            { value: '5', label: '5 - Onepay' },
            { value: '8', label: '8 - Cryptocompra' },
            { value: '26', label: '26 - Mach' },
          ]},
          { name: 'urlConfirmation', label: 'urlConfirmation', required: true, placeholder: 'https://tu-sitio.com/flow/confirm', full: true },
          { name: 'urlReturn', label: 'urlReturn', required: true, placeholder: 'https://tu-sitio.com/flow/return', full: true },
          { name: 'optional', label: 'optional (JSON)', placeholder: '{"rut":"12345678-9"}', full: true },
          { name: 'timeout', label: 'timeout (segundos)', type: 'number', placeholder: '0 = sin expiración' },
        ]}
        onSubmit={(params) => flowPost('/payment/create', params)}
        onLog={onLog}
      />

      {/* payment/createEmail */}
      <EndpointForm
        method="POST"
        path="/payment/createEmail"
        description="Genera un cobro por email. Flow envia el email al pagador con link de pago."
        fields={[
          { name: 'commerceOrder', label: 'commerceOrder', required: true, placeholder: 'ej: order-email-001' },
          { name: 'subject', label: 'subject', required: true, placeholder: 'ej: Cobro servicio mensual' },
          { name: 'amount', label: 'amount', required: true, type: 'number', placeholder: 'ej: 15000' },
          { name: 'email', label: 'email', required: true, type: 'email', placeholder: 'ej: cliente@email.com' },
          { name: 'urlConfirmation', label: 'urlConfirmation', required: true, placeholder: 'https://tu-sitio.com/flow/confirm', full: true },
          { name: 'urlReturn', label: 'urlReturn', required: true, placeholder: 'https://tu-sitio.com/flow/return', full: true },
          { name: 'forward_days_after', label: 'forward_days_after', type: 'number', placeholder: 'Días para reenvío' },
          { name: 'forward_times', label: 'forward_times', type: 'number', placeholder: 'Veces de reenvío' },
        ]}
        onSubmit={(params) => flowPost('/payment/createEmail', params)}
        onLog={onLog}
      />

      {/* payment/getStatus */}
      <EndpointForm
        method="GET"
        path="/payment/getStatus"
        description="Obtiene el estado de una orden de pago usando el token de la transacción."
        fields={[
          { name: 'token', label: 'token', required: true, placeholder: 'Token de la transacción', full: true },
        ]}
        onSubmit={(params) => flowGet('/payment/getStatus', params)}
        onLog={onLog}
      />

      {/* payment/getStatusByCommerceId */}
      <EndpointForm
        method="GET"
        path="/payment/getStatusByCommerceId"
        description="Obtiene el estado de un pago en base al commerceId."
        fields={[
          { name: 'commerceId', label: 'commerceId', required: true, placeholder: 'Orden del comercio' },
        ]}
        onSubmit={(params) => flowGet('/payment/getStatusByCommerceId', params)}
        onLog={onLog}
      />

      {/* payment/getStatusByFlowOrder */}
      <EndpointForm
        method="GET"
        path="/payment/getStatusByFlowOrder"
        description="Obtiene el estado de un pago en base al numero de orden Flow."
        fields={[
          { name: 'flowOrder', label: 'flowOrder', required: true, type: 'number', placeholder: 'Número de orden Flow' },
        ]}
        onSubmit={(params) => flowGet('/payment/getStatusByFlowOrder', params)}
        onLog={onLog}
      />

      {/* payment/getPayments */}
      <EndpointForm
        method="GET"
        path="/payment/getPayments"
        description="Obtiene el listado de pagos recibidos en un dia."
        fields={[
          { name: 'date', label: 'date (yyyy-mm-dd)', required: true, placeholder: '2026-03-08' },
          { name: 'start', label: 'start', type: 'number', placeholder: '0' },
          { name: 'limit', label: 'limit', type: 'number', placeholder: '10' },
        ]}
        onSubmit={(params) => flowGet('/payment/getPayments', params)}
        onLog={onLog}
      />
    </div>
  );
}
