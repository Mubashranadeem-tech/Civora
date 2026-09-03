const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('civora_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (authenticated) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false),
  register: (data: object) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }, false),
  getMe: () => request('/auth/me'),

  // Categories
  getCategories: () => request('/categories', {}, false),
  getCategoryTypes: (categoryId: string) => request(`/categories/${categoryId}/types`, {}, false),

  // Problems
  createProblem: (formData: FormData) =>
    request('/problems', { method: 'POST', body: formData }),
  listProblems: (params?: Record<string, any>) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request(`/problems${qs}`);
  },
  getProblem: (id: string) => request(`/problems/${id}`),
  trackProblem: (civId: string) => request(`/problems/track/${civId}`, {}, false),
  updateProblemStatus: (id: string, data: object) =>
    request(`/problems/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  reviewProblem: (id: string, data: object) =>
    request(`/problems/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
  updateCivicReport: (id: string, data: object) =>
    request(`/problems/${id}/civic-report`, { method: 'PATCH', body: JSON.stringify(data) }),
  getProblemStats: () => request('/problems/stats/overview'),

  // AI
  getAiStatus: () => request('/ai/status'),
  analyzeWithAI: (id: string) =>
    request(`/ai/problems/${id}/analyze`, { method: 'POST' }),
  researchWithAI: (id: string) =>
    request(`/ai/problems/${id}/research`, { method: 'POST' }),

  // Publishing
  getPublishingStatus: () => request('/publishing/status'),
  publishProblem: (id: string, platforms?: string[]) =>
    request(`/publishing/problems/${id}/publish`, { method: 'POST', body: JSON.stringify({ platforms }) }),
  getPublishingResults: (id: string) => request(`/publishing/problems/${id}/results`),
  retryPublishing: (jobId: string) =>
    request(`/publishing/jobs/${jobId}/retry`, { method: 'POST' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  getUnreadCount: () => request<{ count: number }>('/notifications/unread-count'),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Analytics
  getAnalytics: () => request('/analytics/dashboard'),

  // Users (admin)
  getUsers: () => request('/users'),
};
