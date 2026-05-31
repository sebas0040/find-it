# API REFERENCE - Find-It

Generado el: 2026-05-26  
Base URL local: `http://localhost:8000`  
Framework: Django + Django REST Framework  
Autenticacion global: JWT Bearer via `rest_framework_simplejwt.authentication.JWTAuthentication`

Esta referencia fue construida auditando `backend/config/urls.py` y las apps en `backend/apps/*`. No depende de documentacion previa.

> Nota de formato: los routers DRF tambien aceptan sufijos de formato como `.json` en varias rutas. Para frontend se documentan las rutas JSON normales.
> Nota HTTP: DRF/Django puede responder `OPTIONS` automaticamente y `HEAD` para vistas `GET`; solo se listan los metodos implementados explicitamente por rutas, ViewSets o handlers.

---

## INDICE DE ENDPOINTS

| Metodo | Ruta | Descripcion breve |
|--------|------|-------------------|
| GET | `/api/health` | Health check sin slash |
| GET | `/api/health/` | Health check con slash |
| POST | `/api/auth/register` | Registra usuario y devuelve JWT |
| POST | `/api/auth/login` | Login JWT con email/password |
| POST | `/api/auth/refresh` | Refresca tokens JWT |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| GET | `/api/v1/users/` | Lista usuarios, solo ADMIN |
| POST | `/api/v1/users/` | Crea usuario publico |
| GET | `/api/v1/users/{id}/` | Obtiene usuario por UUID |
| PUT | `/api/v1/users/{id}/` | Reemplaza perfil propio |
| PATCH | `/api/v1/users/{id}/` | Actualiza perfil propio parcial |
| DELETE | `/api/v1/users/{id}/` | Elimina usuario, solo ADMIN |
| POST | `/api/v1/users/{id}/verify/` | Verifica usuario, solo ADMIN |
| POST | `/api/v1/users/{id}/change_role/` | Cambia rol, solo ADMIN |
| GET | `/api/v1/users/me/` | Perfil actual via ViewSet |
| GET | `/api/stores` | Lista tiendas legacy |
| POST | `/api/stores` | Crea tienda legacy |
| GET | `/api/stores/{id}` | Obtiene tienda legacy |
| PUT | `/api/stores/{id}` | Reemplaza tienda legacy |
| PATCH | `/api/stores/{id}` | Actualiza tienda legacy |
| DELETE | `/api/stores/{id}` | Elimina tienda legacy |
| GET | `/api/v1/stores/` | Lista tiendas |
| POST | `/api/v1/stores/` | Crea tienda |
| GET | `/api/v1/stores/{id}` | Obtiene tienda |
| PUT | `/api/v1/stores/{id}` | Reemplaza tienda |
| PATCH | `/api/v1/stores/{id}` | Actualiza tienda |
| DELETE | `/api/v1/stores/{id}` | Elimina tienda |
| POST | `/api/v1/stores/{id}/verify` | Verifica tienda, solo ADMIN |
| GET | `/api/v1/stores/{id}/inventory` | Inventario de una tienda |
| GET | `/api/v1/stores/me` | Tienda del usuario autenticado |
| PUT | `/api/v1/stores/me` | Actualiza tienda propia |
| PATCH | `/api/v1/stores/me` | Actualiza tienda propia parcial |
| GET | `/api/categories` | Lista categorias legacy |
| GET | `/api/v1/categories/` | Lista categorias |
| GET | `/api/v1/categories/{id}` | Obtiene categoria |
| GET | `/api/v1/products/` | Lista productos |
| POST | `/api/v1/products/` | Crea producto |
| GET | `/api/v1/products/{id}/` | Obtiene producto |
| PUT | `/api/v1/products/{id}/` | Reemplaza producto |
| PATCH | `/api/v1/products/{id}/` | Actualiza producto |
| DELETE | `/api/v1/products/{id}/` | Elimina producto |
| GET | `/api/v1/products/my_products/` | Inventario de la tienda propia |
| GET | `/api/v1/inventory/` | Lista inventario |
| POST | `/api/v1/inventory/` | Crea item de inventario |
| GET | `/api/v1/inventory/{id}/` | Obtiene item de inventario |
| PUT | `/api/v1/inventory/{id}/` | Reemplaza item |
| PATCH | `/api/v1/inventory/{id}/` | Actualiza item |
| DELETE | `/api/v1/inventory/{id}/` | Elimina item |
| GET | `/api/v1/inventory/my_products/` | Inventario de la tienda propia |
| GET | `/api/v1/reviews/reviews/` | Lista reviews |
| POST | `/api/v1/reviews/reviews/` | Crea review |
| GET | `/api/v1/reviews/reviews/{id}/` | Obtiene review |
| PUT | `/api/v1/reviews/reviews/{id}/` | Reemplaza review |
| PATCH | `/api/v1/reviews/reviews/{id}/` | Actualiza review |
| DELETE | `/api/v1/reviews/reviews/{id}/` | Elimina review |
| GET | `/api/v1/reviews/favorites/` | Lista favoritos del usuario si autenticado |
| POST | `/api/v1/reviews/favorites/` | Agrega favorito |
| GET | `/api/v1/reviews/favorites/{id}/` | Obtiene favorito |
| PUT | `/api/v1/reviews/favorites/{id}/` | Reemplaza favorito |
| PATCH | `/api/v1/reviews/favorites/{id}/` | Actualiza favorito |
| DELETE | `/api/v1/reviews/favorites/{id}/` | Elimina favorito |
| GET | `/api/v1/search/products/` | Busca productos cercanos |
| GET | `/api/v1/search/products/{id}/` | Detalle de resultado de busqueda |

---

## ENDPOINTS

### GET `/api/health`

**Descripcion:** Verifica que la API y la base de datos respondan. Misma logica que `/api/health/`.

**Autenticacion:** No requerida.  
**Headers requeridos:** Ninguno.

**Parametros de ruta:** Ninguno.

**Parametros de query:** Ninguno.

**Request body:** No aplica.

**Respuesta exitosa (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-26T12:00:00.000000+00:00"
}
```

**Respuestas de error:**
| Codigo | Descripcion | Estructura |
|--------|-------------|------------|
| 503 | Error conectando a BD u otra excepcion | `{"status":"error","message":"..."}` |

**Fragmento de codigo (backend):**
```python
path('api/health', healthcheck, name='healthcheck-no-slash'),

def healthcheck(request):
    """API health check endpoint."""
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
        return JsonResponse({
            'status': 'ok',
            'timestamp': timezone.now().isoformat(),
        }, status=200)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
        }, status=503)
