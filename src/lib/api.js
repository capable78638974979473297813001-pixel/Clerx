// Thin fetch wrapper. Cookies (session) travel automatically with credentials.
async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),

  // auth
  me: () => request('GET', '/auth/me'),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  signup: (payload) => request('POST', '/auth/signup', payload),
  logout: () => request('POST', '/auth/logout'),
  demo: () => request('POST', '/auth/demo'),

  // workspace (leader, authed)
  workspace: () => request('GET', '/company'),
  updateCompany: (b) => request('PATCH', '/company', b),
  verifyCompany: (b) => request('POST', '/company/verify', b),
  seed: () => request('POST', '/company/seed'),
  resetWorkspace: () => request('POST', '/company/reset'),

  addEmployee: (b) => request('POST', '/employees', b),
  updateEmployee: (id, b) => request('PATCH', `/employees/${id}`, b),
  removeEmployee: (id) => request('DELETE', `/employees/${id}`),

  connectSource: (kind) => request('POST', '/sources', { kind }),
  connectNotion: (token) => request('POST', '/sources', { kind: 'notion', token }),
  connectSlack: (token) => request('POST', '/sources', { kind: 'slack', token }),
  uploadFiles: (files) => request('POST', '/sources/upload/files', { files }),
  resyncSource: (kind) => request('POST', `/sources/${kind}/resync`),

  // employee (public, code-gated)
  join: (code) => request('POST', '/join', { code }),
  ask: (code, question) => request('POST', '/ask', { code, question }),
}
