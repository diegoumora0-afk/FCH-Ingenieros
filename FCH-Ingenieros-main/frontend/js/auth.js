/* ============================================================
   auth.js — Session management: login, logout, persistence
   ============================================================ */

const Auth = (() => {
  const TOKEN_KEY = 'wms_token';
  const USER_KEY  = 'wms_user';

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch { return null; }
  }

  function isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY) && !!getUser();
  }

  function saveSession(data) {
    // LoginResponse: { token, username, rol, nombreCompleto }
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      username:       data.username,
      rol:            data.rol,
      nombreCompleto: data.nombreCompleto,
    }));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function login(username, password) {
    const data = await API.login(username, password);
    saveSession(data);
    return data;
  }

  function logout() {
    clearSession();
  }

  return { getUser, isLoggedIn, login, logout };
})();
