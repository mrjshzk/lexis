const BASE = "/api";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`${options.method ?? "GET"} ${url} failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function getUsers() {
  return request(`${BASE}/users`);
}

export async function getUser(id) {
  return request(`${BASE}/users/${encodeURIComponent(id)}`);
}

export async function createUser(data) {
  return request(`${BASE}/users`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(id, data) {
  return request(`${BASE}/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id) {
  return request(`${BASE}/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function getSessionUser() {
  const entry = await request(`${BASE}/currentSession/session`);
  console.log(entry);
  return entry?.user ?? null;
}

export async function setSessionUser(user) {
  await request(`${BASE}/currentSession/session`, {
    method: "PUT",
    body: JSON.stringify({ id: "session", user }),
  });
}