```

---

### GET `/api/health/`

**Descripcion:** Alias con slash de `/api/health`.

**Autenticacion:** No requerida.  
**Headers requeridos:** Ninguno.

**Parametros de ruta:** Ninguno.

**Parametros de query:** Ninguno.

**Request body:** No aplica.

**Respuesta exitosa (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-26T12:00:00.000000+00:00"
}
```

**Respuestas de error:**
| Codigo | Descripcion |
|--------|-------------|
| 503 | `{"status":"error","message":"..."}` |

**Fragmento de codigo (backend):**
```python
path('api/health/', healthcheck, name='healthcheck'),
```

---

### POST `/api/auth/register`

**Descripcion:** Registra usuario `CLIENT` o `STORE`, crea tokens JWT y devuelve el usuario.

**Autenticacion:** No requerida.  
**Headers requeridos:**
```http
Content-Type: application/json
```

**Parametros de ruta:** Ninguno.

**Parametros de query:** Ninguno.

**Request body:**
```json
{
  "email": "string email, requerido",
  "name": "string max 255, requerido",
  "password": "string min 8, requerido",
  "password_confirm": "string min 8, requerido",
  "phone": "string opcional",
  "avatar": "url string opcional",
  "role": "CLIENT | STORE, requerido"
}
```

**Payload de ejemplo:**
```json
{
  "email": "client@example.com",
  "name": "Client Demo",
  "password": "password123",
  "password_confirm": "password123",
  "phone": "+573001112233",
  "avatar": "",
  "role": "CLIENT"
}
```

**Respuesta exitosa (201):**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": "uuid",
    "email": "client@example.com",
    "name": "Client Demo",
    "phone": "+573001112233",
    "avatar": "",
    "role": "CLIENT",
    "role_display": "Client",
    "is_verified": false,
    "is_active": true,
    "created_at": "2026-05-26T12:00:00Z",
    "updated_at": "2026-05-26T12:00:00Z"
  }
}
```

**Respuestas de error:**
| Codigo | Descripcion |
|--------|-------------|
| 400 | Validacion DRF: campos requeridos, password no coincide, email duplicado o rol invalido |

**Fragmento de codigo (backend):**
```python
path("register", RegisterAPIView.as_view(), name="auth-register")

class RegisterAPIView(CreateAPIView):
    serializer_class = RegisterWithTokenSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(serializer.to_representation(result), status=status.HTTP_201_CREATED)
```

---

### POST `/api/auth/login`

**Descripcion:** Autentica con email/password y devuelve tokens JWT junto al usuario.

**Autenticacion:** No requerida.  
**Headers requeridos:**
```http
Content-Type: application/json
```

**Parametros de ruta/query:** Ninguno.

**Request body:**
```json
{
  "email": "string email, requerido",
  "password": "string, requerido"
}
```

**Payload de ejemplo:**
```json
{
  "email": "client@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "refresh": "jwt_refresh_token",
  "access": "jwt_access_token",
  "user": {
    "id": "uuid",
    "email": "client@example.com",
    "name": "Client Demo",
    "phone": "+573001112233",
    "avatar": "",
    "role": "CLIENT",
    "role_display": "Client",
    "is_verified": false,
    "is_active": true,
    "created_at": "2026-05-26T12:00:00Z",
    "updated_at": "2026-05-26T12:00:00Z"
  }
}
```

**Respuestas de error:**
| Codigo | Descripcion |
|--------|-------------|
| 400 | Credenciales faltantes o invalidas |
| 401 | Credenciales no validas segun SimpleJWT |

**Fragmento de codigo (backend):**
```python
path("login", LoginAPIView.as_view(), name="auth-login")

class LoginAPIView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

class LoginSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
```

---

### POST `/api/auth/refresh`

**Descripcion:** Refresca un token JWT usando SimpleJWT. Con `ROTATE_REFRESH_TOKENS=True`, la respuesta incluye nuevo `refresh`.

**Autenticacion:** No requerida, pero requiere refresh token valido.  
**Headers requeridos:**
```http
Content-Type: application/json
```

**Request body:**
```json
{
  "refresh": "string jwt refresh, requerido"
}
```

**Respuesta exitosa (200):**
```json
{
  "access": "new_jwt_access_token",
  "refresh": "new_jwt_refresh_token"
}
```

**Respuestas de error:**
| Codigo | Descripcion |
|--------|-------------|
| 401 | Token invalido, expirado o no reconocido |

**Fragmento de codigo (backend):**
```python
path("refresh", TokenRefreshView.as_view(), name="auth-refresh")
```

---

### GET `/api/auth/me`

**Descripcion:** Devuelve el usuario autenticado.

**Autenticacion:** Requerida, JWT Bearer.  
**Headers requeridos:**
```http
Authorization: Bearer <access_token>
```

**Request body:** No aplica.

**Respuesta exitosa (200):**
```json
{
  "id": "uuid",
  "email": "client@example.com",
  "name": "Client Demo",
  "phone": "+573001112233",
  "avatar": "",
  "role": "CLIENT",
  "role_display": "Client",
  "is_verified": false,
  "is_active": true,
  "created_at": "2026-05-26T12:00:00Z",
  "updated_at": "2026-05-26T12:00:00Z"
}
```

**Respuestas de error:**
| Codigo | Descripcion |
|--------|-------------|
| 401 | No autenticado o token invalido |

**Fragmento de codigo (backend):**
```python
path("me", MeAPIView.as_view(), name="auth-me")

class MeAPIView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
```

---

### GET `/api/v1/users/`

**Descripcion:** Lista usuarios. Solo usuarios `ADMIN`.

**Autenticacion:** Requerida, JWT Bearer con `role=ADMIN`.  
**Headers requeridos:** `Authorization: Bearer <access_token>`.

**Parametros de query:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `role` | enum `CLIENT|STORE|ADMIN` | - | Filtra por rol |
| `is_verified` | boolean | - | Filtra por verificacion |
| `search` | string | - | Busca en `email`, `name`, `phone` |
| `ordering` | string | `-created_at` | `created_at`, `-created_at`, `name`, `-name` |
| `page` | number | 1 | Pagina |

**Respuesta exitosa (200):**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Demo",
      "role": "CLIENT",
      "is_verified": false,
      "created_at": "2026-05-26T12:00:00Z"
    }
  ]
}
```

**Respuestas de error:** 401 no autenticado; 403 no admin.

