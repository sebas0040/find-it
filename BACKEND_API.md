# Find-It Backend API Documentation

## Architecture Overview

The backend is built with Django + Django REST Framework, following a clean architecture with the following patterns:

- **Models**: Core business entities with soft delete support
- **Selectors**: Read-only operations (queries)
- **Services**: Write operations and business logic
- **Serializers**: Data validation and transformation
- **Views/ViewSets**: HTTP endpoints
- **Permissions**: Role-based access control

## Tech Stack

- **Framework**: Django 6.0.5
- **API**: Django REST Framework 3.17.1
- **Database**: PostgreSQL + PostGIS (geospatial)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Caching**: Redis
- **Task Queue**: Celery
- **Async**: ASGI support

## Database Schema

### User Model
```
- id: UUID (Primary Key)
- email: EmailField (Unique)
- name: CharField(120)
- phone: CharField(20)
- avatar: URLField
- role: Enum(CLIENT, STORE, ADMIN)
- is_verified: BooleanField
- is_active: BooleanField
- created_at, updated_at, deleted_at: Timestamps
```

### Store Model
```
- id: UUID
- owner: FK(User)
- name: CharField(150)
- description: TextField
- address: TextField
- location: PointField (GIS)
- verified: BooleanField
- rating: DecimalField(0-5)
- created_at, updated_at, deleted_at: Timestamps
```

### Category Model
```
- id: UUID
- name: CharField(80, unique)
- icon: CharField(50)
- created_at, updated_at, deleted_at: Timestamps
```

### Product Model
```
- id: UUID
- name: CharField(150)
- brand: CharField(100)
- description: TextField
- image: URLField
- category: FK(Category)
- created_at, updated_at, deleted_at: Timestamps
- Unique Constraint: (name, brand)
```

### Inventory Model
```
- id: UUID
- store: FK(Store)
- product: FK(Product)
- price: DecimalField(10, 2)
- stock: PositiveIntegerField
- available: BooleanField
- created_at, updated_at, deleted_at: Timestamps
- Unique Constraint: (store, product)
```

### Review Model
```
- id: UUID
- user: FK(User)
- store: FK(Store)
- rating: PositiveSmallIntegerField(1-5)
- comment: TextField
- created_at, updated_at, deleted_at: Timestamps
- Unique Constraint: (user, store)
```

### Favorite Model
```
- id: UUID
- user: FK(User)
- product: FK(Product)
- created_at, updated_at, deleted_at: Timestamps
- Unique Constraint: (user, product)
```

## API Endpoints

### Authentication
```
POST /api/auth/token/           - Obtain JWT token
POST /api/auth/token/refresh/   - Refresh JWT token
```

### Users
```
GET    /api/v1/users/           - List all users (Admin only)
POST   /api/v1/users/           - Create new user (Public)
GET    /api/v1/users/{id}/      - Get user details
PUT    /api/v1/users/{id}/      - Update user profile
DELETE /api/v1/users/{id}/      - Delete user (Admin only)
GET    /api/v1/users/me/        - Get current user profile
POST   /api/v1/users/{id}/verify/ - Verify user (Admin only)
POST   /api/v1/users/{id}/change_role/ - Change user role (Admin only)
```

### Stores
```
GET    /api/v1/stores/              - List stores with filters
POST   /api/v1/stores/              - Create store (Store user)
GET    /api/v1/stores/{id}/         - Get store details
PUT    /api/v1/stores/{id}/         - Update store (Owner only)
DELETE /api/v1/stores/{id}/         - Delete store (Owner only)
POST   /api/v1/stores/{id}/verify/  - Verify store (Admin)
GET    /api/v1/stores/nearby/       - Get nearby stores (Geo-query)
```

### Products
```
GET    /api/v1/products/     - List products with search/filter
POST   /api/v1/products/     - Create product (Admin)
GET    /api/v1/products/{id}/ - Get product details
PUT    /api/v1/products/{id}/ - Update product (Admin)
DELETE /api/v1/products/{id}/ - Delete product (Admin)
```

### Categories
```
GET    /api/v1/categories/     - List all categories
POST   /api/v1/categories/     - Create category (Admin)
GET    /api/v1/categories/{id}/ - Get category details
PUT    /api/v1/categories/{id}/ - Update category (Admin)
DELETE /api/v1/categories/{id}/ - Delete category (Admin)
```

