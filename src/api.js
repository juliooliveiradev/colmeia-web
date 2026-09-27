const TOKEN_KEY = "colmeia_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem("colmeia_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("colmeia_user");
}

export function getStoredUser() {
  const raw = localStorage.getItem("colmeia_user");
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, { ...options, headers });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.detail || "Não foi possível concluir a operação.";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}

export const api = {
  login(email, password) {
    const body = new URLSearchParams();
    body.set("username", email);
    body.set("password", password);
    return request("/api/auth/login", { method: "POST", body });
  },
  register(payload) {
    return request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
  },
  me() {
    return request("/api/auth/me");
  },
  summary() {
    return request("/api/dashboard/summary");
  },
  listHives(params = {}) {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value != null))
    );
    return request(`/api/hives?${query.toString()}`);
  },
  getHive(id) {
    return request(`/api/hives/${id}`);
  },
  createHive(payload) {
    return request("/api/hives", { method: "POST", body: JSON.stringify(payload) });
  },
  updateHive(id, payload) {
    return request(`/api/hives/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteHive(id) {
    return request(`/api/hives/${id}`, { method: "DELETE" });
  },
  listInspections(hiveId) {
    const suffix = hiveId ? `?hive_id=${hiveId}` : "";
    return request(`/api/inspections${suffix}`);
  },
  createInspection(payload) {
    return request("/api/inspections", { method: "POST", body: JSON.stringify(payload) });
  },
  updateInspection(id, payload) {
    return request(`/api/inspections/${id}`, { method: "PUT", body: JSON.stringify(payload) });
  },
  deleteInspection(id) {
    return request(`/api/inspections/${id}`, { method: "DELETE" });
  },
  listHarvests(hiveId) {
    const suffix = hiveId ? `?hive_id=${hiveId}` : "";
    return request(`/api/harvests${suffix}`);
  },
  createHarvest(payload) {
    return request("/api/harvests", { method: "POST", body: JSON.stringify(payload) });
  },
  deleteHarvest(id) {
    return request(`/api/harvests/${id}`, { method: "DELETE" });
  },
};