**Fragmento de codigo (backend):**
```python
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    filterset_fields = ["role", "is_verified"]
    search_fields = ["email", "name", "phone"]
    ordering_fields = ["created_at", "name"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["destroy", "list"]:
            return [IsAdmin()]
```

---

### POST `/api/v1/users/`

**Descripcion:** Crea usuario publico. A diferencia de `/api/auth/register`, no devuelve tokens.

**Autenticacion:** No requerida.  
**Headers requeridos:** `Content-Type: application/json`.

**Request body:**
```json
{
  "email": "string email, requerido",
  "name": "string, requerido",
  "password": "string min 8, requerido",
  "password_confirm": "string min 8, requerido",
  "phone": "string opcional",
  "avatar": "url string opcional",
  "role": "CLIENT | STORE, opcional default CLIENT; ADMIN rechazado"
}
```

**Respuesta exitosa (201):**
```json
{
  "email": "user@example.com",
  "name": "User Demo",
  "phone": "",
  "avatar": "",
  "role": "CLIENT"
}
```

**Respuestas de error:** 400 validacion.

**Fragmento de codigo (backend):**
```python
def get_serializer_class(self):
    if self.action == "create":
        return UserCreateSerializer

def get_permissions(self):
    if self.action == "create":
        return [AllowAny()]
```

---

### GET `/api/v1/users/{id}/`

**Descripcion:** Obtiene un usuario por UUID. Solo el propio usuario o ADMIN.

**Autenticacion:** Requerida, JWT Bearer.  
**Parametros de ruta:**
| Parametro | Tipo | Requerido | Descripcion |
|-----------|------|-----------|-------------|
| `id` | UUID | Si | ID del usuario |

**Respuesta exitosa (200):** `UserSerializer`.

**Respuestas de error:** 401 no autenticado; 403 no es el propio usuario/admin; 404 no existe.

**Fragmento de codigo (backend):**
```python
elif self.action == "retrieve":
    return [IsAuthenticated(), IsSelfOrAdmin()]
```

---

### PUT `/api/v1/users/{id}/`

**Descripcion:** Reemplaza campos editables del perfil. El codigo solo permite editar perfil propio o superuser.

**Autenticacion:** Requerida.  
**Request body:**
```json
{
  "name": "string, requerido en PUT",
  "phone": "string opcional",
  "avatar": "url string opcional"
}
```

**Respuesta exitosa (200):** `{"name":"...","phone":"...","avatar":"..."}` o representacion DRF del serializer de update.

**Respuestas de error:** 400 validacion; 401; 403 `{"error":"You can only update your own profile"}`; 404.

**Fragmento de codigo (backend):**
```python
def update(self, request, *args, **kwargs):
    user = self.get_object()
    if user != request.user and not request.user.is_superuser:
        return Response(
            {"error": "You can only update your own profile"},
            status=status.HTTP_403_FORBIDDEN,
        )
    return super().update(request, *args, **kwargs)
```

---

### PATCH `/api/v1/users/{id}/`

**Descripcion:** Actualiza parcialmente `name`, `phone` o `avatar` del perfil.

**Autenticacion:** Requerida.  
**Request body ejemplo:**
```json
{
  "name": "Nuevo Nombre"
}
```

**Respuesta exitosa (200):**
```json
{
  "name": "Nuevo Nombre",
  "phone": "+573001112233",
  "avatar": ""
}
```

**Respuestas de error:** 400; 401; 403; 404.

**Fragmento de codigo (backend):**
```python
elif self.action in ["update", "partial_update"]:
    return UserUpdateSerializer
```

---

### DELETE `/api/v1/users/{id}/`

**Descripcion:** Elimina usuario. Solo `ADMIN`. El modelo usa soft delete cuando aplica el `delete()` del `BaseModel`.

**Autenticacion:** Requerida, ADMIN.  
**Respuesta exitosa (204):** Sin body.

**Respuestas de error:** 401; 403; 404.

**Fragmento de codigo (backend):**
```python
elif self.action in ["destroy", "list"]:
    return [IsAdmin()]
```

---

### POST `/api/v1/users/{id}/verify/`

**Descripcion:** Marca un usuario como verificado. Solo ADMIN.

**Autenticacion:** Requerida, ADMIN.  
**Request body:** No aplica.

**Respuesta exitosa (200):**
```json
{
  "message": "User verified successfully"
}
```

**Respuestas de error:** 401; 403; 404.

**Fragmento de codigo (backend):**
```python
@action(detail=True, methods=["post"], permission_classes=[IsAdmin()])
def verify(self, request, pk=None):
    user = self.get_object()
    verify_user(str(user.id))
    return Response(
        {"message": "User verified successfully"},
        status=status.HTTP_200_OK,
    )
```

---

### POST `/api/v1/users/{id}/change_role/`

**Descripcion:** Cambia el rol de un usuario. Solo ADMIN.

**Autenticacion:** Requerida, ADMIN.  
**Request body:**
```json
{
  "role": "CLIENT | STORE | ADMIN"
}
```

**Respuesta exitosa (200):** `UserSerializer`.

**Respuestas de error:**
| Codigo | Descripcion |
|--------|-------------|
| 400 | `{"error":"Invalid role"}` |
| 401 | No autenticado |
| 403 | No admin |
| 404 | Usuario no existe |

**Fragmento de codigo (backend):**
```python
@action(detail=True, methods=["post"], permission_classes=[IsAdmin()])
def change_role(self, request, pk=None):
    user = self.get_object()
    new_role = request.data.get("role")
    
    if new_role not in dict(UserRole.choices):
        return Response(
            {"error": "Invalid role"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    update_user(str(user.id), role=new_role)
    return Response(
        UserSerializer(user).data,
        status=status.HTTP_200_OK,
    )
```

---

### GET `/api/v1/users/me/`

**Descripcion:** Perfil actual via ViewSet. Similar a `/api/auth/me`.

**Autenticacion:** Requerida.  
**Respuesta exitosa (200):** `UserSerializer`.

**Respuestas de error:** 401.

**Fragmento de codigo (backend):**
```python
@action(detail=False, methods=["get"], permission_classes=[IsAuthenticated()])
def me(self, request):
    serializer = self.get_serializer(request.user)
    return Response(serializer.data)
```

---

### GET `/api/stores`

**Descripcion:** Endpoint legacy para listar tiendas. Misma accion `StoreViewSet.list`.

