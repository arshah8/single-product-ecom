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

/**
 * Helper to resolve image URLs
 */
export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Derive backend base URL from API_BASE_URL (remove /api/v1 suffix)
    const backendUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * API methods
 */
export const api = {
    // Products
    getProducts: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiRequest(`/products${queryString ? `?${queryString}` : ''}`);
    },

    getProduct: (productId) => {
        return apiRequest(`/products/${productId}`);
    },

    // Categories
    getCategories: () => {
        return apiRequest('/categories');
    },

    createCategory: (categoryData) => {
        return apiRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData),
        });
    },

    updateCategory: (id, categoryData) => {
        return apiRequest(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData),
        });
    },

    deleteCategory: (id) => {
        return apiRequest(`/categories/${id}`, {
            method: 'DELETE',
        });
    },

    // Admin product operations
    createProduct: (productData) => {
        return apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    },

    updateProduct: (productId, productData) => {
        return apiRequest(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    },

    deleteProduct: (productId) => {
        return apiRequest(`/products/${productId}`, {
            method: 'DELETE',
        });
    },

    // Cart
    getCart: () => {
        return apiRequest('/cart');
    },

    addToCart: (productId, quantity) => {
        return apiRequest('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    },

    updateCartItem: (productId, quantity) => {
        return apiRequest('/cart', {
            method: 'PUT',
            body: JSON.stringify({ productId, quantity }),
        });
    },

    removeFromCart: (productId) => {
        return apiRequest(`/cart?productId=${productId}`, {
            method: 'DELETE',
        });
    },

    // Wishlist
    getWishlists: (wishlistId = null) => {
        const query = wishlistId ? `?wishlistId=${wishlistId}` : '';
        return apiRequest(`/wishlists${query}`);
    },

    getWishlistById: (wishlistId) => {
        return apiRequest(`/wishlists/${wishlistId}`);
    },

    createWishlist: (name) => {
        return apiRequest('/wishlists', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    addToWishlist: (productId, wishlistId = null) => {
        const payload = { productId };
        if (wishlistId) payload.wishlistId = wishlistId;
        return apiRequest('/wishlists', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    removeFromWishlist: (wishlistId, productId) => {
        return apiRequest(`/wishlists/${wishlistId}/products/${productId}`, {
            method: 'DELETE',
        });
    },

    updateWishlist: (wishlistId, data) => {
        return apiRequest(`/wishlists/${wishlistId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteWishlist: (wishlistId) => {
        return apiRequest(`/wishlists/${wishlistId}`, {
            method: 'DELETE',
        });
    },

    shareWishlist: (wishlistId) => {
        return apiRequest(`/wishlists/${wishlistId}/share`, {
            method: 'POST',
        });
    },

    revokeWishlistShare: (wishlistId) => {
        return apiRequest(`/wishlists/${wishlistId}/share`, {
            method: 'DELETE',
        });
    },

    viewSharedWishlist: (shareToken) => {
        return apiRequest(`/wishlists/shared/${shareToken}`);
    },

    addWishlistToCart: (wishlistId, productIds = null) => {
        const payload = {};
        if (Array.isArray(productIds)) payload.productIds = productIds;
        return apiRequest(`/wishlists/${wishlistId}/add-to-cart`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    // Checkout
    createCheckout: (data) => {
        return apiRequest('/checkout', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    confirmCheckout: (data) => {
        return apiRequest('/checkout/confirm', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Auth
    register: (data) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    login: (data) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    forgotPassword: (email) => {
        return apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    resetPassword: (token, password) => {
        return apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
        });
    },

    logout: () => {
        const refreshToken = localStorage.getItem('refreshToken');
        return apiRequest('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    },

    // User
    getProfile: () => {
        return apiRequest('/users/me');
    },

    updateProfile: (data) => {
        return apiRequest('/users/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    getOrderHistory: (page = 1, limit = 10) => {
        return apiRequest(`/users/me/orders?page=${page}&limit=${limit}`);
    },

    // Orders (new endpoints)
    getOrders: (page = 1, limit = 20) => {
        return apiRequest(`/orders?page=${page}&limit=${limit}`);
    },

    getOrder: (orderNumber) => {
        return apiRequest(`/orders/${orderNumber}`);
    },

    trackOrder: (orderNumber) => {
        return apiRequest(`/orders/${orderNumber}/track`);
    },

    updateOrderStatus: (orderNumber, status) => {
        return apiRequest(`/orders/${orderNumber}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },

    // File Upload
    uploadImage: (formData) => {
        return apiRequest('/upload', {
            method: 'POST',
            body: formData,
            headers: {
                // Fetch will automatically set the correct Content-Type with boundary for FormData
                // if we leave it undefined in the headers object
            }
        });
    },
};

export default api;