### Inventory
```
GET    /api/v1/inventory/              - List inventory
POST   /api/v1/inventory/              - Create inventory item (Store)
GET    /api/v1/inventory/{id}/         - Get inventory details
PUT    /api/v1/inventory/{id}/         - Update inventory (Store)
DELETE /api/v1/inventory/{id}/         - Delete inventory (Store)
POST   /api/v1/inventory/{id}/update_stock/ - Update stock
```

### Reviews
```
GET    /api/v1/reviews/           - List reviews
POST   /api/v1/reviews/           - Create review
GET    /api/v1/reviews/{id}/      - Get review details
PUT    /api/v1/reviews/{id}/      - Update review
DELETE /api/v1/reviews/{id}/      - Delete review
GET    /api/v1/stores/{id}/reviews/ - Get store reviews
```

### Favorites
```
GET    /api/v1/favorites/              - Get user favorites
POST   /api/v1/favorites/              - Add to favorites
DELETE /api/v1/favorites/{product_id}/ - Remove from favorites
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Error message"
  }
}
```

## Permissions & Authentication

### Role-Based Access Control
- **ADMIN**: Full access to all resources
- **STORE**: Can manage own stores and inventory
- **CLIENT**: Can browse, review, and favorite products

### Permission Classes
- `IsAuthenticated`: User must be logged in
- `IsAdmin`: User must be admin
- `IsStore`: User must be store owner
- `IsClient`: User must be a client
- `IsOwner`: Only owner can access/modify
- `IsStoreOwner`: Only store owner can modify
- `IsAdminOrReadOnly`: Admin can modify, others can read

## Setup & Installation

### Prerequisites
- Python 3.11+
- PostgreSQL + PostGIS
- Redis
- GDAL libraries

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd find-it/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start PostgreSQL and Redis**
```bash
docker-compose up -d
```

6. **Run migrations**
```bash
python manage.py migrate
```

7. **Create superuser**
```bash
python manage.py createsuperuser
```

8. **Run development server**
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## Docker Deployment

### Using Docker Compose
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Django (port 8000)

## Filtering & Search

### Users
- Filter by: `role`, `is_verified`
- Search: `email`, `name`, `phone`

### Products
- Filter by: `category`, `brand`
- Search: `name`, `brand`

### Stores
- Filter by: `verified`
- Search: `name`, `description`
- Geo-query: `latitude`, `longitude`, `radius`

### Inventory
- Filter by: `store`, `product`, `available`

## Pagination

Default pagination: 20 items per page
Maximum page size: 100 items

Query: `?page=1&page_size=20`

## Soft Deletes

All models support soft deletes. Deleted records are automatically excluded from queries but can be accessed via:
- `.objects.all_objects()` - Include deleted
- `.objects.deleted_objects()` - Only deleted
- `.objects.all()` - Only active (default)

## Custom Managers

Each model includes custom managers:
- `objects` - Default manager (only active records)
- `all_objects` - All records including deleted
- `deleted_objects` - Only soft-deleted records

Methods:
- `.soft_delete()` - Soft delete a record
- `.restore()` - Restore a soft-deleted record

## Error Codes

- `not_found` - Resource not found (404)
- `validation_error` - Invalid input data (400)
- `permission_denied` - Insufficient permissions (403)
- `unauthorized` - Authentication required (401)
- `duplicate` - Resource already exists (409)
- `business_logic_error` - Business logic violation (400)

## API Documentation

Full API documentation available at: `/api/schema/`

## Development

### Create migrations
```bash
python manage.py makemigrations
```

### Apply migrations
```bash
python manage.py migrate
```

### Create admin user
```bash
python manage.py createsuperuser
```

### Access Django Admin
Visit: `http://localhost:8000/admin/`

## Testing

Run tests:
```bash
python manage.py test
```

With coverage:
```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

## Performance Optimization

### Indexes
All models include indexes on commonly queried fields:
- `created_at`, `deleted_at` (all models)
- `email`, `role` (User)
- `owner`, `verified`, `rating` (Store)
- `location` with GiST index (Store)
- `store`, `product`, `available`, `price` (Inventory)

### Query Optimization
- Use `.select_related()` for foreign keys
- Use `.prefetch_related()` for reverse relations
- Use `.only()` or `.defer()` to limit fields
- Use database query count debugging in development

## Caching Strategy

- Redis for session storage
- Cache frequently accessed data (categories, verified stores)
- Cache geographic queries

## Contributing

1. Follow the directory structure
2. Use selectors for reads, services for writes
3. Add proper permissions to views
4. Write tests for new features
5. Update documentation

## License

MIT License
