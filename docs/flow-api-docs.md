# Flow API v3.0.1 — Documentación Completa

> Pasarela de pagos chilena. Documentación extraída del portal oficial [developers.flow.cl](https://developers.flow.cl/en/api)

---

## 1. Introducción

### 1.1 Descripción general

La API REST de Flow proporciona un amplio conjunto de operaciones y recursos:

- **Payment** — Pagos y cobros por email
- **Customer** — Clientes, cobros, cargos automáticos
- **Refund** — Reembolsos
- **Plans** — Planes de suscripción
- **Subscription** — Suscripciones y cobros recurrentes
- **Subscription Items** — Items adicionales de suscripciones
- **Coupon** — Cupones de descuento
- **Invoice** — Importes generados por suscripciones
- **Settlement** — Liquidaciones de pagos, reembolsos y comisiones
- **Merchant** — Gestión de comercios asociados

### 1.2 Acceso al API

| Entorno    | Base URL                         |
|------------|----------------------------------|
| Producción | `https://www.flow.cl/api`        |
| Sandbox    | `https://sandbox.flow.cl/api`    |

### 1.3 Autenticación y Seguridad

- **Método:** API Key + firma HMAC-SHA256 con SecretKey
- **Transporte:** SSL (HTTPS)
- **Credenciales:**
  - Producción: `https://www.flow.cl/app/web/misDatos.php`
  - Sandbox: `https://sandbox.flow.cl/app/web/misDatos.php`

### 1.4 Cómo firmar con SecretKey

1. Ordenar todos los parámetros alfabéticamente (excepto `s`)
2. Concatenar: `nombre_parametrovalornombre_parametrovalor...`
3. Firmar con HMAC-SHA256 usando la SecretKey
4. Agregar el resultado como parámetro `s`

**Ejemplo — parámetros:**
```
"apiKey" = "XXXX-XXXX-XXXX"
"currency" = "CLP"
"amount" = 5000
```

**String a firmar (ordenado):**
```
amount5000apiKeyXXXX-XXXX-XXXXcurrencyCLP
```

**Ejemplos de firmado por lenguaje:**

```php
// PHP
$sign = hash_hmac('sha256', $string_to_sign, $secretKey);
```

```java
// Java
String sign = hmacSHA256(secretKey, string_to_sign);
```

```ruby
# Ruby
OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha256'), secret_key, string_to_sign)
```

```javascript
// JavaScript
var sign = CryptoJS.HmacSHA256(stringToSign, secretKey);
```

### 1.5 Consumir servicios GET

```php
$url = 'https://www.flow.cl/api/payment/getStatus';
$params["s"] = $signature;
$url = $url . "?" . http_build_query($params);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
$response = curl_exec($ch);
```

### 1.6 Consumir servicios POST

```php
$url = 'https://www.flow.cl/api/payment/create';
$params["s"] = $signature;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($ch, CURLOPT_POST, TRUE);
curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
$response = curl_exec($ch);
```

### 1.7 Notificaciones (Callbacks)

Flow notifica a tu comercio vía **POST** a las URLs configuradas. Para transacciones asíncronas, Flow envía un parámetro `token` que debes usar para consultar el estado.

### 1.8 Paginación

Los endpoints de listado soportan:
- `start` — Registro de inicio (default: 0)
- `limit` — Registros por página (default: 10, max: 100)

Respuesta paginada:
```json
{
  "total": 200,
  "hasMore": 1,
  "data": "[{item1}{item2}...]"
}
```

### 1.9 Clientes API (Colecciones Postman)

| Colección               | Archivo                                    |
|-------------------------|--------------------------------------------|
| Flow Payment            | `Flow Payment.postman_collection.json`     |
| Flow Customer           | `Flow Customer.postman_collection.json`    |
| Flow Plan               | `Flow Plan.postman_collection.json`        |
| Flow Subscription       | `Flow Subscription.postman_collection.json`|
| Flow Coupon             | `Flow Coupon.postman_collection.json`      |
| Flow Invoices           | `Flow Invoices.postman_collection.json`    |
| Flow Refund             | `Flow Refund.postman_collection.json`      |
| Flow Settlements        | `Flow Settlements.postman_collection.json` |
| Flow Merchant           | `Flow Merchant.postman_collection.json`    |

### 1.10 Sandbox — Tarjetas de prueba

#### Chile
| Dato                    | Valor              |
|-------------------------|---------------------|
| N° tarjeta de crédito   | `4051885600446623`  |
| Año de expiración       | Cualquiera          |
| Mes de expiración       | Cualquiera          |
| CVV                     | `123`               |

**Simulación del banco:**
| Dato  | Valor         |
|-------|---------------|
| Rut   | `11111111-1`  |
| Clave | `123`         |

**Medios de pago simulados:** Servipag, Multicaja, Mach, Cryptocompra (solo hacer clic en "aceptar")

#### Perú y México
| Dato                    | Valor              |
|-------------------------|---------------------|
| N° tarjeta de crédito   | `5293138086430769`  |
| Año de expiración       | Cualquiera          |
| Mes de expiración       | Cualquiera          |
| CVV                     | `123`               |

#### Perú — Pagos recurrentes (Aceptado)
| Dato                    | Valor              |
|-------------------------|---------------------|
| N° tarjeta de crédito   | `5293138086430769`  |
| Inscripción             | Sí                  |

#### Perú — Pagos recurrentes (Rechazado)
| Dato                    | Valor              |
|-------------------------|---------------------|
| N° tarjeta de crédito   | `4551708161768059`  |
| Inscripción             | Sí                  |

---

## 2. Payment (Pagos) — 9 endpoints

### 2.1 `GET /payment/getStatus` — Estado de una orden de pago

Obtiene el estado de un pago. Se usa en la página callback para recibir notificaciones.

**Query Parameters:**

| Parámetro | Tipo   | Req | Descripción                              |
|-----------|--------|-----|------------------------------------------|
| apiKey    | string | ✅  | apiKey del comercio                      |
| token     | string | ✅  | Token de la transacción enviado por Flow |
| s         | string | ✅  | Firma de los parámetros                  |

**Respuesta 200 — Objeto PaymentStatus:**
```json
{
  "flowOrder": 3567899,
  "commerceOrder": "sf12377",
  "requestDate": "2017-07-21 12:32:11",
  "status": 1,
  "subject": "game console",
  "currency": "CLP",
  "amount": 12000,
  "payer": "pperez@gmail.com",
  "optional": {
    "RUT": "7025521-9",
    "ID": "899564778"
  },
  "pending_info": {
    "media": "Multicaja",
    "date": "2017-07-21 10:30:12"
  },
  "paymentData": {
    "date": "2017-07-21 12:32:11",
    "media": "webpay",
    "conversionDate": "2017-07-21",
    "conversionRate": 1.1,
    "amount": 12000,
    "currency": "CLP",
    "fee": 551,
    "balance": 11499,
    "transferDate": "2017-07-24"
  },
  "merchantId": "string"
}
```

### 2.2 `GET /payment/getStatusByCommerceId` — Estado por commerceId

**Query Parameters:**

| Parámetro   | Tipo   | Req | Descripción              |
|-------------|--------|-----|--------------------------|
| apiKey      | string | ✅  | apiKey del comercio      |
| commerceId  | string | ✅  | Orden del comercio       |
| s           | string | ✅  | Firma                    |

**Respuesta:** Objeto PaymentStatus (igual a 2.1)

### 2.3 `GET /payment/getStatusByFlowOrder` — Estado por flowOrder

**Query Parameters:**

| Parámetro | Tipo   | Req | Descripción            |
|-----------|--------|-----|------------------------|
| apiKey    | string | ✅  | apiKey del comercio    |
| flowOrder | number | ✅  | Número de orden Flow   |
| s         | string | ✅  | Firma                  |

**Respuesta:** Objeto PaymentStatus (igual a 2.1)

### 2.4 `GET /payment/getPayments` — Listado de pagos de un día

**Query Parameters:**

| Parámetro | Tipo    | Req | Descripción                                |
|-----------|---------|-----|--------------------------------------------|
| apiKey    | string  | ✅  | apiKey del comercio                        |
| date      | string  | ✅  | Fecha en formato `yyyy-mm-dd`              |
| start     | integer | ❌  | Registro de inicio (default: 0)            |
| limit     | integer | ❌  | Registros por página (default: 10, max: 100)|
| s         | string  | ✅  | Firma                                      |

**Respuesta:** Lista paginada de objetos PaymentStatus

### 2.5 `GET /payment/getStatusExtended` — Estado extendido

Igual que `getStatus` pero retorna el objeto `PaymentStatusExtended` con más detalles.

**Query Parameters:** Igual a 2.1

### 2.6 `GET /payment/getStatusByFlowOrderExtended` — Estado extendido por flowOrder

**Query Parameters:** Igual a 2.3. Retorna `PaymentStatusExtended`.

### 2.7 `GET /payment/getTransactions` — Listado de transacciones de un día

**Query Parameters:**

| Parámetro | Tipo    | Req | Descripción                                |
|-----------|---------|-----|--------------------------------------------|
| apiKey    | string  | ✅  | apiKey del comercio                        |
| date      | string  | ✅  | Fecha en formato `yyyy-mm-dd`              |
| start     | integer | ❌  | Registro de inicio (default: 0)            |
| limit     | integer | ❌  | Registros por página (default: 10, max: 100)|
| s         | string  | ✅  | Firma                                      |

**Respuesta:** Lista paginada de transacciones

### 2.8 `POST /payment/create` — Genera una orden de pago ⭐

Crea una orden de pago. La respuesta contiene URL + token para redirigir al pagador:
`url + "?token=" + token`

**Request Body (application/x-www-form-urlencoded):**

| Parámetro        | Tipo    | Req | Descripción                                                    |
|------------------|---------|-----|----------------------------------------------------------------|
| apiKey           | string  | ✅  | apiKey del comercio                                            |
| commerceOrder    | string  | ✅  | Orden del comercio                                             |
| subject          | string  | ✅  | Descripción de la orden                                        |
| currency         | string  | ❌  | Moneda de la orden                                             |
| amount           | number  | ✅  | Monto de la orden                                              |
| email            | string  | ✅  | Email del pagador                                              |
| paymentMethod    | integer | ❌  | ID medio de pago (9 = todos los medios)                        |
| urlConfirmation  | string  | ✅  | URL callback donde Flow confirma el pago                       |
| urlReturn        | string  | ✅  | URL de retorno donde Flow redirige al pagador                  |
| optional         | string  | ❌  | JSON clave-valor: `{"rut":"9999999-9","nombre":"cliente 1"}`   |
| timeout          | integer | ❌  | Segundos para expiración (0 = sin expiración)                  |
| merchantId       | string  | ❌  | ID comercio asociado (solo integradores)                       |
| payment_currency | string  | ❌  | Moneda esperada de pago                                        |
| s                | string  | ✅  | Firma                                                          |

**Respuesta 200:**
```json
{
  "url": "https://api.flow.cl",
  "token": "33373581FC32576FAF33C46FC6454B1FFEBD7E1H",
  "flowOrder": 8765456
}
```

**Callback:** Flow envía POST a `urlConfirmation` con parámetro `token`.

### 2.9 `POST /payment/createEmail` — Cobro por email ⭐

Flow envía email al pagador con link de pago.

**Request Body (application/x-www-form-urlencoded):**

| Parámetro          | Tipo    | Req | Descripción                                                  |
|--------------------|---------|-----|--------------------------------------------------------------|
| apiKey             | string  | ✅  | apiKey del comercio                                          |
| commerceOrder      | string  | ✅  | Orden del comercio                                           |
| subject            | string  | ✅  | Descripción de la orden                                      |
| currency           | string  | ❌  | Moneda de la orden                                           |
| amount             | number  | ✅  | Monto de la orden                                            |
| email              | string  | ✅  | Email del pagador                                            |
| urlConfirmation    | string  | ✅  | URL callback                                                 |
| urlReturn          | string  | ✅  | URL de retorno                                               |
| forward_days_after | number  | ❌  | Días para reenviar notificación si no se ha pagado           |
| forward_times      | number  | ❌  | Veces de reenvío de persistencia                             |
| optional           | string  | ❌  | JSON clave-valor                                             |
| timeout            | integer | ❌  | Segundos para expiración                                     |
| merchantId         | string  | ❌  | ID comercio asociado                                         |
| payment_currency   | string  | ❌  | Moneda esperada de pago                                      |
| s                  | string  | ✅  | Firma                                                        |

**Respuesta 200:** Igual a `payment/create`

---

## 3. Refund (Reembolsos) — 3 endpoints

### 3.1 `POST /refund/create` — Crear reembolso

Crea una orden de reembolso. Flow notifica vía POST a `urlCallback` con `token`.

**Request Body:**

| Parámetro            | Tipo   | Req | Descripción                                        |
|----------------------|--------|-----|----------------------------------------------------|
| apiKey               | string | ✅  | apiKey del comercio                                |
| refundCommerceOrder  | string | ✅  | Orden de reembolso del comercio                    |
| receiverEmail        | string | ✅  | Email del receptor del reembolso                   |
| amount               | number | ✅  | Monto del reembolso                                |
| urlCallBack          | string | ✅  | URL callback para estado del reembolso             |
| commerceTrxId        | string | ❌  | ID comercio de la transacción original             |
| flowTrxId            | string | ❌  | ID Flow de la transacción original                 |
| s                    | string | ✅  | Firma                                              |

**Respuesta 200 — Objeto RefundStatus:**
```json
{
  "token": "C93B4FAD6D63ED9A3F25D21E5D6DD0105FA8CAAQ",
  "flowRefundOrder": "122767",
  "date": "2017-07-21 12:33:15",
  "status": "created",
  "amount": "12000.00",
  "fee": "240.00"
}
```

### 3.2 `POST /refund/cancel` — Cancelar reembolso

**Request Body:**

| Parámetro | Tipo   | Req | Descripción                   |
|-----------|--------|-----|-------------------------------|
| apiKey    | string | ✅  | apiKey del comercio           |
| token     | string | ✅  | Token del reembolso a cancelar|
| s         | string | ✅  | Firma                         |

**Respuesta:** Objeto RefundStatus

### 3.3 `GET /refund/getStatus` — Estado de un reembolso

**Query Parameters:**

| Parámetro | Tipo   | Req | Descripción                        |
|-----------|--------|-----|------------------------------------|
| apiKey    | string | ✅  | apiKey del comercio                |
| token     | string | ✅  | Token enviado por Flow al callback |
| s         | string | ✅  | Firma                              |

**Respuesta:** Objeto RefundStatus

---

## 4. Customer (Clientes) — 15 endpoints

Flow identifica a cada cliente con un hash `customerId` (ej: `cus_onoolldvec`).

### 4.1 `POST /customer/create` — Crear cliente

**Request Body:**

| Parámetro  | Tipo   | Req | Descripción                          |
|------------|--------|-----|--------------------------------------|
| apiKey     | string | ✅  | apiKey del comercio                  |
| name       | string | ✅  | Nombre del cliente (nombre y apellido)|
| email      | string | ✅  | Email del cliente                    |
| externalId | string | ✅  | ID externo en tu sistema             |
| s          | string | ✅  | Firma                                |

**Respuesta 200 — Objeto Customer:**
```json
{
  "customerId": "cus_onoolldvec",
  "created": "2017-07-21 12:33:15",
  "email": "customer@gmail.com",
  "name": "Pedro Raul Perez",
  "pay_mode": "string",
  "creditCardType": "Visa",
  "last4CardDigits": "4425",
  "externalId": "14233531-8",
  "status": "1",
  "registerDate": "2017-07-21 14:22:01"
}
```

### 4.2 `POST /customer/edit` — Editar cliente

**Request Body:**

| Parámetro  | Tipo   | Req | Descripción              |
|------------|--------|-----|--------------------------|
| apiKey     | string | ✅  | apiKey del comercio      |
| customerId | string | ✅  | Identificador del cliente|
| name       | string | ❌  | Nombre del cliente       |
| email      | string | ❌  | Email del cliente        |
| externalId | string | ❌  | ID externo               |
| s          | string | ✅  | Firma                    |

**Respuesta:** Objeto Customer

### 4.3 `POST /customer/delete` — Eliminar cliente

> No debe tener suscripciones activas ni importes pendientes.

**Request Body:**

| Parámetro  | Tipo   | Req | Descripción              |
|------------|--------|-----|--------------------------|
| apiKey     | string | ✅  | apiKey del comercio      |
| customerId | string | ✅  | Identificador del cliente|
| s          | string | ✅  | Firma                    |

### 4.4 `GET /customer/get` — Obtener cliente

**Query Parameters:**

| Parámetro  | Tipo   | Req | Descripción              |
|------------|--------|-----|--------------------------|
| apiKey     | string | ✅  | apiKey del comercio      |
| customerId | string | ✅  | Identificador del cliente|
| s          | string | ✅  | Firma                    |

### 4.5 `GET /customer/list` — Lista de clientes

**Query Parameters:**

| Parámetro | Tipo    | Req | Descripción                     |
|-----------|---------|-----|---------------------------------|
| apiKey    | string  | ✅  | apiKey del comercio             |
| start     | integer | ❌  | Registro de inicio              |
| limit     | integer | ❌  | Registros por página (max: 100) |
| filter    | string  | ❌  | Filtro por nombre               |
| status    | integer | ❌  | Filtro por estado               |
| s         | string  | ✅  | Firma                           |

### 4.6 `POST /customer/register` — Registrar tarjeta de crédito ⭐

Envía al cliente a registrar su tarjeta. Retorna URL + token para redirección.

**Request Body:**

| Parámetro  | Tipo   | Req | Descripción                              |
|------------|--------|-----|------------------------------------------|
| apiKey     | string | ✅  | apiKey del comercio                      |
| customerId | string | ✅  | Identificador del cliente                |
| url_return | string | ✅  | URL callback para resultado del registro |
| s          | string | ✅  | Firma                                    |

**Respuesta 200:**
```json
{
  "url": "https://www.flow.cl/app/customer/disclaimer.php",
  "token": "41097C28B5BD78C77F589FE4BC59E18AC333F9EU"
}
```

### 4.7 `GET /customer/getRegisterStatus` — Resultado del registro de tarjeta

**Query Parameters:**

| Parámetro | Tipo   | Req | Descripción                    |
|-----------|--------|-----|--------------------------------|
| apiKey    | string | ✅  | apiKey del comercio            |
| token     | string | ✅  | Token enviado por Flow         |
| s         | string | ✅  | Firma                          |

**Respuesta 200:**
```json
{
  "status": "1",
  "customerId": "cus_onoolldvec",
  "creditCardType": "Visa",
  "last4CardDigits": "0366"
}
```

### 4.8 `POST /customer/unRegister` — Eliminar registro de tarjeta

Al eliminar, no se podrán hacer cargos automáticos.

**Request Body:** `apiKey`, `customerId`, `s`

### 4.9 `POST /customer/charge` — Cargo automático en tarjeta ⭐

Efectúa un cargo en la tarjeta previamente registrada.

**Request Body:**

| Parámetro     | Tipo   | Req | Descripción                    |
|---------------|--------|-----|--------------------------------|
| apiKey        | string | ✅  | apiKey del comercio            |
| customerId    | string | ✅  | Identificador del cliente      |
| amount        | number | ✅  | Monto del cargo                |
| subject       | string | ✅  | Descripción del cargo          |
| commerceOrder | string | ✅  | Orden del comercio             |
| currency      | string | ❌  | Moneda (CLP, UF)              |
| optionals     | string | ❌  | JSON clave-valor               |
| s             | string | ✅  | Firma                          |

**Respuesta:** Objeto PaymentStatus

### 4.10 `POST /customer/collect` — Cobro a un cliente ⭐

Si tiene tarjeta registrada → cargo automático. Si no → genera cobro. Con `byEmail=1` → cobro por email.

**Request Body:**

| Parámetro            | Tipo    | Req | Descripción                                          |
|----------------------|---------|-----|------------------------------------------------------|
| apiKey               | string  | ✅  | apiKey del comercio                                  |
| customerId           | string  | ✅  | Identificador del cliente                            |
| commerceOrder        | string  | ✅  | Orden del comercio                                   |
| subject              | string  | ✅  | Descripción del cobro                                |
| amount               | number  | ✅  | Monto del cobro                                      |
| urlConfirmation      | string  | ✅  | URL callback                                         |
| urlReturn            | string  | ✅  | URL de retorno                                       |
| currency             | string  | ❌  | Moneda (CLP, UF)                                    |
| paymentMethod        | integer | ❌  | ID medio de pago (9 = todos)                         |
| byEmail              | integer | ❌  | 1 = enviar cobro por email                           |
| forward_days_after   | integer | ❌  | Días para reenvío de persistencia                    |
| forward_times        | integer | ❌  | Veces de reenvío                                     |
| ignore_auto_charging | integer | ❌  | 1 = ignorar cargo automático aunque tenga tarjeta    |
| optionals            | string  | ❌  | JSON clave-valor                                     |
| timeout              | integer | ❌  | Segundos para expiración                             |
| s                    | string  | ✅  | Firma                                                |

**Respuesta 200 — Objeto CollectResponse:**
```json
{
  "type": "1",
  "commerceOrder": "zc23456",
  "flowOrder": 0,
  "url": "https://api.flow.cl",
  "token": "33373581FC32576FAF33C46FC6454B1FFEBD7E1H",
  "status": 0,
  "paymenResult": { ... }
}
```

### 4.11 `POST /customer/batchCollect` — Cobros masivos ⭐

Envía un lote de cobros masivos (asíncrono).

**Request Body:**

| Parámetro          | Tipo              | Req | Descripción                          |
|--------------------|-------------------|-----|--------------------------------------|
| apiKey             | string            | ✅  | apiKey del comercio                  |
| urlCallBack        | string (uri)      | ✅  | URL callback cuando el lote se procese|
| urlConfirmation    | string (uri)      | ✅  | URL callback de confirmación de pago |
| urlReturn          | string (uri)      | ✅  | URL de retorno                       |
| batchRows          | Array[CollectObj]  | ✅  | Lote de cargos en JSON               |
| byEmail            | integer           | ❌  | 1 = enviar cobros por email          |
| forward_days_after | integer           | ❌  | Días para reenvío                    |
| forward_times      | integer           | ❌  | Veces de reenvío                     |
| timeout            | integer           | ❌  | Segundos de expiración               |
| s                  | string            | ✅  | Firma                                |

**Respuesta 200:**
```json
{
  "token": "33373581FC32576FAF33C46FC6454B1FFEBD7E1H",
  "receivedRows": "112",
  "acceptedRows": "111",
  "rejectedRows": [{}]
}
```

### 4.12 `GET /customer/getBatchCollectStatus` — Estado del lote

**Query Parameters:** `apiKey`, `token`, `s`

### 4.13 `POST /customer/reverseCharge` — Reversar cargo

Reversa un cargo en tarjeta. Debe invocarse dentro de 24 horas (desde las 14:00 hrs).

**Request Body:**

| Parámetro     | Tipo   | Req | Descripción              |
|---------------|--------|-----|--------------------------|
| apiKey        | string | ✅  | apiKey del comercio      |
| commerceOrder | string | ❌  | Orden del comercio       |
| flowOrder     | number | ❌  | Orden de Flow            |
| s             | string | ✅  | Firma                    |

**Respuesta 200:**
```json
{
  "status": "1",
  "message": "Reverse charge was successful"
}
```

### 4.14 `GET /customer/getCharges` — Lista de cargos

**Query Parameters:**

| Parámetro  | Tipo    | Req | Descripción                      |
|------------|---------|-----|----------------------------------|
| apiKey     | string  | ✅  | apiKey del comercio              |
| customerId | string  | ✅  | Identificador del cliente        |
| start      | integer | ❌  | Registro de inicio               |
| limit      | integer | ❌  | Registros por página             |
| filter     | string  | ❌  | Filtro por descripción del cargo |
| fromDate   | string  | ❌  | Fecha de inicio (yyyy-mm-dd)     |
| status     | integer | ❌  | Filtro por estado                |
| s          | string  | ✅  | Firma                            |

### 4.15 `GET /customer/getChargeAttemps` — Intentos de cargo fallidos

**Query Parameters:** Igual a 4.14

### 4.16 `GET /customer/getSubscriptions` — Suscripciones de un cliente

**Query Parameters:** `apiKey`, `customerId`, `start`, `limit`, `s`

---

## 5. Plans (Planes de Suscripción) — 5 endpoints

### 5.1 `POST /plans/create` — Crear plan ⭐

**Request Body:**

| Parámetro               | Tipo   | Req | Descripción                                          |
|-------------------------|--------|-----|------------------------------------------------------|
| apiKey                  | string | ✅  | apiKey del comercio                                  |
| planId                  | string | ✅  | Identificador del Plan                               |
| name                    | string | ✅  | Nombre del Plan                                      |
| currency                | string | ✅  | Moneda del Plan                                      |
| amount                  | number | ✅  | Monto del Plan                                       |
| interval                | number | ✅  | Frecuencia: 1=diario, 2=semanal, 3=mensual, 4=anual |
| interval_count          | number | ❌  | N° de intervalos (default: 1). Ej: interval=2 + count=2 = quincenal |
| trial_period_days       | number | ❌  | Días de trial (default: 0)                           |
| days_until_due          | number | ❌  | Días para considerar importe vencido                 |
| periods_number          | number | ❌  | N° períodos de duración del plan                     |
| urlCallback             | string | ✅  | URL notificación de pagos                            |
| charges_retries_number  | number | ❌  | Reintentos de cargo (default: 3)                     |
| currency_convert_option | number | ❌  | 1=al pago (default), 2=al importe                    |
| s                       | string | ✅  | Firma                                                |

**Respuesta 200 — Objeto Plan:**
```json
{
  "planId": "myPlan01",
  "name": "Plan junior",
  "currency": "CLP",
  "amount": 20000,
  "interval": 3,
  "interval_count": 1,
  "created": "2017-07-21 12:33:15",
  "trial_period_days": 15,
  "days_until_due": 3,
  "periods_number": 12,
  "urlCallback": "https://www.comercio.cl/flow/suscriptionResult.php",
  "charges_retries_number": 3,
  "currency_convert_option": 0,
  "status": 1,
  "public": 1
}
```

### 5.2 `GET /plans/get` — Obtener plan

**Query Parameters:** `apiKey`, `planId`, `s`

### 5.3 `POST /plans/edit` — Editar plan

> Si tiene clientes suscritos, solo se puede modificar `trial_period_days`.

**Request Body:** Mismos campos que `create`, todos opcionales excepto `apiKey`, `planId`.

### 5.4 `POST /plans/delete` — Eliminar plan

> Eliminar = no se pueden suscribir nuevos clientes. Suscripciones activas continúan.

**Request Body:** `apiKey`, `planId`, `s`

### 5.5 `GET /plans/list` — Lista de planes

**Query Parameters:**

| Parámetro | Tipo    | Req | Descripción                            |
|-----------|---------|-----|----------------------------------------|
| apiKey    | string  | ✅  | apiKey del comercio                    |
| start     | integer | ❌  | Registro de inicio                     |
| limit     | integer | ❌  | Registros por página (max: 100)        |
| filter    | string  | ❌  | Filtro por nombre del plan             |
| status    | integer | ❌  | 1=Activo, 0=Eliminado                  |
| s         | string  | ✅  | Firma                                  |

---

## 6. Subscription (Suscripciones) — 12 endpoints

### 6.1 `POST /subscription/create` — Crear suscripción ⭐

**Request Body:**

| Parámetro          | Tipo           | Req | Descripción                              |
|--------------------|----------------|-----|------------------------------------------|
| apiKey             | string         | ✅  | apiKey del comercio                      |
| planId             | string         | ✅  | Identificador del Plan                   |
| customerId         | string         | ✅  | Identificador del cliente                |
| subscription_start | string (fecha) | ❌  | Fecha de inicio (yyyy-mm-dd)             |
| couponId           | number         | ❌  | ID del cupón de descuento                |
| trial_period_days  | number         | ❌  | Días de trial (override del plan)        |
| periods_number     | number         | ❌  | Períodos de duración (null = del plan)   |
| planAdditionalList | Array[number]  | ❌  | IDs de items adicionales                 |
| s                  | string         | ✅  | Firma                                    |

**Respuesta 200 — Objeto Subscription:**
```json
{
  "subscriptionId": "sus_azcyjj9ycd",
  "planId": "MiPlanMensual",
  "plan_name": "Plan mensual",
  "customerId": "cus_eblcbsua2g",
  "created": "2018-06-26 17:29:06",
  "subscription_start": "2018-06-26 17:29:06",
  "subscription_end": "2019-06-25 00:00:00",
  "period_start": "2018-06-26 00:00:00",
  "period_end": "2018-06-26 00:00:00",
  "next_invoice_date": "2018-06-27 00:00:00",
  "trial_period_days": 1,
  "trial_start": "2018-06-26 00:00:00",
  "trial_end": "2018-06-26 00:00:00",
  "cancel_at_period_end": 0,
  "cancel_at": null,
  "periods_number": 12,
  "days_until_due": 3,
  "status": 1,
  "morose": 0,
  "discount": { ... },
  "invoices": [ ... ],
  "planAdditionalList": [ ... ]
}
```

### 6.2 `GET /subscription/get` — Obtener suscripción

**Query Parameters:** `apiKey`, `subscriptionId`, `s`

### 6.3 `GET /subscription/list` — Lista de suscripciones de un plan

**Query Parameters:** `apiKey`, `planId`, `start`, `limit`, `filter`, `status`, `s`

### 6.4 `POST /subscription/changeTrial` — Modificar días de trial

**Request Body:** `apiKey`, `subscriptionId`, `trial_period_days`, `s`

### 6.5 `POST /subscription/cancel` — Cancelar suscripción

**Request Body:**

| Parámetro      | Tipo   | Req | Descripción                                     |
|----------------|--------|-----|-------------------------------------------------|
| apiKey         | string | ✅  | apiKey del comercio                             |
| subscriptionId | string | ✅  | Identificador de la suscripción                 |
| at_period_end  | number | ❌  | 0=cancelar ya, 1=cancelar al final del período  |
| s              | string | ✅  | Firma                                           |

### 6.6 `POST /subscription/addCoupon` — Agregar descuento

**Request Body:** `apiKey`, `subscriptionId`, `couponId`, `s`

### 6.7 `POST /subscription/deleteCoupon` — Eliminar descuento

**Request Body:** `apiKey`, `subscriptionId`, `s`

### 6.8 `POST /subscription/addItem` — Agregar item adicional

**Request Body:** `apiKey`, `subscriptionId`, `itemId`, `s`

### 6.9 `POST /subscription/deleteItem` — Eliminar item adicional

**Request Body:** `apiKey`, `subscriptionId`, `itemId`, `s`

### 6.10 `POST /subscription/changePlan` — Cambiar plan

**Request Body:** `apiKey`, `subscriptionId`, `planId`, `s`

### 6.11 `POST /subscription/changePlanPreview` — Previsualizar cambio de plan

**Request Body:** `apiKey`, `subscriptionId`, `planId`, `s`

**Respuesta 200:**
```json
{
  "balance": {
    "amount": -5000,
    "credit_expiration_date": "21-11-2024",
    "credit_expiration_amount": 2000,
    "credit_expiration_warning": "..."
  },
  "next_invoice_date": "11-11-2024",
  "old_plan": { "name": "...", "currency": "CLP", "amount": "10000", ... },
  "new_plan": { "name": "...", "currency": "CLP", "amount": "5000", ... }
}
```

### 6.12 `POST /subscription/changePlanCancel` — Cancelar cambio de plan programado

**Request Body:** `apiKey`, `subscriptionId`, `s`

---

## 7. Subscription Items (Items Adicionales) — 5 endpoints

### 7.1 `POST /subscription_item/create` — Crear item

**Request Body:**

| Parámetro | Tipo   | Req | Descripción                                        |
|-----------|--------|-----|----------------------------------------------------|
| apiKey    | string | ✅  | apiKey del comercio                                |
| name      | string | ✅  | Nombre del item                                    |
| currency  | string | ✅  | Moneda                                             |
| amount    | number | ✅  | Monto (negativo=descuento, positivo=recargo)       |
| s         | string | ✅  | Firma                                              |

**Respuesta 200 — Objeto ItemAdditional:**
```json
{
  "id": 166,
  "name": "Adicional Premium",
  "amount": 5000,
  "currency": "CLP",
  "associatedSubscriptionsCount": 1,
  "status": 1,
  "created": "2018-07-13 09:57:53"
}
```

### 7.2 `GET /subscription_item/get` — Obtener item

**Query Parameters:** `apiKey`, `itemId`, `s`

### 7.3 `POST /subscription_item/edit` — Editar item

**Request Body:**

| Parámetro  | Tipo   | Req | Descripción                                              |
|------------|--------|-----|----------------------------------------------------------|
| apiKey     | string | ✅  | apiKey del comercio                                      |
| itemId     | string | ✅  | Identificador del item                                   |
| name       | string | ❌  | Nombre                                                   |
| amount     | number | ❌  | Monto                                                    |
| changeType | string | ❌  | `to_future` (solo futuras) o `all` (actuales y futuras)  |
| s          | string | ✅  | Firma                                                    |

### 7.4 `POST /subscription_item/delete` — Eliminar item

**Request Body:**

| Parámetro  | Tipo   | Req | Descripción                                              |
|------------|--------|-----|----------------------------------------------------------|
| apiKey     | string | ✅  | apiKey del comercio                                      |
| itemId     | string | ✅  | Identificador del item                                   |
| changeType | string | ✅  | `to_future` o `all`                                      |
| s          | string | ✅  | Firma                                                    |

### 7.5 `GET /subscription_item/list` — Lista de items

**Query Parameters:** `apiKey`, `start`, `limit`, `filter`, `status` (1=Activo, 0=Inactivo), `s`

---

## 8. Coupon (Cupones de Descuento) — 5 endpoints

### 8.1 `POST /coupon/create` — Crear cupón

**Request Body:**

| Parámetro       | Tipo   | Req | Descripción                                                |
|-----------------|--------|-----|------------------------------------------------------------|
| apiKey          | string | ✅  | apiKey del comercio                                        |
| name            | string | ✅  | Nombre del cupón                                           |
| percent_off     | number | ❌  | Porcentaje (0-100, 2 decimales, ej: 10.2)                  |
| currency        | string | ❌  | Moneda (solo para cupones de monto)                        |
| amount          | number | ❌  | Monto del descuento                                        |
| duration        | number | ❌  | 1=definida, 0=indefinida                                   |
| times           | number | ❌  | Veces de duración (meses o períodos según contexto)        |
| max_redemptions | number | ❌  | Número máximo de aplicaciones                              |
| expires         | string | ❌  | Fecha de expiración (yyyy-mm-dd)                           |
| s               | string | ✅  | Firma                                                      |

**Respuesta 200 — Objeto Coupon:**
```json
{
  "id": 166,
  "name": "Descuento 10%",
  "percent_off": 10,
  "currency": "CLP",
  "amount": 2000,
  "created": "2018-07-13 09:57:53",
  "duration": 1,
  "times": 1,
  "max_redemptions": 50,
  "expires": "2018-12-31 00:00:00",
  "status": 1,
  "redemtions": 21
}
```

### 8.2 `POST /coupon/edit` — Editar cupón

> Solo se puede editar el nombre.

**Request Body:** `apiKey`, `couponId`, `name`, `s`

### 8.3 `POST /coupon/delete` — Eliminar cupón

> No elimina descuentos ya aplicados, solo impide reusar el cupón.

**Request Body:** `apiKey`, `couponId`, `s`

### 8.4 `GET /coupon/get` — Obtener cupón

**Query Parameters:** `apiKey`, `couponId`, `s`

### 8.5 `GET /coupon/list` — Lista de cupones

**Query Parameters:** `apiKey`, `start`, `limit`, `filter`, `status` (1=Activo, 0=Inactivo), `s`

---

## 9. Invoice (Importes) — 5 endpoints

### 9.1 `GET /invoice/get` — Obtener invoice

**Query Parameters:** `apiKey`, `invoiceId` (number), `s`

**Respuesta 200 — Objeto Invoice:**
```json
{
  "id": 1034,
  "subscriptionId": "sus_azcyjj9ycd",
  "customerId": "cus_eblcbsua2g",
  "created": "2018-06-26 17:29:06",
  "subject": "PlanPesos - período 2018-06-27 / 2018-06-27",
  "currency": "CLP",
  "amount": 20000,
  "period_start": "2018-06-27 00:00:00",
  "period_end": "2018-07-26 00:00:00",
  "attemp_count": 0,
  "attemped": 1,
  "next_attemp_date": "2018-07-27 00:00:00",
  "due_date": "2018-06-30 00:00:00",
  "status": 0,
  "error": 0,
  "errorDate": "2018-06-30 00:00:00",
  "errorDescription": "The minimum amount is 350 CLP",
  "items": [{}],
  "payment": { ... },
  "outsidePayment": {
    "date": "2021-03-08 00:00:00",
    "comment": "Pago por caja"
  },
  "paymentLink": "https://www.flow.cl/app/web/pay.php?token=...",
  "chargeAttemps": [{}]
}
```

### 9.2 `POST /invoice/cancel` — Cancelar invoice pendiente

**Request Body:** `apiKey`, `invoiceId` (number), `s`

### 9.3 `POST /invoice/outsidePayment` — Registrar pago externo

Marca un invoice como pagado cuando el pago no fue por Flow.

**Request Body:**

| Parámetro | Tipo   | Req | Descripción                    |
|-----------|--------|-----|--------------------------------|
| apiKey    | string | ✅  | apiKey del comercio            |
| invoiceId | number | ✅  | Identificador del Invoice      |
| date      | string | ✅  | Fecha del pago (yyyy-mm-dd)    |
| comment   | string | ❌  | Descripción del pago           |
| s         | string | ✅  | Firma                          |

### 9.4 `GET /invoice/getOverDue` — Invoices vencidos

**Query Parameters:** `apiKey`, `start`, `limit`, `s`

### 9.5 `POST /invoice/retryToCollect` — Reintentar cobro

**Request Body:** `apiKey`, `invoiceId` (number), `s`

---

## 10. Settlement (Liquidaciones) — 4 endpoints

### 10.1 `GET /settlement/getByDate` — Liquidación por fecha ⚠️ DEPRECATED

**Query Parameters:** `apiKey`, `date` (yyyy-mm-dd), `s`

### 10.2 `GET /settlement/getById` — Liquidación por ID ⚠️ DEPRECATED

**Query Parameters:** `apiKey`, `id`, `s`

### 10.3 `GET /settlement/search` — Buscar liquidaciones ⭐

**Query Parameters:**

| Parámetro  | Tipo   | Req | Descripción                                    |
|------------|--------|-----|------------------------------------------------|
| apiKey     | string | ✅  | apiKey del comercio                            |
| startDate  | string | ✅  | Fecha inicio (yyyy-mm-dd)                      |
| endDate    | string | ✅  | Fecha fin (yyyy-mm-dd)                         |
| currency   | string | ❌  | Moneda de liquidación                          |
| enterprise | string | ❌  | R=Regulada, N=No regulada                      |
| s          | string | ✅  | Firma                                          |

**Respuesta 200:**
```json
[
  {
    "id": 1001,
    "date": "2018-06-15",
    "taxId": "9999999-9",
    "name": "John Doe",
    "email": "johndoe@flow.cl",
    "currency": "CLP",
    "initial_balance": 0,
    "final_balance": 0,
    "transferred": 0,
    "billed": 0,
    "enterprise": "N"
  }
]
```

### 10.4 `GET /settlement/getByIdv2` — Liquidación por ID (v2) ⭐

Formato nuevo con resumen y detalle completo.

**Query Parameters:** `apiKey`, `id`, `s`

**Respuesta 200 — Objeto SettlementV2:**
```json
{
  "id": 1001,
  "date": "2018-06-15",
  "taxId": "9999999-9",
  "name": "John Doe",
  "email": "johndoe@flow.cl",
  "currency": "CLP",
  "initial_balance": 0,
  "final_balance": 0,
  "transferred": 0,
  "billed": 0,
  "enterprise": "N",
  "summary": {
    "transferred": [],
    "commission": [],
    "payment": [],
    "credit": [],
    "debit": [],
    "billed": []
  },
  "detail": {
    "payment": [],
    "debit": [],
    "credit": []
  }
}
```

---

## 11. Merchant (Comercios Asociados) — 5 endpoints

### 11.1 `POST /merchant/create` — Crear comercio

**Request Body:**

| Parámetro | Tipo   | Req | Descripción              |
|-----------|--------|-----|--------------------------|
| apiKey    | string | ✅  | apiKey del comercio      |
| id        | string | ✅  | ID del comercio asociado |
| name      | string | ✅  | Nombre                   |
| url       | string | ✅  | URL del comercio         |
| s         | string | ✅  | Firma                    |

**Respuesta 200 — Objeto Merchant:**
```json
{
  "id": "NEG-A",
  "name": "Negocio A",
  "url": "https://flow.cl",
  "createdate": "02-04-2020 11:52",
  "status": "0",
  "verifydate": "02-04-2020 11:52"
}
```

### 11.2 `POST /merchant/edit` — Editar comercio

**Request Body:** `apiKey`, `id`, `name`, `url`, `s`

### 11.3 `POST /merchant/delete` — Eliminar comercio

**Request Body:** `apiKey`, `id`, `s`

**Respuesta 200:**
```json
{
  "status": "ok",
  "message": "Merchant X deleted"
}
```

### 11.4 `GET /merchant/get` — Obtener comercio

**Query Parameters:** `apiKey`, `id`, `s`

### 11.5 `GET /merchant/list` — Lista de comercios

**Query Parameters:** `apiKey`, `start`, `limit`, `filter`, `status`, `s`

---

## 12. Códigos de respuesta HTTP

| Código | Descripción                |
|--------|----------------------------|
| 200    | Operación exitosa          |
| 400    | Error del API              |
| 401    | Error interno de negocio   |

---

## 13. Resumen de todos los endpoints (68 total)

| #  | Método | Endpoint                              | Sección            |
|----|--------|---------------------------------------|---------------------|
| 1  | GET    | /payment/getStatus                    | Payment             |
| 2  | GET    | /payment/getStatusByCommerceId        | Payment             |
| 3  | GET    | /payment/getStatusByFlowOrder         | Payment             |
| 4  | GET    | /payment/getPayments                  | Payment             |
| 5  | GET    | /payment/getStatusExtended            | Payment             |
| 6  | GET    | /payment/getStatusByFlowOrderExtended | Payment             |
| 7  | GET    | /payment/getTransactions              | Payment             |
| 8  | POST   | /payment/create                       | Payment             |
| 9  | POST   | /payment/createEmail                  | Payment             |
| 10 | POST   | /refund/create                        | Refund              |
| 11 | POST   | /refund/cancel                        | Refund              |
| 12 | GET    | /refund/getStatus                     | Refund              |
| 13 | POST   | /customer/create                      | Customer            |
| 14 | POST   | /customer/edit                        | Customer            |
| 15 | POST   | /customer/delete                      | Customer            |
| 16 | GET    | /customer/get                         | Customer            |
| 17 | GET    | /customer/list                        | Customer            |
| 18 | POST   | /customer/register                    | Customer            |
| 19 | GET    | /customer/getRegisterStatus           | Customer            |
| 20 | POST   | /customer/unRegister                  | Customer            |
| 21 | POST   | /customer/charge                      | Customer            |
| 22 | POST   | /customer/collect                     | Customer            |
| 23 | POST   | /customer/batchCollect                | Customer            |
| 24 | GET    | /customer/getBatchCollectStatus       | Customer            |
| 25 | POST   | /customer/reverseCharge               | Customer            |
| 26 | GET    | /customer/getCharges                  | Customer            |
| 27 | GET    | /customer/getChargeAttemps            | Customer            |
| 28 | GET    | /customer/getSubscriptions            | Customer            |
| 29 | POST   | /plans/create                         | Plans               |
| 30 | GET    | /plans/get                            | Plans               |
| 31 | POST   | /plans/edit                           | Plans               |
| 32 | POST   | /plans/delete                         | Plans               |
| 33 | GET    | /plans/list                           | Plans               |
| 34 | POST   | /subscription/create                  | Subscription        |
| 35 | GET    | /subscription/get                     | Subscription        |
| 36 | GET    | /subscription/list                    | Subscription        |
| 37 | POST   | /subscription/changeTrial             | Subscription        |
| 38 | POST   | /subscription/cancel                  | Subscription        |
| 39 | POST   | /subscription/addCoupon               | Subscription        |
| 40 | POST   | /subscription/deleteCoupon            | Subscription        |
| 41 | POST   | /subscription/addItem                 | Subscription        |
| 42 | POST   | /subscription/deleteItem              | Subscription        |
| 43 | POST   | /subscription/changePlan              | Subscription        |
| 44 | POST   | /subscription/changePlanPreview       | Subscription        |
| 45 | POST   | /subscription/changePlanCancel        | Subscription        |
| 46 | POST   | /subscription_item/create             | Subscription Items  |
| 47 | GET    | /subscription_item/get                | Subscription Items  |
| 48 | POST   | /subscription_item/edit               | Subscription Items  |
| 49 | POST   | /subscription_item/delete             | Subscription Items  |
| 50 | GET    | /subscription_item/list               | Subscription Items  |
| 51 | POST   | /coupon/create                        | Coupon              |
| 52 | POST   | /coupon/edit                          | Coupon              |
| 53 | POST   | /coupon/delete                        | Coupon              |
| 54 | GET    | /coupon/get                           | Coupon              |
| 55 | GET    | /coupon/list                          | Coupon              |
| 56 | GET    | /invoice/get                          | Invoice             |
| 57 | POST   | /invoice/cancel                       | Invoice             |
| 58 | POST   | /invoice/outsidePayment               | Invoice             |
| 59 | GET    | /invoice/getOverDue                   | Invoice             |
| 60 | POST   | /invoice/retryToCollect               | Invoice             |
| 61 | GET    | /settlement/getByDate                 | Settlement (deprecated) |
| 62 | GET    | /settlement/getById                   | Settlement (deprecated) |
| 63 | GET    | /settlement/search                    | Settlement          |
| 64 | GET    | /settlement/getByIdv2                 | Settlement          |
| 65 | POST   | /merchant/create                      | Merchant            |
| 66 | POST   | /merchant/edit                        | Merchant            |
| 67 | POST   | /merchant/delete                      | Merchant            |
| 68 | GET    | /merchant/get                         | Merchant            |
| 69 | GET    | /merchant/list                        | Merchant            |

---

## Fuentes

- [Portal de desarrolladores Flow](https://developers.flow.cl/en/)
- [Referencia API completa](https://developers.flow.cl/en/api)
- Soporte: soporte@flow.cl / +56 2 2583 0102 (opción 2)
- Licencia: Apache 2.0
