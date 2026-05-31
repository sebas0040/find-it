# Django Backend Setup - Quick Start Guide

## What's Been Implemented

A complete, production-ready Django backend following clean architecture principles:

- ✅ GeoDjango + PostGIS for geospatial queries
- ✅ JWT authentication with SimpleJWT
- ✅ 7 fully modeled entities with soft deletes
- ✅ Service/Selector pattern for business logic
- ✅ Role-based access control
- ✅ Docker setup with PostgreSQL + Redis
- ✅ Admin interface for all models
- ✅ API documentation and architecture guide

## Quick Start (5 minutes)

### 1. Start Docker Services
```bash
docker-compose up -d
```

This starts:
- PostgreSQL with PostGIS (findit database)
- Redis for caching/celery

### 2. Install Python Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run Migrations
```bash
python manage.py migrate
```

### 4. Create Admin User
```bash
python manage.py createsuperuser
# Email: admin@example.com
# Password: your-secure-password
```

### 5. Start Development Server
```bash
python manage.py runserver
```

Server running at: `http://localhost:8000`
Admin panel: `http://localhost:8000/admin/`

## Key API Endpoints

### Authentication
```bash
# Get JWT token
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Response: {"access":"<token>","refresh":"<token>"}
```

### Users API
```bash
# List users (admin only)
curl http://localhost:8000/api/v1/users/ \
  -H "Authorization: Bearer <token>"

# Create user (public)
curl -X POST http://localhost:8000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "email":"client@example.com",
    "name":"John Doe",
    "password":"password123",
    "password_confirm":"password123",
    "role":"CLIENT"
  }'

# Get current user
curl http://localhost:8000/api/v1/users/me/ \
  -H "Authorization: Bearer <token>"
```

## Database Models

All models include:
- UUID primary key
- created_at, updated_at timestamps
- deleted_at (soft deletes)
- Indexes on frequently queried fields

Models:
1. **User** - Email-based authentication with roles
2. **Store** - Geographic location with PostGIS PointField
3. **Product** - Products with categories
4. **Category** - Product categories
5. **Inventory** - Store x Product inventory
6. **Review** - Store reviews with 1-5 rating
7. **Favorite** - User favorite products

## Architecture

```
Request → View → Permission Check
             ↓
         Service/Selector
             ↓
         Database Model
             ↓
         Serializer → Response
```

**Selectors**: Read-only queries (get_*, search_*)
**Services**: Write operations (create_*, update_*, delete_*)
**Permissions**: Role-based access control
**Serializers**: Data validation and transformation

## File Structure

```
backend/
├── config/
│   ├── settings/base.py      # Django configuration
│   ├── urls.py               # URL routing
│   ├── asgi.py & wsgi.py
├── apps/
│   ├── users/
│   │   ├── models.py         # User model
│   │   ├── services.py       # create_user, update_user, etc
│   │   ├── selectors.py      # get_user, search_users, etc
│   │   ├── permissions.py    # IsAdmin, IsOwner, etc
│   │   ├── api/
│   │   │   ├── views.py      # UserViewSet
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   ├── admin.py          # Django admin
│   │   └── migrations/
│   ├── stores/               # Store model, services, selectors
│   ├── products/             # Product model
│   ├── categories/           # Category model
│   ├── inventory/            # Inventory model
│   └── reviews/              # Review & Favorite models
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── manage.py
```

## Command Reference

```bash
# Database
python manage.py migrate                 # Run migrations
python manage.py makemigrations         # Create migrations
python manage.py sqlmigrate [app] [num]# Show SQL for migration

# Admin
python manage.py createsuperuser        # Create admin user
python manage.py changepassword [user]  # Change password

# Server
python manage.py runserver              # Start dev server
python manage.py runserver 0.0.0.0:8000 # Listen on all interfaces

# Shell
python manage.py shell                  # Django shell
python manage.py dbshell                # Database shell

# Testing
python manage.py test                   # Run all tests
python manage.py test [app]             # Run app tests

# Utilities
python manage.py collectstatic           # Collect static files
python manage.py clearsessions          # Clear expired sessions
```

## Environment Variables

Copy `.env.example` to `.env` and update:

```env
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_ENGINE=django.contrib.gis.db.backends.postgis
DATABASE_NAME=findit
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432

REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## User Roles

- **CLIENT**: Browse products, add to favorites, write reviews
- **STORE**: Manage stores, inventory, view analytics
- **ADMIN**: Manage all resources, verify stores, manage users

## Testing API with cURL

```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | grep -o '"access":"[^"]*' | cut -d'"' -f4)

# Use token in requests
curl http://localhost:8000/api/v1/users/ \
  -H "Authorization: Bearer $TOKEN"
```

## Common Issues & Solutions

### Issue: "PostGIS not installed"
```bash
# In container, GDAL is already installed
# If running locally:
# macOS: brew install gdal
# Ubuntu: apt-get install gdal-bin libgdal-dev
# Then: pip install GDAL
```

### Issue: "Connection refused"
```bash
# Make sure Docker is running
docker-compose ps

# Recreate services
docker-compose down
docker-compose up -d
```

### Issue: "Database does not exist"
```bash
# Connect to postgres and create database
docker-compose exec db psql -U postgres -c "CREATE DATABASE findit;"

# Or use management command (if django is set up)
python manage.py migrate
```

## Next Steps

1. **Create API endpoints for other apps**:
   - Copy pattern from users app
   - Create views.py, serializers.py, urls.py for each app
   - Register routes in main urls.py

2. **Add tests**:
   - Unit tests for models and selectors
   - Integration tests for API endpoints
   - Permission tests

3. **Optimize performance**:
   - Add caching layer
   - Optimize database queries
   - Add pagination for list endpoints

4. **Deploy**:
   - Configure production settings
   - Set up SSL/HTTPS
   - Configure logging and monitoring

## Documentation Files

- `BACKEND_API.md` - Full API endpoint documentation
- `ARCHITECTURE.md` - Detailed architecture and design decisions
- This file: Quick start guide

## Support & Resources

- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- GeoDjango: https://docs.djangoproject.com/en/stable/ref/contrib/gis/
- SimpleJWT: https://django-rest-framework-simplejwt.readthedocs.io/

---

**Status**: ✅ Backend infrastructure complete and operational
**Ready for**: API endpoint implementation, testing, and deployment
