const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function api(endpoint, options = {}) {
  const { headers = {}, body, ...rest } = options;

  const isFormData = body instanceof FormData;

  const config = {
    credentials: 'include',
    headers: {
      ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...rest,
  };

  if (body !== undefined) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  let data = {};
  try {
    data = await response.json();
  } catch {
    // non-JSON response
  }

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Something went wrong',
      response.status,
      data.errors || []
    );
  }

  return data;
}

export default api;
