# Backend Django

## Ubicacion

```text
backend/
├── apps/
├── config/
├── Dockerfile
├── manage.py
└── requirements.txt
```

## Stack

- Django 6.0.5
- Django REST Framework 3.17.1
- SimpleJWT
- django-filter
- django-cors-headers
- PostgreSQL + PostGIS
- Redis
- Celery
- Gunicorn

## Apps

- `apps.users`: modelo de usuario, auth API, permisos, services/selectors.
- `apps.stores`: tiendas, ubicacion GIS, endpoints `/stores`.
- `apps.products`: productos y CRUD.
- `apps.categories`: categorias.
- `apps.inventory`: inventario tienda-producto.
- `apps.reviews`: reviews y favoritos.
- `apps.search`: busqueda de productos cercanos.
- `apps.core`: comandos y utilidades compartidas.

## Rutas Backend Principales

Definidas en `backend/config/urls.py`:

- `/api/health`
- `/api/health/`
- `/api/auth/`
- `/api/v1/users/`
- `/api/v1/stores/`
- `/api/v1/products/`
- `/api/v1/inventory/`
- `/api/v1/reviews/`
- `/api/v1/categories/`
- `/api/v1/search/`

Tambien existen rutas legacy:

- `/api/stores`
- `/api/stores/{id}`
- `/api/categories`

## Comandos Utiles

```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py test
docker-compose exec backend python manage.py seed_pasto
docker-compose exec backend python manage.py seed_data
```

## Seeds

`seed_pasto` es el seed recomendado para demo local:

- `cliente.pasto@test.com` / `password123`
- `tienda.pasto.1@test.com` a `tienda.pasto.7@test.com` / `store123`
- tiendas distribuidas en Pasto, Narino;
- productos e inventario.

`seed_data` es historico y crea datos demo asociados a NYC.

## Healthcheck

```http
GET /api/health
GET /api/health/
```

Responde `{"status": "ok"}` cuando la API y la base de datos estan disponibles.

