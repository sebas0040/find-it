# Docker Y Variables De Entorno

## Servicios Docker

`docker-compose.yml` define:

- `db`: `postgis/postgis:17-3.5`
- `redis`: `redis:7-alpine`
- `backend`: Django con Gunicorn

Puertos:

- PostgreSQL local: `5433`
- Redis local: `6379`
- Backend local: `8000`

El frontend se ejecuta localmente con Angular CLI en `frontend/app`.

## Comandos

```bash
docker-compose up -d --build
docker-compose ps
docker-compose logs -f backend
docker-compose down
```

## Variables Principales

Backend:

- `DJANGO_SETTINGS_MODULE`
- `DEBUG`
- `SECRET_KEY`
- `ALLOWED_HOSTS`
- `DATABASE_ENGINE`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `REDIS_URL`
- `CELERY_BROKER_URL`
- `CELERY_RESULT_BACKEND`
- `CORS_ALLOWED_ORIGINS`

## Nota Sobre CORS

El frontend local usa normalmente `http://localhost:4200`. Si el backend no permite ese origin, el navegador bloqueara login y llamadas API.

En desarrollo, asegure que `CORS_ALLOWED_ORIGINS` incluya:

```text
http://localhost:4200
http://127.0.0.1:4200
```

## Dockerfiles

Backend:

- `backend/Dockerfile`
- `infra/docker/backend/Dockerfile`

Ambos describen una imagen Python con dependencias GIS/GDAL y Gunicorn. La composicion actual usa `backend/Dockerfile`.

Frontend:

- `infra/docker/frontend/Dockerfile` existe como placeholder vacio.

