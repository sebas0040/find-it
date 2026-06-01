# Descripcion General

Find-It es una aplicacion de geolocalizacion de productos. Permite que un cliente busque un producto, vea tiendas cercanas que lo tienen disponible y consulte informacion de precio, stock, distancia, favoritos y reviews.

## Roles

- `CLIENT`: usa busqueda, mapa, favoritos, perfil y reviews.
- `STORE`: gestiona tienda, perfil e inventario.
- `ADMIN`: rol reservado para administracion.

## Modulos Actuales

Cliente:

- Busqueda de productos por texto, categoria, radio y ubicacion.
- Mapa con tiendas y ubicacion.
- Favoritos.
- Detalle de tienda con reviews y rating promedio.
- Perfil editable.

Tienda:

- Dashboard.
- Configuracion inicial de tienda.
- Perfil de tienda.
- Inventario con alta, edicion, eliminacion, disponibilidad, busqueda y paginacion frontend.

Backend:

- API REST versionada bajo `/api/v1/`.
- Autenticacion bajo `/api/auth/`.
- PostGIS para consultas geograficas.
- JWT con access y refresh tokens.

## Fuente De Verdad

- API real: `API_QUICK_REFERENCE.md`.
- Arquitectura y setup: documentos numerados en `docs/`.
- Datos demo activos: `seed_pasto`.

