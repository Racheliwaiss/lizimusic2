import { createServer } from 'http';
import { URL } from 'url';

const PORT = process.env.PORT || 4000;
const DEFAULT_ORIGIN = 'http://localhost:5174';
const users = new Map();
const sessions = new Map();

const generateToken = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
const sendJson = (res, status, payload, headers = {}) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...headers,
  });
  res.end(JSON.stringify(payload));
};

const getOrigin = (req) => {
  const origin = req.headers.origin || DEFAULT_ORIGIN;
  return origin;
};

const getCookie = (req, name) => {
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map((item) => {
    const [key, value] = item.trim().split('=');
    return [key, value];
  }));
  return cookies[name] || null;
};

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
};

const setCors = (req, res) => {
  const origin = getOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
};

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString();
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (err) {
    return {};
  }
};

const getUserFromSession = (req) => {
  const token = getBearerToken(req) || getCookie(req, 'mock_auth_token');
  if (!token) return null;
  const userId = sessions.get(token);
  if (!userId) return null;
  return users.get(userId) || null;
};

const createSession = (userId) => {
  const token = generateToken();
  sessions.set(token, userId);
  return token;
};

const clearSession = (req) => {
  const token = getBearerToken(req) || getCookie(req, 'mock_auth_token');
  if (token) {
    sessions.delete(token);
  }
};

const server = createServer(async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, { message: 'OK' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === '/signup' && req.method === 'POST') {
    const body = await parseBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();
    const metadata = body.metadata || {};

    if (!email || !password) {
      sendJson(res, 400, { message: 'Email and password are required.' });
      return;
    }

    if ([...users.values()].some((user) => user.email === email)) {
      sendJson(res, 409, { message: 'User already exists.' });
      return;
    }

    const id = generateToken();
    const user = {
      id,
      email,
      password,
      user_metadata: { ...metadata },
      created_at: new Date().toISOString(),
    };
    users.set(id, user);
    const token = createSession(id);
    sendJson(res, 200, { user, token });
    return;
  }

  if (pathname === '/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '').trim();

    if (!email || !password) {
      sendJson(res, 400, { message: 'Email and password are required.' });
      return;
    }

    const user = [...users.values()].find((candidate) => candidate.email === email && candidate.password === password);
    if (!user) {
      sendJson(res, 401, { message: 'Invalid email or password.' });
      return;
    }

    const token = createSession(user.id);
    sendJson(res, 200, { user, token });
    return;
  }

  if (pathname === '/session' && req.method === 'GET') {
    const user = getUserFromSession(req);
    sendJson(res, 200, { session: user ? { user } : null });
    return;
  }

  if (pathname === '/logout' && req.method === 'POST') {
    clearSession(req);
    sendJson(res, 200, { error: null });
    return;
  }

  if (pathname === '/user' && req.method === 'PATCH') {
    const user = getUserFromSession(req);
    if (!user) {
      sendJson(res, 401, { message: 'Not authenticated.' });
      return;
    }

    const body = await parseBody(req);
    const updates = body.updates || {};
    user.user_metadata = { ...user.user_metadata, ...updates };
    users.set(user.id, user);
    sendJson(res, 200, { user });
    return;
  }

  sendJson(res, 404, { message: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Mock auth server listening on http://localhost:${PORT}`);
});
