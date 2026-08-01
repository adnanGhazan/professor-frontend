/**
 * Core API Client Helper
 */

export interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function fetcher<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...customConfig } = options;

  let queryString = "";
  if (params) {
    const searchParams = new URLSearchParams(params);
    queryString = `?${searchParams.toString()}`;
  }

  const response = await fetch(`${url}${queryString}`, {
    headers: {
      "Content-Type": "application/json",
      ...customConfig.headers,
    },
    ...customConfig,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
