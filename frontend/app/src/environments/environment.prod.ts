export const environment = {
  production: true,
  apiUrl: 'https://api.find-it.app/api',
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
