import axios from 'axios'

/**
 * Backend base URL.
 * - Local dev: falls back to http://localhost:8080/api
 * - Vercel/Netlify: set VITE_API_BASE_URL to e.g. https://customers-api.onrender.com/api
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
// Trim trailing slash so we can safely append paths like "/customers".
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

/** Normalises backend/network errors into a readable message. */
function toErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      return `Cannot reach the API at ${API_BASE_URL}. Is the backend running and CORS configured?`
    }
    const data = error.response?.data
    if (data?.errors && typeof data.errors === 'object') {
      const first = Object.values(data.errors)[0]
      if (first) return first
    }
    if (data?.message) return data.message
    if (error.response?.status) return `Request failed (HTTP ${error.response.status})`
    return error.message
  }
  return error?.message || 'Something went wrong'
}

/** Wraps the axios promise so callers always get clean data or a readable Error. */
async function request(promise) {
  try {
    const { data } = await promise
    return data
  } catch (error) {
    throw new Error(toErrorMessage(error))
  }
}

/** Strips the form down to the exact shape the API expects (blank strings -> null). */
export function toCustomerPayload(form) {
  const clean = (value) => {
    const trimmed = (value ?? '').toString().trim()
    return trimmed === '' ? null : trimmed
  }
  return {
    firstName: (form.firstName ?? '').trim(),
    lastName: (form.lastName ?? '').trim(),
    dateOfBirth: clean(form.dateOfBirth),
    phoneNumber: clean(form.phoneNumber),
    email: clean(form.email),
    ban: clean(form.ban),
  }
}

const customerService = {
  /** GET /customers?search=... */
  list: (search = '') =>
    request(api.get('/customers', { params: search ? { search } : {} })),

  /** GET /customers/:id */
  get: (id) => request(api.get(`/customers/${id}`)),

  /** POST /customers */
  create: (payload) => request(api.post('/customers', payload)),

  /** PUT /customers/:id */
  update: (id, payload) => request(api.put(`/customers/${id}`, payload)),

  /** DELETE /customers/:id */
  remove: (id) => request(api.delete(`/customers/${id}`)),
}

export default customerService
