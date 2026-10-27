// Tokens never enter the browser. This endpoint validates the HttpOnly session
// with Supabase and applies the owner allowlist on the local server.
export async function readEditorSession(request = fetch) {
  try {
    const response = await request('/auth/session', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) return null;
    const session = await response.json();
    return session.authenticated === true && typeof session.csrf === 'string' && session.csrf ? session : null;
  } catch { return null; }
}

export function editorPath(path) {
  return /^\/editor(?:\/[A-Za-z0-9_-]+)?\/?$/.test(path);
}