**Autenticacion:** No requerida.  
**Parametros de query:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `verified` | boolean | - | Filtra verificacion |
| `search` | string | - | Busca en `name`, `address` |
| `ordering` | string | `-rating` | `created_at`, `name`, `rating` con opcion `-` |
| `lat` | number | - | Latitud para filtro geografico |
| `lng` | number | - | Longitud para filtro geografico |
| `radius` | number km | 10 | Radio geografico |
| `page` | number | 1 | Pagina |
| `page_size` | number | 20 | Max 100 |

**Respuesta exitosa (200):** Paginated `StoreListSerializer`.

**Respuestas de error:** 400 si se envia algun filtro geografico sin `lat` y `lng` o si no son numeros.

**Fragmento de codigo (backend):**
```python
store_list = StoreViewSet.as_view({"get": "list", "post": "create"})
path('api/stores', store_list, name='store-list')
```

---

### POST `/api/stores`

**Descripcion:** Crea tienda usando ruta legacy.

**Autenticacion:** Requerida, usuario con `role=STORE`.  
**Headers requeridos:** `Authorization`, `Content-Type: application/json`.

**Request body:**
```json
{
  "name": "string requerido",
  "description": "string opcional",
  "address": "string requerido",
  "latitude": "number -90..90 requerido al crear",
  "longitude": "number -180..180 requerido al crear"
}
```

**Respuesta exitosa (201):** `StoreSerializer`.

**Respuestas de error:** 400 validacion; 401; 403 si no es STORE.

**Fragmento de codigo (backend):**
```python
def get_permissions(self):
    if self.action in ['create']:
        return [IsAuthenticated(), IsStoreUser()]

def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    return Response(StoreSerializer(serializer.instance).data, status=201)
```

---

### GET `/api/stores/{id}`

**Descripcion:** Obtiene tienda legacy por UUID.

**Autenticacion:** No requerida.  
**Parametros de ruta:** `id` UUID requerido.

**Respuesta exitosa (200):** `StoreSerializer`.

**Respuestas de error:** 404.

**Fragmento de codigo (backend):**
```python
store_detail = StoreViewSet.as_view({
    "get": "retrieve",
    "patch": "partial_update",
    "put": "update",
    "delete": "destroy",
})
path('api/stores/<uuid:pk>', store_detail, name='store-detail')
```

---

### PUT `/api/stores/{id}`

**Descripcion:** Reemplaza tienda legacy. Solo owner o ADMIN.

**Autenticacion:** Requerida.  
**Request body:** Igual a create; `latitude` y `longitude` son opcionales en update, pero si se envia uno debe enviarse el otro.

**Respuesta exitosa (200):** `StoreSerializer`.

**Respuestas de error:** 400; 401; 403; 404.

**Fragmento de codigo (backend):**
```python
elif self.action in ['update', 'partial_update', 'destroy']:
    return [IsAuthenticated(), IsStoreOwnerOrAdmin()]
```

---

### PATCH `/api/stores/{id}`

**Descripcion:** Actualiza parcialmente tienda legacy. Solo owner o ADMIN.

**Request body ejemplo:**
```json
{
  "description": "Nuevo texto",
  "latitude": 4.711,
  "longitude": -74.0721
}
```

**Respuesta exitosa (200):** `StoreSerializer`.

**Fragmento de codigo (backend):**
```python
def update(self, request, *args, **kwargs):
    partial = kwargs.pop("partial", False)
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    self.perform_update(serializer)
    return Response(StoreSerializer(serializer.instance).data)
```

---

### DELETE `/api/stores/{id}`

**Descripcion:** Soft delete de tienda legacy. Solo owner o ADMIN.

**Respuesta exitosa (204):** Sin body.

**Fragmento de codigo (backend):**
```python
def perform_destroy(self, instance):
    instance.soft_delete()
```

---

### GET `/api/v1/stores/`

**Descripcion:** Lista tiendas v1. Contrato igual a `GET /api/stores`.

**Autenticacion:** No requerida.  
**Respuesta exitosa (200):**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "owner_name": "Store Owner",
      "name": "Demo Store",
      "address": "123 Main St",
      "location": {
        "latitude": 4.711,
        "longitude": -74.0721,
        "type": "Point"
      },
      "verified": false,
      "rating": "0.00",
      "distance": null,
      "created_at": "2026-05-26T12:00:00Z"
    }
  ]
}
```

**Fragmento de codigo (backend):**
```python
router = DefaultRouter(trailing_slash=False)
router.register(r'', StoreViewSet, basename='store')
path('api/v1/stores/', include('apps.stores.urls'))
```

---

### POST `/api/v1/stores/`

**Descripcion:** Crea tienda v1. Igual a `POST /api/stores`.

**Autenticacion:** Requerida, `role=STORE`.  
**Request body:** `StoreCreateUpdateSerializer`.

**Respuesta exitosa (201):** `StoreSerializer`.

**Fragmento de codigo (backend):**
```python
def perform_create(self, serializer):
    serializer.save(owner=self.request.user)
```

---

### GET `/api/v1/stores/{id}`

**Descripcion:** Obtiene tienda v1 por UUID. Sin slash final porque este router usa `trailing_slash=False`.

**Autenticacion:** No requerida.  
**Respuesta exitosa (200):** `StoreSerializer`.

**Fragmento de codigo (backend):**
```python
class StoreViewSet(viewsets.ModelViewSet):
    serializer_class = StoreSerializer
```

---

### PUT `/api/v1/stores/{id}`

**Descripcion:** Reemplaza tienda v1. Solo owner o ADMIN.

**Request body:** `StoreCreateUpdateSerializer`.
**Respuesta exitosa (200):** `StoreSerializer`.

**Fragmento de codigo (backend):**
```python
elif self.action in ['update', 'partial_update', 'destroy']:
    return [IsAuthenticated(), IsStoreOwnerOrAdmin()]
```

---

### PATCH `/api/v1/stores/{id}`

**Descripcion:** Actualiza parcialmente tienda v1. Solo owner o ADMIN.

**Request body ejemplo:**
```json
{
  "name": "Demo Store Updated"
}
```

**Respuesta exitosa (200):** `StoreSerializer`.

**Fragmento de codigo (backend):**
```python
elif self.action in ['update', 'partial_update']:
    return StoreCreateUpdateSerializer
```

---

### DELETE `/api/v1/stores/{id}`

**Descripcion:** Soft delete de tienda v1. Solo owner o ADMIN.

**Respuesta exitosa (204):** Sin body.

**Fragmento de codigo (backend):**
```python
def perform_destroy(self, instance):
    instance.soft_delete()
