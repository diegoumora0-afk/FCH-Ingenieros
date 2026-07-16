/* ============================================================
   api.js — Centralized HTTP client with JWT auto-injection
   ============================================================ */

const API = (() => {
  const BASE_URL = 'http://localhost:8080';

  function getToken() {
    return localStorage.getItem('wms_token');
  }

  function buildHeaders(extra = {}) {
    const headers = { 'Content-Type': 'application/json', ...extra };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async function request(method, path, body = null) {
    const opts = { method, headers: buildHeaders(), cache: 'no-store' };
    if (body !== null) opts.body = JSON.stringify(body);

    let response;
    try {
      response = await fetch(`${BASE_URL}${path}`, opts);
    } catch (err) {
      throw new Error('No se pudo conectar al servidor. ¿Está el backend corriendo en localhost:8080?');
    }

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('wms_token');
      localStorage.removeItem('wms_user');
      window.dispatchEvent(new Event('wms:unauthorized'));
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    }

    if (response.status === 204) return null;

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const msg = data?.error || data?.message || `Error ${response.status}`;
      throw new Error(msg);
    }

    return data;
  }

  return {
    get:   (path)         => request('GET',    path),
    post:  (path, body)   => request('POST',   path, body),
    put:   (path, body)   => request('PUT',    path, body),
    patch: (path, body)   => request('PATCH',  path, body),
    del:   (path)         => request('DELETE', path),

    // Login doesn't need auth header
    login: async (username, password) => {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Credenciales incorrectas');
      return data;
    },
  };
})();
