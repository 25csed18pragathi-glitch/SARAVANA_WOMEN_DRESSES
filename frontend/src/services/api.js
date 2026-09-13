/**
 * API service layer to communicate with the Saravana Women Dresses backend
 */

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const API_BASE_URL = (
  configuredApiBaseUrl ||
  (import.meta.env.DEV
    ? 'http://localhost:5000'
    : window.location.origin)
).replace(/\/+$/, '');

/**
 * Universal request helper that injects auth tokens
 */
async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const token = localStorage.getItem('swd_auth_token');

  const headers = {
    ...(options.headers || {})
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...options,
    headers
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}${cleanEndpoint}`,
      mergedOptions
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message || `HTTP error ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      `API Error on ${cleanEndpoint}:`,
      error.message
    );

    throw error;
  }
}

/**
 * 1. Health Check
 */
export async function fetchHealth() {
  return request('/api/health');
}

export async function fetchShopSettings() {
  return request('/api/shop-settings');
}

export async function fetchAdminShopSettings() {
  return request('/api/admin/shop-settings');
}

export async function updateAdminShopSettings(settings) {
  return request('/api/admin/shop-settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  });
}

/**
 * 2. Authentication API
 */
export async function loginUser(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });
}

export async function registerUser(data) {
  const payload =
    typeof data === 'object'
      ? data
      : {
          name: arguments[0],
          email: arguments[1],
          password: arguments[2],
          phone: arguments[3]
        };

  return request('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export async function fetchCurrentUser() {
  return request('/api/auth/me');
}

export async function updateUserProfile(data) {
  return request('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

export async function changeUserPassword(passwords) {
  return request('/api/auth/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(passwords)
  });
}

export async function fetchUserAddresses() {
  return request('/api/auth/addresses');
}

export async function createUserAddress(addressData) {
  return request('/api/auth/addresses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(addressData)
  });
}

export async function updateUserAddress(addressId, addressData) {
  return request(
    `/api/auth/addresses/${encodeURIComponent(addressId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addressData)
    }
  );
}

export async function deleteUserAddress(addressId) {
  return request(
    `/api/auth/addresses/${encodeURIComponent(addressId)}`,
    {
      method: 'DELETE'
    }
  );
}

export async function setDefaultUserAddress(addressId) {
  return request(
    `/api/auth/addresses/${encodeURIComponent(addressId)}/default`,
    {
      method: 'PATCH'
    }
  );
}

export async function fetchMyOrders() {
  return request('/api/orders/my-orders');
}

export async function fetchMyOrderById(id) {
  return request(`/api/orders/${encodeURIComponent(id)}`);
}

export async function createCustomerOrder(orderData) {
  return request('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
}

export async function fetchCart() {
  return request('/api/cart');
}

export async function saveCart(items) {
  return request('/api/cart', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items
    })
  });
}

export async function clearServerCart() {
  return request('/api/cart', {
    method: 'DELETE'
  });
}

export async function createRazorpayOrder(
  items,
  shippingAddress
) {
  return request('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      items,
      shippingAddress
    })
  });
}

export async function verifyRazorpayPayment(paymentData) {
  return request('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  });
}

export async function fetchProductReviews(productId) {
  return request(
    `/api/reviews/product/${encodeURIComponent(productId)}`
  );
}

export async function submitProductReview(reviewData) {
  return request('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reviewData)
  });
}

export async function fetchMyReviews() {
  return request('/api/reviews/mine');
}

/**
 * 3. Products API
 */
export async function fetchProducts(filters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      query.append(key, value);
    }
  });

  const queryString = query.toString();

  const endpoint = queryString
    ? `/api/products?${queryString}`
    : '/api/products';

  return request(endpoint);
}

export async function fetchProductById(id) {
  return request(
    `/api/products/${encodeURIComponent(id)}`
  );
}

export async function createProduct(productData) {
  return request('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });
}

export async function updateProduct(id, productData) {
  return request(
    `/api/products/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    }
  );
}

export async function deleteProduct(id) {
  return request(
    `/api/products/${encodeURIComponent(id)}`,
    {
      method: 'DELETE'
    }
  );
}

/**
 * 4. Categories API
 */
