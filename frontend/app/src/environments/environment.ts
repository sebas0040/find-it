export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  auth: {
    tokenEndpoint: '/auth/login',
    tokenRefreshEndpoint: '/auth/refresh',
    registerEndpoint: '/auth/register',
  },
  endpoints: {
    search: '/v1/search/products/',
    stores: '/v1/stores/',
    products: '/v1/products/',
    categories: '/v1/categories/',
  },
};