```

---

### POST `/api/v1/stores/{id}/verify`

**Descripcion:** Marca una tienda como verificada. Solo ADMIN.

**Autenticacion:** Requerida, ADMIN.  
**Request body:** No aplica.

**Respuesta exitosa (200):** `StoreSerializer`.

**Fragmento de codigo (backend):**
```python
@action(detail=True, methods=['post'])
def verify(self, request, pk=None):
    store = self.get_object()
    store.verified = True
    store.save(update_fields=["verified", "updated_at"])
    serializer = self.get_serializer(store)
    return Response(serializer.data)
```

---

### GET `/api/v1/stores/{id}/inventory`

**Descripcion:** Lista inventario de una tienda.

**Autenticacion:** No requerida.  
**Parametros de query:** `page`, `page_size`.

**Respuesta exitosa (200):** Paginated `InventorySerializer`.

**Fragmento de codigo (backend):**
```python
@action(detail=True, methods=['get'])
def inventory(self, request, pk=None):
    from apps.inventory.models import Inventory
    from apps.inventory.serializers import InventorySerializer
    
    store = self.get_object()
    inventories = Inventory.objects.filter(store=store)
    page = self.paginate_queryset(inventories)
    if page is not None:
        serializer = InventorySerializer(page, many=True)
        return self.get_paginated_response(serializer.data)
    serializer = InventorySerializer(inventories, many=True)
    return Response(serializer.data)
```

---

### GET `/api/v1/stores/me`

**Descripcion:** Obtiene la tienda cuyo owner es el usuario autenticado.

**Autenticacion:** ⚠️ Requerida en la practica, pero el `get_permissions` del ViewSet devuelve `AllowAny` para esta accion. Si no hay usuario autenticado, normalmente terminara en 404 al buscar `owner=AnonymousUser`.

**Respuesta exitosa (200):** `StoreSerializer`.

**Fragmento de codigo (backend):**
```python
@action(detail=False, methods=['get', 'patch', 'put'])
def me(self, request):
    """Get or update current store owner's store"""
    from django.shortcuts import get_object_or_404
    store = get_object_or_404(self.get_queryset().model, owner=request.user)
```

---

### PUT `/api/v1/stores/me`

**Descripcion:** Actualiza la tienda propia. El codigo usa `partial=True` incluso para PUT.

**Autenticacion:** ⚠️ Deberia requerir JWT, pero `get_permissions` devuelve `AllowAny` para `me`.

**Request body:** `StoreCreateUpdateSerializer`, parcial.

**Respuesta exitosa (200):** `StoreSerializer`.

**Fragmento de codigo (backend):**
```python
if request.method in ['PATCH', 'PUT']:
    serializer = StoreCreateUpdateSerializer(store, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    self.perform_update(serializer)
    return Response(StoreSerializer(serializer.instance).data)
```

---

### PATCH `/api/v1/stores/me`

**Descripcion:** Actualiza parcialmente la tienda propia. Mismo contrato que PUT `/api/v1/stores/me`.

**Autenticacion:** ⚠️ Ver nota anterior.

**Respuesta exitosa (200):** `StoreSerializer`.

**Fragmento de codigo (backend):**
```python
@action(detail=False, methods=['get', 'patch', 'put'])
def me(self, request):
    ...
```

---

### GET `/api/categories`

**Descripcion:** Lista categorias legacy.

**Autenticacion:** No requerida.  
**Parametros de query:** `search`, `ordering`, `page`.

**Respuesta exitosa (200):** Paginated `CategorySerializer`.

**Fragmento de codigo (backend):**
```python
category_list = CategoryViewSet.as_view({"get": "list"})
path('api/categories', category_list, name='category-list')
```

---

### GET `/api/v1/categories/`

**Descripcion:** Lista categorias.

**Autenticacion:** No requerida.  
**Parametros de query:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `search` | string | - | Busca en `name`, `icon` |
| `ordering` | string | `name` | `name`, `created_at` con opcion `-` |
| `page` | number | 1 | Pagina |

**Respuesta exitosa (200):**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "Groceries",
      "icon": "shopping-cart",
      "created_at": "2026-05-26T12:00:00Z",
      "updated_at": "2026-05-26T12:00:00Z"
    }
  ]
}
```

**Fragmento de codigo (backend):**
```python
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    search_fields = ["name", "icon"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
```

---

### GET `/api/v1/categories/{id}`

**Descripcion:** Obtiene categoria por UUID. Sin slash final por `trailing_slash=False`.

**Autenticacion:** No requerida.  
**Respuesta exitosa (200):** `CategorySerializer`.

**Fragmento de codigo (backend):**
```python
router = DefaultRouter(trailing_slash=False)
router.register(r'', CategoryViewSet, basename='category')
```

---

### GET `/api/v1/products/`

**Descripcion:** Lista productos activos.

**Autenticacion:** No requerida.  
**Parametros de query:** `category` UUID, `search`, `ordering`, `page`.

**Respuesta exitosa (200):** Paginated `ProductListSerializer`.
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "Milk",
      "brand": "Brand",
      "category": "uuid",
      "created_at": "2026-05-26T12:00:00Z"
    }
  ]
}
```

**Fragmento de codigo (backend):**
```python
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(deleted_at__isnull=True).select_related('category')
    filterset_fields = ['category']
    search_fields = ['name', 'brand']
    ordering_fields = ['created_at', 'name']
```

---

### POST `/api/v1/products/`

**Descripcion:** Crea producto.

**Autenticacion:** Requerida, cualquier usuario autenticado.  
**Request body:**
```json
{
  "name": "string requerido",
  "brand": "string requerido",
  "description": "string opcional",
  "image": "url string opcional",
  "category_id": "uuid requerido"
}
```

**Respuesta exitosa (201):** `ProductSerializer` con `category` expandida.

**Fragmento de codigo (backend):**
```python
def get_permissions(self):
    if self.action in ['create', 'update', 'partial_update', 'destroy']:
        return [IsAuthenticated()]
    return [AllowAny()]
```

---

### GET `/api/v1/products/{id}/`

**Descripcion:** Obtiene producto por UUID.

**Autenticacion:** No requerida.  
**Respuesta exitosa (200):** `ProductSerializer`.

**Fragmento de codigo (backend):**
```python
def get_serializer_class(self):
    if self.action == 'list':
        return ProductListSerializer
    return ProductSerializer
