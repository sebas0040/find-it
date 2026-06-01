# Frontend Angular

## Ubicacion

```text
frontend/app/
├── angular.json
├── package.json
└── src/app/
```

## Stack

- Angular 21
- RxJS
- Leaflet
- TypeScript
- Zone.js
- Vitest

## Configuracion Global

`src/app/app.config.ts` registra:

- `provideZoneChangeDetection()`
- `provideRouter(routes)`
- `provideHttpClient(withInterceptors([jwtInterceptor]))`

`src/app/core/constants/api.constants.ts` define:

```ts
API_BASE_URL = 'http://localhost:8000/api/v1'
AUTH_API_URL = 'http://localhost:8000/api/auth'
```

## Rutas

Publicas:

- `/login`
- `/register`
- `/auth/login`
- `/auth/register`

Autenticadas:

- `/search`
- `/map`
- `/favorites`
- `/profile`
- `/stores/:id`

Tienda:

- `/dashboard`
- `/dashboard/profile`
- `/dashboard/store-setup`
- `/dashboard/inventory`

## Guards

- `authGuard`: exige usuario autenticado.
- `roleGuard`: exige rol esperado.
- `rootRedirectGuard`: redirige `/` segun estado de autenticacion.

## Servicios Core

- `AuthService`
- `SearchService`
- `ProductService`
- `StoreService`
- `InventoryService`
- `ReviewService`
- `LocationService`

## Interceptor JWT

El interceptor agrega el token a las peticiones protegidas:

```http
Authorization: Bearer <access_token>
```

## Modulos UI

Cliente:

- busqueda;
- mapa;
- favoritos;
- detalle de tienda;
- reviews.

Tienda:

- dashboard;
- setup;
- perfil;
- inventario.

Perfil:

- perfil de usuario autenticado.

