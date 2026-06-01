# Desarrollo Local

## Requisitos

- Docker Desktop
- Node.js compatible con Angular 21
- npm
- Git

Para ejecutar backend sin Docker tambien se requieren dependencias nativas de GDAL/PostGIS, por lo que Docker es el camino recomendado.

## Levantar Backend

Desde la raiz:

```bash
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_pasto
```

Validar:

```bash
curl http://localhost:8000/api/health
```

## Levantar Frontend

```bash
cd frontend/app
npm install
npm start
```

Abrir:

```text
http://localhost:4200
```

## Login Demo

Cliente:

```text
cliente.pasto@test.com
password123
```

Tienda:

```text
tienda.pasto.1@test.com
store123
```

## Flujo De Prueba Rapido

1. Iniciar sesion como cliente.
2. Ir a `/search`.
3. Buscar productos disponibles.
4. Abrir una tienda.
5. Agregar/quitar favoritos.
6. Crear una review.
7. Cerrar sesion.
8. Iniciar sesion como tienda.
9. Ir a `/dashboard/inventory`.
10. Crear, editar y eliminar un item de inventario.

## Build Frontend

```bash
cd frontend/app
npm run build
```

## Tests

Backend:

```bash
docker-compose exec backend python manage.py test
```

Frontend:

```bash
cd frontend/app
npm test
```

