const apiBaseUrl = import.meta.env.VITE_AUTH_API_URL || '';

const authRequest = async (path, body, method = 'POST') => {
  if (!apiBaseUrl) {
    throw new Error('VITE_AUTH_API_URL is not configured. Falling back to mock auth.');
  }

  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Authentication request failed');
  }

  return data;
};

export const authApi = {
  getSession: () => authRequest('/session', null, 'GET'),
  signUp: (email, password, metadata) => authRequest('/signup', { email, password, metadata }),
  signIn: (email, password) => authRequest('/login', { email, password }),
  signOut: () => authRequest('/logout', null, 'POST'),
  updateUser: (updates) => authRequest('/user', { updates }, 'PATCH'),
};
