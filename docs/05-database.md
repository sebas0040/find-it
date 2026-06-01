# Base De Datos

Find-It usa PostgreSQL con PostGIS. El contenedor `db` expone PostgreSQL en el puerto local `5433` y dentro de Docker usa `5432`.

## Modelos Principales

`User`

- email unico;
- name;
- phone;
- avatar;
- role: `CLIENT`, `STORE`, `ADMIN`;
- is_verified;
- is_active.

`Store`

- owner;
- name;
- description;
- address;
- location `PointField`;
- verified;
- rating.

`Category`

- name;
- icon.

`Product`

- name;
- brand;
- description;
- image;
- category;
- constraint unica por nombre y marca.

`Inventory`

- store;
- product;
- price;
- stock;
- available;
- constraint unica tienda-producto.

`Review`

- user;
- store;
- rating entre 1 y 5;
- comment;
- constraint unica usuario-tienda.

`Favorite`

- user;
- product;
- constraint unica usuario-producto.

## BaseModel

Los modelos de dominio usan UUID, timestamps y soft delete:

- `id`;
- `created_at`;
- `updated_at`;
- `deleted_at`.

## PostGIS

Las tiendas guardan su ubicacion como punto geografico. La busqueda usa latitud, longitud y radio para encontrar inventario en tiendas cercanas.

## Datos Demo

Seed recomendado:

```bash
docker-compose exec backend python manage.py seed_pasto
```

Credenciales:

```text
cliente.pasto@test.com / password123
tienda.pasto.1@test.com ... tienda.pasto.7@test.com / store123
```

