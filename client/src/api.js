const ENDPOINT = "/api/messages";

async function request(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.error ?? `El servidor respondio ${response.status}.`);
    error.status = response.status;
    error.fields = payload?.fields ?? {};
    throw error;
  }

  return payload;
}

export function fetchMessages(signal) {
  return request(ENDPOINT, { signal });
}

export function fetchMessage(id, signal) {
  return request(`${ENDPOINT}/${encodeURIComponent(id)}`, { signal });
}

export function createMessage({ user, text }) {
  return request(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, text }),
  });
}
