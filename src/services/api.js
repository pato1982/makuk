const API_URL = import.meta.env.VITE_API_URL || '';

// --- Manejo de tokens ---

function getAccessToken() {
  return localStorage.getItem('makuk_access_token');
}

function getRefreshToken() {
  return localStorage.getItem('makuk_refresh_token');
}

function saveTokens(accessToken, refreshToken) {
  localStorage.setItem('makuk_access_token', accessToken);
  if (refreshToken) {
    localStorage.setItem('makuk_refresh_token', refreshToken);
  }
}

function clearTokens() {
  localStorage.removeItem('makuk_access_token');
  localStorage.removeItem('makuk_refresh_token');
}

// --- Fetch con auto-refresh ---

async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const headers = { ...options.headers };

  // No poner Content-Type si es FormData (multer lo necesita así)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
  }

  // Si el token expiró, intentar refresh
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // Reintentar con el nuevo token
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      try {
        res = await fetch(url, { ...options, headers });
      } catch {
        throw new Error('Error de conexión. Verifica tu internet e intenta de nuevo.');
      }
    } else {
      // Refresh falló — limpiar y redirigir a login
      clearTokens();
      window.location.href = '/admin/login';
      throw new Error('Sesión expirada');
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }

  return res.json();
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: getRefreshToken() })
    });

    if (!res.ok) return false;

    const data = await res.json();
    saveTokens(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// --- Auth ---

export async function loginApi(email, password) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  saveTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logoutApi() {
  const refreshToken = getRefreshToken();
  try {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  } catch {
    // Ignorar errores de logout
  }
  clearTokens();
}

export async function getMe() {
  return apiFetch('/api/auth/me');
}

export async function requestRecovery(email) {
  return apiFetch('/api/auth/recovery', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

// --- Contenido público ---

export async function fetchContent() {
  return apiFetch('/api/content');
}

// --- Admin CRUD ---

// Mapeo de nombres del frontend (camelCase) a rutas del backend (kebab-case)
const sectionRoutes = {
  uniquePieces: 'unique-pieces',
  productsPage: 'products-page'
};

export async function saveSection(section, data) {
  const route = sectionRoutes[section] || section;
  return apiFetch(`/api/admin/${route}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function getAdminStats() {
  return apiFetch('/api/admin/stats');
}

export async function getAdminOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/admin/orders${qs ? '?' + qs : ''}`);
}

export async function getAdminOrderDetail(commerceOrder) {
  return apiFetch(`/api/admin/orders/${encodeURIComponent(commerceOrder)}`);
}

// --- Contacto ---

export async function sendContactForm(data) {
  return apiFetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// --- Upload ---

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return apiFetch('/api/upload', {
    method: 'POST',
    body: formData
  });
}
