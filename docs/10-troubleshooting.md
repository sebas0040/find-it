# Troubleshooting

## CORS Al Hacer Login

Sintoma:

```text
No 'Access-Control-Allow-Origin' header is present
```

Causa comun: frontend corriendo en un puerto no permitido, por ejemplo `localhost:58220`.

Solucion:

- usar `http://localhost:4200`; o
- agregar el origin real a `CORS_ALLOWED_ORIGINS`.

## Respuesta HTML En Una Llamada API

Sintoma:

```text
Unexpected token '<', "<!doctype "...
```

Causa comun: el frontend llamo al servidor Angular en vez del backend.

Validar:

- `API_BASE_URL = http://localhost:8000/api/v1`
- `AUTH_API_URL = http://localhost:8000/api/auth`

## UI No Actualiza Tras HTTP

Sintoma:

- el `subscribe` recibe datos;
- la UI no cambia hasta un click o foco.

Causa corregida: Angular 21 estaba operando en modo zoneless sin estrategia consistente. El proyecto debe tener:

- `zone.js` en `package.json`;
- `"polyfills": ["zone.js"]` en `angular.json`;
- `provideZoneChangeDetection()` en `app.config.ts`.

## Puerto 4200 Ocupado

Windows:

```powershell
netstat -ano | findstr :4200
taskkill /PID <pid> /F
```

## `/api/v1/stores/me` Devuelve 404

Esto puede ser correcto si el usuario `STORE` aun no tiene tienda creada. El frontend debe guiar al flujo de setup.

## Leaflet: Map Container Not Found

Causa comun: inicializar el mapa antes de que el contenedor exista en DOM.

Validar que el componente renderice el div del mapa antes de ejecutar `L.map(...)`.

## GDAL/PostGIS En Windows

Ejecutar backend local fuera de Docker puede fallar por GDAL. Para desarrollo, usar Docker.

## CORS Localhost 4200

El `docker-compose.yml` historicamente incluyo `localhost:3000` y `localhost:8000`. Para Angular local, incluir `localhost:4200`.