```

---

### PUT `/api/v1/products/{id}/`

**Descripcion:** Reemplaza producto.

**Autenticacion:** Requerida.  
**Request body:** Igual a POST.
**Respuesta exitosa (200):** `ProductSerializer`.

**Fragmento de codigo (backend):**
```python
category_id = serializers.PrimaryKeyRelatedField(
    queryset=Category.objects.all(), write_only=True, source='category'
)
```

---

### PATCH `/api/v1/products/{id}/`

**Descripcion:** Actualiza parcialmente producto.

**Autenticacion:** Requerida.  
**Request body ejemplo:** `{"image":"https://example.com/product.jpg"}`.
**Respuesta exitosa (200):** `ProductSerializer`.

**Fragmento de codigo (backend):**
```python
read_only_fields = ['id', 'created_at', 'updated_at']
```

---

### DELETE `/api/v1/products/{id}/`

**Descripcion:** Elimina producto.

**Autenticacion:** Requerida.  
**Respuesta exitosa (204):** Sin body.

**Fragmento de codigo (backend):**
```python
class Product(BaseModel):
    ...
```

---

### GET `/api/v1/products/my_products/`

**Descripcion:** Devuelve inventario asociado a la tienda del usuario autenticado.

**Autenticacion:** ⚠️ La accion no define permiso propio; por `get_permissions`, queda `AllowAny`, pero usa `request.user` para buscar tienda. En frontend debe enviarse JWT.

**Respuesta exitosa (200):** Array no paginado de `InventoryListSerializer`.
```json
[
  {
    "id": "uuid",
    "product_name": "Milk",
    "store_name": "Demo Store",
    "price": "12.50",
    "stock": 10,
    "available": true
  }
]
```

**Fragmento de codigo (backend):**
```python
@action(detail=False, methods=['get'])
def my_products(self, request):
    """Get all products created by current user (store owner)"""
    from apps.inventory.serializers import InventoryListSerializer
    from apps.inventory.models import Inventory
    from apps.stores.models import Store
    from django.shortcuts import get_object_or_404
    
    store = get_object_or_404(Store, owner=request.user)
    inventories = Inventory.objects.filter(store=store, deleted_at__isnull=True)
    serializer = InventoryListSerializer(inventories, many=True)
    return Response(serializer.data)
```

---

### GET `/api/v1/inventory/`

**Descripcion:** Lista inventario activo.

**Autenticacion:** No requerida.  
**Parametros de query:** `store`, `product`, `available`, `search`, `ordering`, `page`.

**Respuesta exitosa (200):** Paginated `InventoryListSerializer`.

**Fragmento de codigo (backend):**
```python
class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.filter(deleted_at__isnull=True).select_related('product', 'store')
    filterset_fields = ['store', 'product', 'available']
    search_fields = ['product__name', 'store__name']
    ordering_fields = ['created_at', 'price', 'stock']
```

---

### POST `/api/v1/inventory/`

**Descripcion:** Crea item de inventario.

**Autenticacion:** Requerida, cualquier usuario autenticado. ⚠️ No valida en create que la tienda pertenezca al usuario.

**Request body:**
```json
{
  "product_id": "uuid requerido",
  "store_id": "uuid requerido",
  "price": "decimal requerido",
  "stock": "integer >= 0 requerido",
  "available": "boolean opcional default true"
}
```

**Respuesta exitosa (201):** `InventorySerializer`.

**Fragmento de codigo (backend):**
```python
def get_permissions(self):
    if self.action in ['create', 'update', 'partial_update', 'destroy']:
        return [IsAuthenticated()]
    return [AllowAny()]

def perform_create(self, serializer):
    serializer.save()
```

---

### GET `/api/v1/inventory/{id}/`

**Descripcion:** Obtiene item de inventario.

**Autenticacion:** No requerida.  
**Respuesta exitosa (200):** `InventorySerializer`.

**Fragmento de codigo (backend):**
```python
class InventorySerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    store = StoreListSerializer(read_only=True)
```

---

### PUT `/api/v1/inventory/{id}/`

**Descripcion:** Reemplaza item de inventario. Solo owner de la tienda o superuser segun `perform_update`.

**Autenticacion:** Requerida.  
**Request body:** Igual a POST.
**Respuesta exitosa (200):** `InventorySerializer`.

**Fragmento de codigo (backend):**
```python
def perform_update(self, serializer):
    inventory = self.get_object()
    store_owner = inventory.store.owner
    if store_owner != self.request.user and not self.request.user.is_superuser:
        return Response(
            {'detail': 'You do not have permission to perform this action.'},
            status=status.HTTP_403_FORBIDDEN
        )
    serializer.save()
```

---

### PATCH `/api/v1/inventory/{id}/`

**Descripcion:** Actualiza parcialmente item de inventario.

**Autenticacion:** Requerida.  
**Request body ejemplo:** `{"price":"11.99","stock":7}`.
**Respuesta exitosa (200):** `InventorySerializer`.

**Fragmento de codigo (backend):**
```python
elif self.action == 'list':
    return InventoryListSerializer
return InventorySerializer
```

---

### DELETE `/api/v1/inventory/{id}/`

**Descripcion:** Elimina item de inventario. ⚠️ El codigo no sobrescribe `perform_destroy`, por lo que usa el destroy por defecto del ViewSet/modelo.

**Autenticacion:** Requerida.  
**Respuesta exitosa (204):** Sin body.

**Fragmento de codigo (backend):**
```python
if self.action in ['create', 'update', 'partial_update', 'destroy']:
    return [IsAuthenticated()]
```

---

### GET `/api/v1/inventory/my_products/`

**Descripcion:** Lista inventario de la tienda del usuario autenticado.

**Autenticacion:** ⚠️ La accion queda con `AllowAny` por `get_permissions`, pero usa `request.user`; enviar JWT.

**Respuesta exitosa (200):** Array no paginado de `InventoryListSerializer`.

**Fragmento de codigo (backend):**
```python
@action(detail=False, methods=['get'])
def my_products(self, request):
    """Get all products for current user's store"""
    from django.shortcuts import get_object_or_404
    from apps.stores.models import Store
    
    store = get_object_or_404(Store, owner=request.user)
    inventories = Inventory.objects.filter(store=store, deleted_at__isnull=True)
    serializer = InventoryListSerializer(inventories, many=True)
    return Response(serializer.data)
```

---

### GET `/api/v1/reviews/reviews/`

**Descripcion:** Lista reviews activas.

**Autenticacion:** No requerida.  
**Parametros de query:** `store`, `rating`, `search`, `ordering`, `page`.

**Respuesta exitosa (200):** Paginated `ReviewListSerializer`.

**Fragmento de codigo (backend):**
```python
router.register(r'reviews', ReviewViewSet, basename='review')

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(deleted_at__isnull=True).select_related('user', 'store')
    filterset_fields = ['store', 'rating']
    search_fields = ['comment', 'store__name']
    ordering_fields = ['created_at', 'rating']
