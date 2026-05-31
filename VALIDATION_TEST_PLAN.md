# Find-It Implementation Validation Test Plan

## Pre-Flight Checklist

### Backend Services
- [ ] PostgreSQL with PostGIS running on port 5433
- [ ] Redis running on port 6379  
- [ ] Django backend running on port 8000
- [ ] All migrations applied successfully
- [ ] Seed data created (20 products, 10 stores, 3 users)

### Frontend
- [ ] Angular dev server running on port 4200
- [ ] All dependencies installed
- [ ] No TypeScript compilation errors
- [ ] Leaflet maps loaded without errors

---

## Authentication Flow Test

### 1. Login with Client
```bash
# Request
POST http://localhost:8000/api/auth/token/
Content-Type: application/json

{
  "email": "cliente@test.com",
  "password": "cliente123"
}

# Expected Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "email": "cliente@test.com",
    "name": "Demo Cliente",
    "role": "CLIENT",
    "is_verified": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Access Protected Endpoint
```bash
# Request with token in header
GET http://localhost:8000/api/v1/users/me/
Authorization: Bearer {access_token}

# Expected Response: 200 OK
{
  "id": "uuid",
  "email": "cliente@test.com",
  "name": "Demo Cliente",
  "role": "CLIENT"
}
```

---

## API Endpoint Tests

### 1. Search Products
```bash
GET http://localhost:8000/api/search/products/?q=drug&lat=40.7128&lng=-74.0060&radius=10
Authorization: Bearer {access_token}

# Expected: 200 OK with array of SearchResult objects
{
  "data": [
    {
      "product": { "id": "uuid", "name": "...", "brand": "..." },
      "inventory": { "id": "uuid", "price": 10.99, "stock": 5, "available": true },
      "store": { "id": "uuid", "name": "...", "address": "..." },
      "distance": 2.5
    }
  ]
}
```

### 2. Get Store Details
```bash
GET http://localhost:8000/api/v1/stores/{store_id}/
Authorization: Bearer {access_token}

# Expected: 200 OK
{
  "id": "uuid",
  "name": "Store Name",
  "address": "123 Main St, NYC",
  "location": {
    "type": "Point",
    "coordinates": [-73.9972, 40.7505]
  },
  "rating": 4.5,
  "verified": true,
  "description": "Great store"
}
```

### 3. Get Store Inventory
```bash
GET http://localhost:8000/api/v1/stores/{store_id}/inventory/
Authorization: Bearer {access_token}

# Expected: 200 OK with pagination
{
  "data": [
    {
      "id": "uuid",
      "store_id": "uuid",
      "product_id": "uuid",
      "price": 9.99,
      "stock": 10,
      "available": true
    }
  ],
  "pagination": {
    "count": 15,
    "next": null,
    "previous": null,
    "page_size": 20
  }
}
```

---

## Frontend Component Tests

### 1. Search Page
**Behavior**:
- [ ] Geolocation button fills latitude/longitude fields
- [ ] Form validates required fields
- [ ] Submit navigates to results page with query params
- [ ] Radius slider works (1-50 km)

**Test**:
1. Go to http://localhost:4200/search
2. Click "📍 Use My Location"
3. Verify coordinates populate
4. Enter search term "drug"
5. Click "Search"
6. Should navigate to results page

### 2. Search Results Page
**Behavior**:
- [ ] Results load from API
- [ ] Product cards display correctly
- [ ] "View Store & Map" button navigates to store detail
- [ ] Error handling shows appropriate messages
- [ ] Loading state displays while fetching

**Test**:
1. From search page, click Search after entering query
2. Wait for results to load
3. Verify product cards show price, stock, distance
4. Verify store info with rating displays
5. Click "View Store & Map" on any card
6. Should navigate to store detail page

### 3. Store Detail Page
**Behavior**:
- [ ] Store info displays (name, address, rating)
- [ ] Inventory items show with prices
- [ ] "Open on Google Maps" button works
- [ ] Back navigation works

**Test**:
1. Navigate to store detail page
2. Verify store header with name and address
3. Verify inventory grid with products and prices
4. Click "Open on Google Maps"
5. Should open Google Maps in new tab
6. Click back button
7. Should return to search page

### 4. Store Map Page
**Behavior**:
- [ ] Leaflet map loads with store marker (red)
- [ ] User location marker appears (blue) if geolocation allowed
- [ ] Popup shows store name, address, rating
- [ ] Map is interactive (pan, zoom)
- [ ] Store info sidebar displays

**Test**:
1. From store detail, click "View Store & Map" or navigate to /map/{id}
2. Wait for map to load
3. Verify red marker at store location
4. Verify map can be panned and zoomed
5. Click marker to see popup
6. Verify sidebar shows store details
7. Allow geolocation if prompted to see blue user location marker

---

## Interceptor & Error Handling Tests

### 1. Token Injection
**Test**:
1. Login and copy the access token
2. Open browser DevTools Network tab
3. Make any API request
4. Verify Authorization header contains "Bearer {token}"

### 2. Unauthorized Access (401)
**Test**:
1. Clear localStorage (remove tokens)
2. Try to navigate to /search
3. Should redirect to /auth/login

### 3. Server Error (500)
**Test**:
1. Stop backend service
2. Try to search or load a page
3. Should show error message
4. Should not crash the app

### 4. Loading State
**Test**:
1. Open Network tab in DevTools, throttle to "Slow 3G"
2. Submit a search
3. Should see loading indicator while fetching
4. Should hide when complete or error

---

## Data Validation Tests

### 1. Seed Data Verification
```bash
# Backend admin shell
python manage.py shell

