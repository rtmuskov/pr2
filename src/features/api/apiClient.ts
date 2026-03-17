import { getStoredAccessToken } from '../auth/authStorage';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

type RequestJsonOptions = {
  method?: string;
  body?: unknown;
  includeAuth?: boolean;
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message ?? 'Request failed';
  } catch {
    return 'Request failed';
  }
}

export async function requestJson<T>(
  path: string,
  options: RequestJsonOptions = {},
): Promise<T> {
  const headers: HeadersInit = {};

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.includeAuth !== false) {
    const token = getStoredAccessToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Не удалось подключиться к серверу. Проверьте, что backend запущен на localhost:4000.');
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as T;
}