```

---

### POST `/api/v1/reviews/reviews/`

**Descripcion:** Crea review para una tienda. El usuario se toma del token.

**Autenticacion:** Requerida.  
**Request body:**
```json
{
  "store_id": "uuid requerido",
  "rating": "integer 1..5 requerido",
  "comment": "string requerido"
}
```

**Respuesta exitosa (201):** `ReviewSerializer`.

**Fragmento de codigo (backend):**
```python
def perform_create(self, serializer):
    serializer.save(user=self.request.user)
```

---

### GET `/api/v1/reviews/reviews/{id}/`

**Descripcion:** Obtiene review por UUID.

**Autenticacion:** No requerida.  
**Respuesta exitosa (200):** `ReviewSerializer`.

**Fragmento de codigo (backend):**
```python
class ReviewSerializer(serializers.ModelSerializer):
    user = UserListSerializer(read_only=True)
    store = StoreListSerializer(read_only=True)
```

---

### PUT `/api/v1/reviews/reviews/{id}/`

**Descripcion:** Reemplaza review. Solo autor o superuser segun `perform_update`.

**Autenticacion:** Requerida.  
**Request body:** `store_id`, `rating`, `comment`.
**Respuesta exitosa (200):** `ReviewSerializer`.

**Fragmento de codigo (backend):**
```python
def perform_update(self, serializer):
    review = self.get_object()
    if review.user != self.request.user and not self.request.user.is_superuser:
        return Response(
            {'detail': 'You do not have permission to perform this action.'},
            status=status.HTTP_403_FORBIDDEN
        )
    serializer.save()
```

---

### PATCH `/api/v1/reviews/reviews/{id}/`

**Descripcion:** Actualiza parcialmente review.

**Autenticacion:** Requerida.  
**Request body ejemplo:** `{"rating":5,"comment":"Excelente"}`.
**Respuesta exitosa (200):** `ReviewSerializer`.

**Fragmento de codigo (backend):**
```python
def get_permissions(self):
    if self.action in ['create']:
        return [IsAuthenticated()]
    elif self.action in ['update', 'partial_update', 'destroy']:
        return [IsAuthenticated()]
    return [AllowAny()]
```

---

### DELETE `/api/v1/reviews/reviews/{id}/`

**Descripcion:** Elimina review. Solo autor o superuser segun `perform_destroy`.

**Autenticacion:** Requerida.  
**Respuesta exitosa (204):** Sin body.

**Fragmento de codigo (backend):**
```python
def perform_destroy(self, instance):
    if instance.user != self.request.user and not self.request.user.is_superuser:
        return Response(
            {'detail': 'You do not have permission to perform this action.'},
            status=status.HTTP_403_FORBIDDEN
        )
    instance.delete()
```

---

### GET `/api/v1/reviews/favorites/`

**Descripcion:** Lista favoritos. Si el usuario esta autenticado, filtra por ese usuario; si no, retorna todos los favoritos activos por como esta escrito `get_queryset`.

**Autenticacion:** No requerida, pero recomendada para obtener favoritos propios.  
**Parametros de query:** `product`, `search`, `page`.

**Respuesta exitosa (200):** Paginated `FavoriteListSerializer`.

**Fragmento de codigo (backend):**
```python
router.register(r'favorites', FavoriteViewSet, basename='favorite')

def get_queryset(self):
    if self.request.user.is_authenticated:
        if self.action == 'list':
            return self.queryset.filter(user=self.request.user)
    return self.queryset
```

---

### POST `/api/v1/reviews/favorites/`

**Descripcion:** Agrega producto a favoritos del usuario autenticado.

**Autenticacion:** Requerida.  
**Request body:**
```json
{
  "product_id": "uuid requerido"
}
```

**Respuesta exitosa (201):** `FavoriteSerializer`.

**Fragmento de codigo (backend):**
```python
def perform_create(self, serializer):
    serializer.save(user=self.request.user)
```

---

### GET `/api/v1/reviews/favorites/{id}/`

**Descripcion:** Obtiene favorito por UUID.

**Autenticacion:** No requerida segun permisos actuales.
**Respuesta exitosa (200):** `FavoriteSerializer`.

**Fragmento de codigo (backend):**
```python
class FavoriteSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(read_only=True)
    product = ProductListSerializer(read_only=True)
```

---

### PUT `/api/v1/reviews/favorites/{id}/`

**Descripcion:** Reemplaza favorito. ⚠️ `get_permissions` no protege update/partial_update, por lo que queda publico en la configuracion actual del ViewSet.

**Request body:** `{"product_id":"uuid"}`.
**Respuesta exitosa (200):** `FavoriteSerializer`.

**Fragmento de codigo (backend):**
```python
def get_permissions(self):
    if self.action in ['create']:
        return [IsAuthenticated()]
    elif self.action in ['destroy']:
        return [IsAuthenticated()]
    return [AllowAny()]
```

---

### PATCH `/api/v1/reviews/favorites/{id}/`

**Descripcion:** Actualiza parcialmente favorito. ⚠️ Publico segun permisos actuales.

**Request body ejemplo:** `{"product_id":"uuid"}`.
**Respuesta exitosa (200):** `FavoriteSerializer`.

**Fragmento de codigo (backend):**
```python
return [AllowAny()]
```

---

### DELETE `/api/v1/reviews/favorites/{id}/`

**Descripcion:** Elimina favorito. Solo owner o superuser segun `perform_destroy`.

**Autenticacion:** Requerida.  
**Respuesta exitosa (204):** Sin body.

**Fragmento de codigo (backend):**
```python
def perform_destroy(self, instance):
    if instance.user != self.request.user and not self.request.user.is_superuser:
        return Response(
            {'detail': 'You do not have permission to perform this action.'},
            status=status.HTTP_403_FORBIDDEN
        )
    instance.delete()