>>> from apps.users.models import User
>>> User.objects.count()  # Should be 3

>>> from apps.stores.models import Store
>>> Store.objects.count()  # Should be 10

>>> from apps.products.models import Product
>>> Product.objects.count()  # Should be 20

>>> from apps.inventory.models import Inventory
>>> Inventory.objects.count()  # Should be >= 150

>>> from apps.categories.models import Category
>>> Category.objects.count()  # Should be 3
```

### 2. User Verification
```bash
# Verify all 3 demo users exist:
>>> User.objects.filter(email__in=[
...   'cliente@test.com',
...   'store@test.com', 
...   'admin@test.com'
... ]).values('email', 'role', 'name')
```

### 3. Store Location Verification
```bash
# Verify store locations are GeoJSON Points
>>> store = Store.objects.first()
>>> store.location  # Should output: POINT (-73.9972 40.7505)
>>> store.location.coords  # Should be [lng, lat]
```

---

## Performance Tests

### 1. Search Response Time
- [ ] Search with radius 10km returns results in < 500ms
- [ ] Search with large radius (50km) in < 1 second
- [ ] Map loads without lag after navigation

### 2. Concurrent Requests
- [ ] Multiple simultaneous API calls don't crash the backend
- [ ] Loading service properly tracks multiple requests

---

## Cross-Browser Testing

### Desktop
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari

### Mobile
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Firefox Mobile

### Test Points
- [ ] Responsive layouts work correctly
- [ ] Geolocation permission prompt appears
- [ ] Touch interactions work
- [ ] Maps scroll correctly

---

## Security Tests

### 1. Token Expiration
- [ ] Tokens work immediately after login
- [ ] Expired tokens should trigger re-login

### 2. CORS
- [ ] Frontend (localhost:4200) can access backend (localhost:8000)
- [ ] Invalid origins are rejected

### 3. Password Validation
- [ ] Weak passwords are rejected in registration
- [ ] Passwords must match confirmation

---

## Cleanup & Final Verification

```bash
# Verify entire stack starts cleanly:
docker-compose down -v
docker-compose up -d --build
docker-compose exec -T backend python manage.py migrate
docker-compose exec -T backend python manage.py seed_data

# Frontend
cd frontend/app
npm install
npm start
```

---

## Sign-Off Checklist

- [ ] All API endpoints respond correctly
- [ ] Frontend loads without errors
- [ ] Search functionality works
- [ ] Store details display correctly
- [ ] Map displays and is interactive
- [ ] Authentication flow works
- [ ] Error handling is graceful
- [ ] Loading states display
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings

---

**Test Date**: ___________
**Tested By**: ___________
**Status**: ___________
