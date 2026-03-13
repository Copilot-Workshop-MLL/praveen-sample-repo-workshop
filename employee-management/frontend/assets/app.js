function getToken() { return localStorage.getItem('token'); }
function authHeaders() { return { 'Authorization': 'Bearer ' + getToken() }; }
function requireAuth() {
  if (!getToken()) window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }
});
