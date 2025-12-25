const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const GUEST_SESSION_STORAGE_KEY = 'guestSessionId';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onTokenRefreshed(accessToken) {
    refreshSubscribers.map((cb) => cb(accessToken));
    refreshSubscribers = [];
}

let cachedGuestSessionId = null;
function getGuestSessionId() {
    if (cachedGuestSessionId) return cachedGuestSessionId;
    try {
        const existing = localStorage.getItem(GUEST_SESSION_STORAGE_KEY);
        if (existing) {
            cachedGuestSessionId = existing;
            return cachedGuestSessionId;
        }
        const generated = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(GUEST_SESSION_STORAGE_KEY, generated);
        cachedGuestSessionId = generated;
        return cachedGuestSessionId;
    } catch {
        cachedGuestSessionId =
            crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        return cachedGuestSessionId;
    }
}
export function clearGuestSessionId() {
    cachedGuestSessionId = null;
    try {
        localStorage.removeItem(GUEST_SESSION_STORAGE_KEY);
    } catch {
    }
}

/**
 * Create fetch request with default options
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session management
    };

    // Guest session id
    defaultOptions.headers['X-Session-Id'] = getGuestSessionId();

    // Add Authorization header if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    // If body is FormData, remove Content-Type header to let browser set it with boundary
    if (options.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized
        if (response.status === 401 && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/refresh-token')) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        config.headers['Authorization'] = `Bearer ${token}`;
                        resolve(apiRequest(endpoint, { ...options, _retry: true }));
                    });
                });
            }

            options._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        const { accessToken, refreshToken: newRefreshToken } = refreshData;

                        localStorage.setItem('authToken', accessToken);
                        localStorage.setItem('refreshToken', newRefreshToken);

                        isRefreshing = false;
                        onTokenRefreshed(accessToken);

                        config.headers['Authorization'] = `Bearer ${accessToken}`;
                        return apiRequest(endpoint, options);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed', refreshError);
                }
            }

            isRefreshing = false;
            // If refresh fails, we might want to logout the user, but we'll let the 401 propagate
            // and let the UI handle it (e.g., redirect to login)
        }

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        }

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.error || 'An error occurred');
            error.status = response.status;
            error.details = data;
            throw error;
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to server');
        }
        throw error;
    }
}