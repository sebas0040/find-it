# Despliegue

Esta guia describe los puntos necesarios para preparar Find-It fuera del entorno local.

## Backend

Checklist:

- `DEBUG=False`.
- `SECRET_KEY` fuerte y privado.
- `ALLOWED_HOSTS` con dominios reales.
- `CORS_ALLOWED_ORIGINS` con origenes frontend reales.
- Base PostgreSQL/PostGIS disponible.
- Redis disponible si se usan cache/tareas.
- Migraciones aplicadas.
- Static files recolectados si aplica.

Comandos tipicos:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

El Dockerfile del backend ya ejecuta Gunicorn como proceso principal.

## Frontend

Build:

```bash
cd frontend/app
npm ci
npm run build
```

Antes de produccion, revisar que las URLs API apunten al backend real. Hoy estan definidas directamente en:

```text
frontend/app/src/app/core/constants/api.constants.ts
```

## Base De Datos

Requiere PostgreSQL con extension PostGIS. En Docker local se usa:

```text
postgis/postgis:17-3.5
```

## Seguridad Minima

- No usar secrets por defecto.
- No exponer `DEBUG=True`.
- Configurar HTTPS.
- Restringir CORS.
- Revisar permisos indicados en `API_QUICK_REFERENCE.md`.
- Revisar endpoints legacy antes de produccion.

## Pendiente Para Produccion

- Definir pipeline CI/CD.
- Externalizar configuracion frontend por ambiente.
- Revisar Dockerfile frontend.
- Definir estrategia de backups.
- Agregar monitoreo y logging estructurado.

