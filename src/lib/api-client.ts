// Client-side API helper
'use client'
import type { AuthUser } from '@/types'

const API_BASE = '/api/v1'

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    }
  })
  const data = await res.json().catch(() => ({ error: 'Invalid JSON response' }))
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status)
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body || {})
  }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body || {})
  }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  ApiError
}

export { ApiError }
export type { AuthUser }
