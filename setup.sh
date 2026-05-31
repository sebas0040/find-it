#!/bin/bash

echo "Starting Find-It Setup..."

# Change to project root
cd "$(dirname "$0")"

# 1. Start Docker containers
echo "1. Starting Docker containers..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."
for i in {1..30}; do
  if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
    echo "Database is ready!"
    break
  fi
  echo "Waiting for database... ($i/30)"
  sleep 2
done

# 2. Run migrations
echo "2. Running migrations..."
docker-compose exec -T backend python manage.py migrate

# 3. Run seed_data
echo "3. Seeding database with test data..."
docker-compose exec -T backend python manage.py seed_data

echo "✓ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Backend API: http://localhost:8000/api"
echo "2. Admin Panel: http://localhost:8000/admin/"
echo "3. Frontend: http://localhost:4200 (start with 'npm start' in frontend/app)"
echo ""
echo "Test credentials:"
echo "  Email: cliente@test.com, Password: cliente123"
echo "  Email: store@test.com, Password: store123"
echo "  Email: admin@test.com, Password: admin123"
