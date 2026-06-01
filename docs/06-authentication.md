# Autenticacion JWT

El backend usa SimpleJWT. Los endpoints actuales estan bajo `/api/auth/`.

## Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me
```

## Login

Request:

```json
{
  "email": "cliente.pasto@test.com",
  "password": "password123"
}
```

Respuesta esperada:

```json
{
  "refresh": "jwt_refresh_token",
  "access": "jwt_access_token",
  "user": {
    "id": "uuid",
    "email": "cliente.pasto@test.com",
    "name": "Cliente Demo Pasto",
    "role": "CLIENT"
  }
}
```

## Storage Frontend

El frontend guarda:

- `access_token`
- `refresh_token`
- `user`

## Header Autenticado

```http
Authorization: Bearer <access_token>
```

## Roles

- `CLIENT`: busqueda, mapa, favoritos, reviews.
- `STORE`: dashboard, tienda, inventario.
- `ADMIN`: administracion.

## Proteccion Frontend

- `/dashboard/**` requiere `STORE`.
- `/favorites` requiere `CLIENT`.
- `/stores/:id` requiere `CLIENT`.
- `/search`, `/map`, `/profile` requieren autenticacion.

## Proteccion Backend

DRF valida JWT con:

```python
rest_framework_simplejwt.authentication.JWTAuthentication
```

Consulta `API_QUICK_REFERENCE.md` para permisos especificos por endpoint.

