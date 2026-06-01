# Find-It

Find-It es una aplicacion full-stack para localizar productos disponibles en tiendas cercanas. El proyecto combina un backend Django REST con geolocalizacion PostGIS y un frontend Angular orientado a dos roles principales:

- `CLIENT`: busca productos, consulta tiendas, usa mapa, gestiona favoritos y deja reviews.
- `STORE`: administra perfil de tienda e inventario.
- `ADMIN`: reservado para administracion del sistema.

La base local esperada es:

- Backend: `http://localhost:8000`
- API v1: `http://localhost:8000/api/v1`
- Auth: `http://localhost:8000/api/auth`
- Frontend: `http://localhost:4200`

## Stack

Backend:

- Django 6 + Django REST Framework
- PostgreSQL + PostGIS
- Redis
- SimpleJWT
- Docker + Gunicorn

Frontend:

- Angular 21
- RxJS
- Leaflet
- Zone.js con `provideZoneChangeDetection()`

## Inicio Rapido

Desde la raiz del proyecto:

```bash
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_pasto
```

Luego inicia el frontend:

```bash
cd frontend/app
npm install
npm start
```

Abre `http://localhost:4200`.

## Credenciales Demo

Seed recomendado para evaluacion local:

```text
Cliente:
email: cliente.pasto@test.com
password: password123

Tiendas:
email: tienda.pasto.1@test.com
email: tienda.pasto.2@test.com
...
email: tienda.pasto.7@test.com
password: store123
```

El comando `seed_pasto` crea un cliente, 7 tiendas distribuidas en Pasto, categorias, productos e inventario.

Tambien existe `seed_data`, un seed historico con datos demo de NYC.

## Funcionalidades Actuales

- Registro y login con JWT.
- Layout protegido con navegacion por rol.
- Busqueda de productos por ubicacion.
- Mapa con Leaflet.
- Detalle de tienda con reviews.
- Favoritos de productos para clientes.
- Perfil de usuario editable.
- Dashboard de tienda.
- Configuracion y perfil de tienda.
- Gestion de inventario: crear, editar, eliminar y filtrar productos.

## Rutas Frontend Principales

Publicas:

- `/login`
- `/register`

Cliente:

- `/search`
- `/map`
- `/favorites`
- `/stores/:id`
- `/profile`

Tienda:

- `/dashboard`
- `/dashboard/profile`
- `/dashboard/store-setup`
- `/dashboard/inventory`

## Documentacion

- [Referencia rapida API](API_QUICK_REFERENCE.md)
- [Descripcion general](docs/01-overview.md)
- [Arquitectura](docs/02-architecture.md)
- [Backend Django](docs/03-backend.md)
- [Frontend Angular](docs/04-frontend.md)
- [Base de datos](docs/05-database.md)
- [Autenticacion JWT](docs/06-authentication.md)
- [Docker y variables de entorno](docs/07-docker-and-environment.md)
- [Desarrollo local](docs/08-local-development.md)
- [Despliegue](docs/09-deployment.md)
- [Troubleshooting](docs/10-troubleshooting.md)
- [Roadmap](docs/11-roadmap.md)

## Endpoints Clave

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

API:

- `GET /api/v1/search/products/`
- `GET /api/v1/stores/`
- `GET /api/v1/stores/me`
- `GET /api/v1/products/`
- `GET /api/v1/categories/`
- `GET /api/v1/inventory/my_products/`
- `GET /api/v1/reviews/reviews/`
- `GET /api/v1/reviews/favorites/`

Para contratos completos, payloads y advertencias de permisos consulta [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md).

## Comandos Utiles

Backend:

```bash
docker-compose logs -f backend
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_pasto
docker-compose exec backend python manage.py test
```

Frontend:

```bash
cd frontend/app
npm start
npm run build
npm test
```

## Estado Del Proyecto

El MVP funcional incluye autenticacion, busqueda geolocalizada, mapa, favoritos, reviews, perfiles e inventario de tienda. La documentacion historica fue consolidada en `docs/archive/implementation-history.md`; la fuente operativa actual es este README, `docs/` y `API_QUICK_REFERENCE.md`.
