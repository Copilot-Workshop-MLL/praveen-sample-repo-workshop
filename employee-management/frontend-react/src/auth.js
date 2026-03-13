// Auth helpers used across the app
export const getToken = () => localStorage.getItem('ems_token');
export const getUser = () => localStorage.getItem('ems_user') || 'Admin';
export const setAuth = (token, user) => {
  localStorage.setItem('ems_token', token);
  localStorage.setItem('ems_user', user);
};
export const clearAuth = () => localStorage.removeItem('ems_token') || localStorage.removeItem('ems_user');
export const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export const apiFetch = async (path, options = {}) => {
  const res = await fetch(path, {
    ...options,
    headers: { ...authHeaders(), 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.message || JSON.stringify(data.errors) };
  return data;
};
