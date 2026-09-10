const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");

export function libraryApiUrl(endpoint: string) {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) return endpoint;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (API_BASE.endsWith("/api") && path.startsWith("/api/")) return `${API_BASE}${path.slice(4)}`;
  return `${API_BASE}${path}`;
}

export function fetchLibraryApi(endpoint: string, options: RequestInit = {}) {
  return fetch(libraryApiUrl(endpoint), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}