export async function fetchCategories(params = {}) {
  const query = new URLSearchParams();

  if (params.featured !== undefined) {
    query.append('featured', params.featured);
  }

  const queryString = query.toString();

  const endpoint = queryString
    ? `/api/categories?${queryString}`
    : '/api/categories';

  return request(endpoint);
}

export async function fetchCategoryById(idOrSlug) {
  return request(
    `/api/categories/${encodeURIComponent(idOrSlug)}`
  );
}

export async function createCategory(categoryData) {
  return request('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(categoryData)
  });
}

export async function updateCategory(
  idOrSlug,
  categoryData
) {
  return request(
    `/api/categories/${encodeURIComponent(idOrSlug)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    }
  );
}

export async function deleteCategory(idOrSlug) {
  return request(
    `/api/categories/${encodeURIComponent(idOrSlug)}`,
    {
      method: 'DELETE'
    }
  );
}

/**
 * 5. Brands API
 */
export async function fetchBrands() {
  return request('/api/brands');
}

export async function fetchBrandById(idOrSlug) {
  return request(
    `/api/brands/${encodeURIComponent(idOrSlug)}`
  );
}

export async function createBrand(brandData) {
  return request('/api/brands', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(brandData)
  });
}

export async function updateBrand(
  idOrSlug,
  brandData
) {
  return request(
    `/api/brands/${encodeURIComponent(idOrSlug)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(brandData)
    }
  );
}

export async function deleteBrand(idOrSlug) {
  return request(
    `/api/brands/${encodeURIComponent(idOrSlug)}`,
    {
      method: 'DELETE'
    }
  );
}

/**
 * 6. Admin Panel APIs
 */
export async function fetchAdminDashboard() {
  return request('/api/admin/dashboard');
}

export async function fetchAdminCustomers(params = {}) {
  const query = new URLSearchParams();

  if (params.search) {
    query.append('search', params.search);
  }

  const queryString = query.toString();

  return request(
    queryString
      ? `/api/admin/customers?${queryString}`
      : '/api/admin/customers'
  );
}

export async function fetchAdminCustomerById(id) {
  return request(
    `/api/admin/customers/${encodeURIComponent(id)}`
  );
}

export async function fetchAdminOrders(params = {}) {
  const query = new URLSearchParams();

  if (params.status) {
    query.append('status', params.status);
  }

  if (params.search) {
    query.append('search', params.search);
  }

  if (params.page) {
    query.append('page', params.page);
  }

  if (params.limit) {
    query.append('limit', params.limit);
  }

  const queryString = query.toString();

  return request(
    queryString
      ? `/api/admin/orders?${queryString}`
      : '/api/admin/orders'
  );
}

export async function fetchAdminOrderById(id) {
  return request(
    `/api/admin/orders/${encodeURIComponent(id)}`
  );
}

export async function updateAdminOrderStatus(
  id,
  status,
  note = ''
) {
  return request(
    `/api/admin/orders/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status,
        note
      })
    }
  );
}

export async function updateAdminProductStock(
  id,
  stock
) {
  return request(
    `/api/admin/products/${encodeURIComponent(id)}/stock`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stock
      })
    }
  );
}

export async function fetchAdminReviews(params = {}) {
  const query = new URLSearchParams();

  if (params.status) {
    query.append('status', params.status);
  }

  if (params.search) {
    query.append('search', params.search);
  }

  const queryString = query.toString();

  return request(
    queryString
      ? `/api/admin/reviews?${queryString}`
      : '/api/admin/reviews'
  );
}

export async function updateAdminReviewStatus(
  id,
  status
) {
  return request(
    `/api/admin/reviews/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status
      })
    }
  );
}

export async function deleteAdminReview(id) {
  return request(
    `/api/admin/reviews/${encodeURIComponent(id)}`,
    {
      method: 'DELETE'
    }
  );
}

export async function fetchAdminPaymentTransactions() {
  return request('/api/payments/transactions');
}

/**
 * 7. Image Upload API
 */
export async function uploadImageFile(
  file,
  folder = 'saravana-women-dresses/products'
) {
  const formData = new FormData();

  formData.append('image', file);
  formData.append('folder', folder);

  return request('/api/upload', {
    method: 'POST',
    body: formData
  });
}