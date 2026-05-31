import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from faker import Faker

from apps.categories.models import Category
from apps.products.models import Product
from apps.stores.models import Store
from apps.inventory.models import Inventory

User = get_user_model()
fake = Faker()


class Command(BaseCommand):
    help = 'Seed database with test data'

    def handle(self, *args, **options):
        self.stdout.write('Starting seed_data...')

        # Create categories
        categories_data = [
            {'name': 'Farmacia', 'icon': '💊'},
            {'name': 'Víveres', 'icon': '🛒'},
            {'name': 'Bebidas', 'icon': '🥤'},
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'icon': cat_data['icon']}
            )
            categories[cat_data['name']] = category
            status = 'created' if created else 'exists'
            self.stdout.write(f"  Category '{cat_data['name']}' {status}")

        # Create demo users
        demo_users = [
            {'email': 'cliente@test.com', 'password': 'cliente123', 'name': 'Demo Cliente', 'role': 'CLIENT'},
            {'email': 'store@test.com', 'password': 'store123', 'name': 'Demo Store Owner', 'role': 'STORE'},
            {'email': 'admin@test.com', 'password': 'admin123', 'name': 'Demo Admin', 'role': 'ADMIN'},
        ]

        users = {}
        for user_data in demo_users:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'name': user_data['name'],
                    'role': user_data['role'],
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                status = 'created'
            else:
                status = 'exists'
            users[user_data['email']] = user
            self.stdout.write(f"  User '{user_data['email']}' {status}")

        # NYC coordinates for stores
        nyc_locations = [
            (40.7505, -73.9972),  # Times Square
            (40.7282, -73.7949),  # Queens
            (40.6282, -73.9942),  # Brooklyn
            (40.7614, -73.9776),  # Upper East Side
            (40.7489, -73.9680),  # Midtown East
            (40.7549, -73.9840),  # Central Park South
            (40.7200, -74.0005),  # Financial District
            (40.7353, -73.9891),  # Chelsea
            (40.7484, -73.9857),  # Rockefeller Center
            (40.7231, -73.9897),  # Tribeca
        ]

        # Create stores
        stores = []
        store_owners = [users['store@test.com']]

        for i in range(10):
            lat, lng = nyc_locations[i]
            point = Point(lng, lat, srid=4326)

            store, created = Store.objects.get_or_create(
                name=f'{fake.company()} Pharmacy' if i % 2 == 0 else f'{fake.company()} Market',
                defaults={
                    'owner': random.choice(store_owners),
                    'description': fake.sentence(),
                    'address': fake.address(),
                    'location': point,
                    'verified': random.choice([True, True, False]),
                    'rating': round(random.uniform(3.5, 5.0), 1),
                }
            )
            stores.append(store)
            status = 'created' if created else 'exists'
            self.stdout.write(f"  Store '{store.name}' {status}")

        # Create products
        products_per_category = 7

        products = []
        for category_name, category in categories.items():
            for i in range(products_per_category):
                if category_name == 'Farmacia':
                    name = fake.word(part_of_speech='noun')
                    brand = f'Pharma {random.choice(["Plus", "Care", "Med", "Life"])}'
                elif category_name == 'Víveres':
                    name = fake.word(part_of_speech='noun')
                    brand = f'Fresh {random.choice(["Foods", "Market", "Organic"])}'
                else:  # Bebidas
                    brands = ['Coca Cola', 'Pepsi', 'Sprite', 'Fanta', 'Fresh Juice', 'Energy Drink']
                    brand = random.choice(brands)
                    name = brand

                product, created = Product.objects.get_or_create(
                    name=name,
                    brand=brand,
                    defaults={
                        'category': category,
                        'description': fake.sentence(),
                        'image': 'https://via.placeholder.com/200',
                    }
                )
                products.append(product)
                status = 'created' if created else 'exists'
                self.stdout.write(f"    Product '{product.name}' ({category_name}) {status}")

        # Create inventory
        inventory_count = 0
        for store in stores:
            for product in random.sample(products, min(15, len(products))):
                inventory, created = Inventory.objects.get_or_create(
                    store=store,
                    product=product,
                    defaults={
                        'price': round(random.uniform(5.0, 100.0), 2),
                        'stock': random.randint(0, 50),
                        'available': random.choice([True, True, True, False]),
                    }
                )
                if created:
                    inventory_count += 1

        self.stdout.write(self.style.SUCCESS(f'✓ Seed completed: {inventory_count} inventory items created'))
        self.stdout.write(f'✓ Categories: {len(categories)}')
        self.stdout.write(f'✓ Users: {len(users)}')
        self.stdout.write(f'✓ Stores: {len(stores)}')
        self.stdout.write(f'✓ Products: {len(products)}')
