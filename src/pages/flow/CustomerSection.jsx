import EndpointForm from './EndpointForm';
import { flowPost, flowGet } from '../../services/flowApi';

export default function CustomerSection({ onLog }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* customer/create */}
      <EndpointForm
        method="POST"
        path="/customer/create"
        description="Crea un nuevo cliente. Flow lo identifica con un hash customerId."
        fields={[
          { name: 'name', label: 'name', required: true, placeholder: 'ej: Pedro Pérez' },
          { name: 'email', label: 'email', required: true, type: 'email', placeholder: 'ej: pedro@email.com' },
          { name: 'externalId', label: 'externalId', required: true, placeholder: 'ej: 12345678-9 (RUT u otro ID)' },
        ]}
        onSubmit={(params) => flowPost('/customer/create', params)}
        onLog={onLog}
      />

      {/* customer/get */}
      <EndpointForm
        method="GET"
        path="/customer/get"
        description="Obtiene los datos de un cliente por su customerId."
        fields={[
          { name: 'customerId', label: 'customerId', required: true, placeholder: 'ej: cus_onoolldvec' },
        ]}
        onSubmit={(params) => flowGet('/customer/get', params)}
        onLog={onLog}
      />

      {/* customer/list */}
      <EndpointForm
        method="GET"
        path="/customer/list"
        description="Lista paginada de clientes. Soporta filtros por nombre y estado."
        fields={[
          { name: 'start', label: 'start', type: 'number', placeholder: '0' },
          { name: 'limit', label: 'limit', type: 'number', placeholder: '10' },
          { name: 'filter', label: 'filter (nombre)', placeholder: 'Filtrar por nombre' },
          { name: 'status', label: 'status', type: 'select', options: [
            { value: '1', label: '1 - Activo' },
            { value: '0', label: '0 - Inactivo' },
          ]},
        ]}
        onSubmit={(params) => flowGet('/customer/list', params)}
        onLog={onLog}
      />

      {/* customer/edit */}
      <EndpointForm
        method="POST"
        path="/customer/edit"
        description="Edita los datos de un cliente. Solo envia los campos que quieras modificar."
        fields={[
          { name: 'customerId', label: 'customerId', required: true, placeholder: 'ej: cus_onoolldvec' },
          { name: 'name', label: 'name', placeholder: 'Nuevo nombre' },
          { name: 'email', label: 'email', type: 'email', placeholder: 'Nuevo email' },
          { name: 'externalId', label: 'externalId', placeholder: 'Nuevo ID externo' },
        ]}
        onSubmit={(params) => flowPost('/customer/edit', params)}
        onLog={onLog}
      />

      {/* customer/register */}
      <EndpointForm
        method="POST"
        path="/customer/register"
        description="Envia al cliente a registrar su tarjeta de credito. Retorna URL + token para redireccion."
        fields={[
          { name: 'customerId', label: 'customerId', required: true, placeholder: 'ej: cus_onoolldvec' },
          { name: 'url_return', label: 'url_return', required: true, placeholder: 'https://tu-sitio.com/flow/card-result', full: true },
        ]}
        onSubmit={(params) => flowPost('/customer/register', params)}
        onLog={onLog}
      />

      {/* customer/charge */}
      <EndpointForm
        method="POST"
        path="/customer/charge"
        description="Efectua un cargo automatico en la tarjeta de credito registrada del cliente."
        fields={[
          { name: 'customerId', label: 'customerId', required: true, placeholder: 'ej: cus_onoolldvec' },
          { name: 'amount', label: 'amount', required: true, type: 'number', placeholder: 'ej: 5000' },
          { name: 'subject', label: 'subject', required: true, placeholder: 'ej: Cargo mensual' },
          { name: 'commerceOrder', label: 'commerceOrder', required: true, placeholder: 'ej: charge-001' },
          { name: 'currency', label: 'currency', placeholder: 'CLP' },
        ]}
        onSubmit={(params) => flowPost('/customer/charge', params)}
        onLog={onLog}
      />

      {/* customer/collect */}
      <EndpointForm
        method="POST"
        path="/customer/collect"
        description="Envia un cobro a un cliente. Si tiene tarjeta registrada, cargo automatico. Si no, genera cobro."
        fields={[
          { name: 'customerId', label: 'customerId', required: true, placeholder: 'ej: cus_onoolldvec' },
          { name: 'commerceOrder', label: 'commerceOrder', required: true, placeholder: 'ej: collect-001' },
          { name: 'subject', label: 'subject', required: true, placeholder: 'ej: Cobro servicio' },
          { name: 'amount', label: 'amount', required: true, type: 'number', placeholder: 'ej: 10000' },
          { name: 'urlConfirmation', label: 'urlConfirmation', required: true, placeholder: 'https://tu-sitio.com/flow/confirm', full: true },
          { name: 'urlReturn', label: 'urlReturn', required: true, placeholder: 'https://tu-sitio.com/flow/return', full: true },
          { name: 'byEmail', label: 'byEmail', type: 'select', options: [
            { value: '0', label: '0 - No' },
            { value: '1', label: '1 - Sí, enviar por email' },
          ]},
          { name: 'paymentMethod', label: 'paymentMethod', type: 'select', options: [
            { value: '9', label: '9 - Todos los medios' },
          ]},
        ]}
        onSubmit={(params) => flowPost('/customer/collect', params)}
        onLog={onLog}
      />

      {/* customer/delete */}
      <EndpointForm
        method="POST"
        path="/customer/delete"
        description="Elimina un cliente. No debe tener suscripciones activas ni importes pendientes."
        fields={[
          { name: 'customerId', label: 'customerId', required: true, placeholder: 'ej: cus_onoolldvec' },
        ]}
        onSubmit={(params) => flowPost('/customer/delete', params)}
        onLog={onLog}
      />
    </div>
  );
}
