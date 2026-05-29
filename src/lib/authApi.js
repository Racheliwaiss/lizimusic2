const apiBaseUrl = import.meta.env.VITE_AUTH_API_URL || '';
const TOKEN_KEY = 'lizi_auth_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const authRequest = async (path, body, method = 'POST') => {
  if (!apiBaseUrl) {
    throw new Error('VITE_AUTH_API_URL is not configured. Falling back to mock auth.');
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Authentication request failed');
  }

  if (data?.token) {
    setToken(data.token);
  }

  return data;
};

export const authApi = {
  getSession: () => authRequest('/session', null, 'GET'),
  signUp: (email, password, metadata) => authRequest('/signup', { email, password, metadata }),
  signIn: (email, password) => authRequest('/login', { email, password }),
  signOut: async () => {
    const result = await authRequest('/logout', null, 'POST');
    setToken(null);
    return result;
  },
  updateUser: (updates) => authRequest('/user', { updates }, 'PATCH'),
};
