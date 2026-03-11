/**
 * Flow API Client — Módulo de integración con Flow.cl
 * Incluye firmado HMAC-SHA256, manejo de credenciales y llamadas a la API.
 */

const FLOW_URLS = {
  sandbox: 'https://sandbox.flow.cl/api',
  production: 'https://www.flow.cl/api',
};

// --- Credenciales (localStorage) ---

export function getFlowConfig() {
  const raw = localStorage.getItem('flow_config');
  if (!raw) return { apiKey: '', secretKey: '', environment: 'sandbox' };
  try {
    return JSON.parse(raw);
  } catch {
    return { apiKey: '', secretKey: '', environment: 'sandbox' };
  }
}

export function saveFlowConfig(config) {
  localStorage.setItem('flow_config', JSON.stringify(config));
}

export function getBaseUrl() {
  const { environment } = getFlowConfig();
  return FLOW_URLS[environment] || FLOW_URLS.sandbox;
}

// --- Firmado HMAC-SHA256 ---

async function hmacSHA256(key, message) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function signParams(params, secretKey) {
  const keys = Object.keys(params).sort();
  const toSign = keys.map((k) => `${k}${params[k]}`).join('');
  return hmacSHA256(secretKey, toSign);
}

/** Elimina parámetros con valor vacío, null o undefined antes de firmar/enviar */
function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
}

// --- Cliente API ---

/**
 * Llama a un endpoint GET de Flow.
 * @param {string} endpoint - Ej: '/payment/getStatus'
 * @param {object} params - Parámetros (sin apiKey ni s, se agregan automáticamente)
 * @returns {{ ok: boolean, status: number, data: object, raw: string, duration: number }}
 */
export async function flowGet(endpoint, params = {}) {
  const { apiKey, secretKey } = getFlowConfig();
  if (!apiKey || !secretKey) {
    return { request: null, ok: false, status: 0, data: null, raw: 'Configura tu ApiKey y SecretKey primero', duration: 0 };
  }

  const allParams = cleanParams({ ...params, apiKey });
  const s = await signParams(allParams, secretKey);
  allParams.s = s;

  const qs = new URLSearchParams(allParams).toString();
  const url = `${getBaseUrl()}${endpoint}?${qs}`;
  const timestamp = new Date().toISOString();

  const request = {
    method: 'GET',
    endpoint,
    url,
    headers: {},
    params: { ...allParams },
    timestamp,
  };

  const start = performance.now();
  try {
    const res = await fetch(url);
    const duration = Math.round(performance.now() - start);
    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
    return { request, ok: res.ok, status: res.status, data, raw, duration };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return { request, ok: false, status: 0, data: null, raw: err.message, duration };
  }
}

/**
 * Llama a un endpoint POST de Flow.
 * @param {string} endpoint - Ej: '/payment/create'
 * @param {object} params - Parámetros (sin apiKey ni s)
 * @returns {{ ok: boolean, status: number, data: object, raw: string, duration: number }}
 */
export async function flowPost(endpoint, params = {}) {
  const { apiKey, secretKey } = getFlowConfig();
  if (!apiKey || !secretKey) {
    return { request: null, ok: false, status: 0, data: null, raw: 'Configura tu ApiKey y SecretKey primero', duration: 0 };
  }

  const allParams = cleanParams({ ...params, apiKey });
  const s = await signParams(allParams, secretKey);
  allParams.s = s;

  const url = `${getBaseUrl()}${endpoint}`;
  const body = new URLSearchParams(allParams);
  const timestamp = new Date().toISOString();
  const requestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };

  const request = {
    method: 'POST',
    endpoint,
    url,
    headers: requestHeaders,
    params: { ...allParams },
    timestamp,
  };

  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body,
    });
    const duration = Math.round(performance.now() - start);
    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
    return { request, ok: res.ok, status: res.status, data, raw, duration };
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    return { request, ok: false, status: 0, data: null, raw: err.message, duration };
  }
}
