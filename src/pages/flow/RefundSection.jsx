import EndpointForm from './EndpointForm';
import { flowPost, flowGet } from '../../services/flowApi';

export default function RefundSection({ onLog }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* refund/create */}
      <EndpointForm
        method="POST"
        path="/refund/create"
        description="Crea una orden de reembolso. Flow notifica via POST a urlCallback con el token."
        fields={[
          { name: 'refundCommerceOrder', label: 'refundCommerceOrder', required: true, placeholder: 'ej: refund-001' },
          { name: 'receiverEmail', label: 'receiverEmail', required: true, type: 'email', placeholder: 'ej: receptor@email.com' },
          { name: 'amount', label: 'amount', required: true, type: 'number', placeholder: 'ej: 5000' },
          { name: 'urlCallBack', label: 'urlCallBack', required: true, placeholder: 'https://tu-sitio.com/flow/refund-status', full: true },
          { name: 'commerceTrxId', label: 'commerceTrxId', placeholder: 'ID comercio de la transacción original' },
          { name: 'flowTrxId', label: 'flowTrxId', placeholder: 'ID Flow de la transacción original' },
        ]}
        onSubmit={(params) => flowPost('/refund/create', params)}
        onLog={onLog}
      />

      {/* refund/getStatus */}
      <EndpointForm
        method="GET"
        path="/refund/getStatus"
        description="Obtiene el estado de un reembolso solicitado."
        fields={[
          { name: 'token', label: 'token', required: true, placeholder: 'Token del reembolso', full: true },
        ]}
        onSubmit={(params) => flowGet('/refund/getStatus', params)}
        onLog={onLog}
      />

      {/* refund/cancel */}
      <EndpointForm
        method="POST"
        path="/refund/cancel"
        description="Cancela una orden de reembolso pendiente."
        fields={[
          { name: 'token', label: 'token', required: true, placeholder: 'Token del reembolso a cancelar', full: true },
        ]}
        onSubmit={(params) => flowPost('/refund/cancel', params)}
        onLog={onLog}
      />
    </div>
  );
}