```

---

### GET `/api/v1/search/products/`

**Descripcion:** Busca productos disponibles en tiendas cercanas usando PostGIS.

**Autenticacion:** No requerida.  
**Parametros de query:**
| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `lat` | number | requerido | Latitud usuario |
| `lng` | number | requerido | Longitud usuario |
| `q` | string | `""` | Nombre, marca o descripcion de producto |
| `radius` | number km | 10 | Radio |
| `category` | UUID | - | Categoria |
| `ordering` | string | `price` | Solo `price` o `-price` |
| `page` | number | 1 | Pagina |
| `page_size` | number | 20 | Max 100 |

**Respuesta exitosa (200):**
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "product": {
        "id": "uuid",
        "name": "Milk",
        "brand": "Brand",
        "description": "",
        "image": "",
        "category": {
          "id": "uuid",
          "name": "Groceries",
          "icon": "shopping-cart",
          "created_at": "2026-05-26T12:00:00Z",
          "updated_at": "2026-05-26T12:00:00Z"
        },
        "created_at": "2026-05-26T12:00:00Z",
        "updated_at": "2026-05-26T12:00:00Z"
      },
      "store": {
        "id": "uuid",
        "owner_name": "Store Owner",
        "name": "Demo Store",
        "address": "123 Main St",
        "location": {
          "latitude": 4.711,
          "longitude": -74.0721,
          "type": "Point"
        },
        "verified": true,
        "rating": "4.50",
        "distance": null,
        "created_at": "2026-05-26T12:00:00Z"
      },
      "inventory": {
        "id": "uuid",
        "price": 12.5,
        "stock": 10,
        "available": true,
        "created_at": "2026-05-26T12:00:00Z",
        "updated_at": "2026-05-26T12:00:00Z"
      },
      "distance": 1.23
    }
  ]
}
```

**Respuestas de error:**
| Codigo | Descripcion |
|--------|-------------|
| 400 | `{"error":"Missing required parameters","required":["lat","lng"],"optional":["q","radius","category"]}` |

**Fragmento de codigo (backend):**
```python
class SearchViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SearchResultSerializer
    permission_classes = [AllowAny]
    pagination_class = SearchPagination
    ordering = ['price']
    ordering_fields = ['price']

    def list(self, request, *args, **kwargs):
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        if not lat or not lng:
            return Response(
                {
                    'error': 'Missing required parameters',
                    'required': ['lat', 'lng'],
                    'optional': ['q', 'radius', 'category']
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().list(request, *args, **kwargs)
```

---

### GET `/api/v1/search/products/{id}/`

**Descripcion:** Detalle de un resultado de busqueda/inventario por UUID.

**Autenticacion:** No requerida.  
**Parametros de query:** ⚠️ Aunque es detalle, `get_queryset` requiere `lat` y `lng`; sin esos parametros devuelve queryset vacio y puede responder 404.

**Respuesta exitosa (200):** `SearchResultSerializer`.

**Fragmento de codigo (backend):**
```python
def get_queryset(self):
    from apps.inventory.models import Inventory
    
    query = self.request.query_params.get('q', '')
    lat = self.request.query_params.get('lat')
    lng = self.request.query_params.get('lng')
    radius = self.request.query_params.get('radius', 10)
    category = self.request.query_params.get('category')

    if not lat or not lng:
        return Inventory.objects.none()
```

---

## CONSTANTES, ENUMS Y TIPOS COMPARTIDOS

### Autenticacion y headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

JWT:
| Setting | Valor |
|---------|-------|
| Access lifetime | 1 hora |
| Refresh lifetime | 7 dias |
| Rotate refresh tokens | true |
| Algorithm | HS256 |

### Paginacion global DRF

La configuracion global usa `PageNumberPagination` con `PAGE_SIZE=20`. Algunos ViewSets (`stores`, `search`) agregan `page_size` con maximo 100.

```json
{
  "count": 123,
  "next": "http://localhost:8000/path/?page=2",
  "previous": null,
  "results": []
}
```

### Errores comunes DRF/SimpleJWT

```json
{
  "detail": "Authentication credentials were not provided."
}
```

```json
{
  "field_name": ["This field is required."]
}
```

```json
{
  "detail": "Not found."
}
```

### Enum `UserRole`

| Valor | Display |
|-------|---------|
| `CLIENT` | Client |
| `STORE` | Store Owner |
| `ADMIN` | Administrator |

### Modelo base

Todos los modelos de dominio usan UUID y timestamps:

```json
{
  "id": "uuid",
  "created_at": "datetime ISO 8601",
  "updated_at": "datetime ISO 8601",
  "deleted_at": "datetime ISO 8601 nullable, usualmente no expuesto"
}
```

### Serializers reutilizados

**UserSerializer**
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "phone": "string",
  "avatar": "url string",
  "role": "CLIENT | STORE | ADMIN",
  "role_display": "string",
  "is_verified": "boolean",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**StoreSerializer**
```json
{
  "id": "uuid",
  "owner": "uuid",
  "owner_name": "string",
  "owner_email": "string",
  "name": "string",
  "description": "string",
  "address": "string",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "type": "Point"
  },
  "verified": "boolean",
  "rating": "decimal string",
  "distance": {
    "m": "number",
    "km": "number"
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**ProductSerializer**
```json
{
  "id": "uuid",
  "name": "string",
  "brand": "string",
  "description": "string",
  "image": "url string",
  "category": "CategorySerializer",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**InventorySerializer**
```json
{
  "id": "uuid",
  "product": "ProductListSerializer",
  "store": "StoreListSerializer",
  "price": "decimal string",
  "stock": "integer",
  "available": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Ambiguedades y riesgos detectados

| Area | Ambiguedad |
|------|------------|
| Healthcheck | La funcion no restringe metodo HTTP; se documenta como GET por convencion. |
| Introspeccion automatica | No se pudo ejecutar `django.setup()` localmente porque falta GDAL en Windows; la auditoria se hizo leyendo rutas, routers y codigo fuente. |
| Stores `me` | Usa `request.user` pero `get_permissions` no exige `IsAuthenticated` para `me`. |
| Products/Inventory `my_products` | Usan `request.user` pero quedan con `AllowAny`; el frontend debe enviar JWT. |
| Favorites update | `PUT/PATCH` de favoritos quedan publicos por permisos actuales. |
| Inventory create | No valida que `store_id` pertenezca al usuario autenticado. |
| `perform_update` con `Response` | Algunos `perform_update/perform_destroy` retornan `Response`; DRF normalmente espera excepcion o `serializer.save()`, por lo que esos 403 pueden no comportarse como el autor pretendia. |
| Rutas legacy | `/api/stores`, `/api/stores/{id}` y `/api/categories` conviven con `/api/v1/...`. |
| Reviews path | Por el include `api/v1/reviews/` y router `reviews`, las rutas reales son `/api/v1/reviews/reviews/` y `/api/v1/reviews/favorites/`. |
