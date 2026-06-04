export function apiBase(): string {
  const port = process.env.PORT ?? "3099";
  const host = process.env.HOST ?? "127.0.0.1";
  return `http://${host}:${port}`;
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${apiBase()}${path}`;
  return fetch(url, init);
}
