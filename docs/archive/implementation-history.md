# Historial De Implementacion

Este archivo conserva informacion util de documentos historicos que ya no son fuente operativa de verdad.

## Backend Inicial

La primera documentacion describia un backend Django con:

- modelos `User`, `Store`, `Category`, `Product`, `Inventory`, `Review` y `Favorite`;
- UUID, timestamps y soft delete;
- patron services/selectors;
- permisos por rol;
- PostGIS para ubicacion de tiendas;
- Redis y Celery configurados;
- Django Admin;
- JWT con SimpleJWT.

Esa arquitectura sigue siendo una referencia conceptual valida, aunque varios documentos antiguos decian que solo la API de usuarios estaba completa. El estado real actual incluye endpoints para tiendas, productos, categorias, inventario, reviews, favoritos y busqueda.

## Frontend Inicial

La implementacion historica documento:

- servicios HTTP;
- autenticacion JWT;
- guards;
- interceptores;
- busqueda;
- resultados;
- detalle de tienda;
- mapa Leaflet;
- manejo de loading y errores.

La aplicacion actual evoluciono a una estructura por features:

- `features/auth`;
- `features/client`;
- `features/store`;
- `features/profile`;
- `features/admin`.

## Seeds Historicos

`seed_data` crea datos demo anteriores:

- `cliente@test.com` / `cliente123`;
- `store@test.com` / `store123`;
- `admin@test.com` / `admin123`;
- 10 tiendas asociadas a NYC;
- 20 productos;
- inventario demo.

El seed recomendado actualmente para evaluacion es `seed_pasto`.

## Documentos Fusionados

La informacion tecnica util fue integrada en:

- `README.md`;
- `docs/01-overview.md`;
- `docs/02-architecture.md`;
- `docs/03-backend.md`;
- `docs/04-frontend.md`;
- `docs/05-database.md`;
- `docs/06-authentication.md`;
- `docs/07-docker-and-environment.md`;
- `docs/08-local-development.md`;
- `docs/09-deployment.md`;
- `docs/10-troubleshooting.md`;
- `docs/11-roadmap.md`.

Los reportes originales contenian rutas antiguas como `/api/auth/token/`, `/api/search/products/`, `/results`, `/map/:id` y endpoints de favoritos/reviews que ya no coinciden con la API actual. Por eso fueron archivados conceptualmente aqui y retirados como documentos operativos.
