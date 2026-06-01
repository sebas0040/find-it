# Arquitectura Del Sistema

Find-It usa una arquitectura cliente-servidor:

```text
Angular 21 SPA
   |
   | HTTP JSON + JWT Bearer
   v
Django REST Framework
   |
   | ORM + GIS queries
   v
PostgreSQL + PostGIS

Redis queda disponible para cache, Celery y tareas asincronas.
```

## Backend

El backend esta en `backend/` y usa Django + DRF. Las apps principales estan en `backend/apps/`:

- `users`: autenticacion, usuarios, roles y permisos.
- `stores`: tiendas y geolocalizacion.
- `products`: catalogo de productos.
- `categories`: categorias.
- `inventory`: relacion tienda-producto con precio, stock y disponibilidad.
- `reviews`: reviews y favoritos.
- `search`: busqueda geolocalizada de productos.
- `core`: utilidades y comandos de seed.

El patron historico del backend separa:

- models: entidades persistidas.
- selectors: consultas de lectura.
- services: operaciones de escritura y reglas de negocio.
- serializers: validacion y representacion.
- views/viewsets: endpoints HTTP.
- permissions: control de acceso por rol o propietario.

## Frontend

El frontend esta en `frontend/app/` y usa Angular con rutas lazy-loaded. La aplicacion tiene:

- guards de autenticacion y rol;
- interceptor JWT;
- servicios por dominio;
- layout principal con navegacion segun rol;
- componentes separados para cliente, tienda, auth y perfil.

## Flujo Basico

1. El usuario inicia sesion en `/api/auth/login`.
2. El frontend guarda `access_token`, `refresh_token` y `user`.
3. El interceptor agrega `Authorization: Bearer <token>`.
4. Guards protegen rutas por autenticacion y rol.
5. El backend valida JWT y permisos.
6. Las respuestas JSON actualizan la UI Angular.

## Decisiones Importantes

- La API v1 vive bajo `/api/v1/`.
- Auth vive bajo `/api/auth/`.
- Se usa PostGIS para tiendas y busqueda por distancia.
- El frontend usa Zone.js y `provideZoneChangeDetection()` para change detection tradicional.
- `API_QUICK_REFERENCE.md` documenta detalles de permisos y ambiguedades actuales.

