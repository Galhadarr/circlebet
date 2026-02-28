import { useAuthStore } from "@/stores/auth-store";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new ApiError("Unauthorized", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.detail || `Request failed (${res.status})`,
      res.status
    );
  }

  return res.json();
}

async function uploadFile<T>(path: string, file: File): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${BASE_URL}${path}`, { method: "POST", headers, body });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new ApiError("Unauthorized", 401);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.detail || `Upload failed (${res.status})`, res.status);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  upload: <T>(path: string, file: File) => uploadFile<T>(path, file),
  baseUrl: BASE_URL,
};

export { ApiError };
