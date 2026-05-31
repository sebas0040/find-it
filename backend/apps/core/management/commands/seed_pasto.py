from decimal import Decimal

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.core.management.base import BaseCommand

from apps.categories.models import Category
from apps.inventory.models import Inventory
from apps.products.models import Product
from apps.stores.models import Store

User = get_user_model()


class Command(BaseCommand):
    help = "Seed Pasto, Narino demo data for Find-It"

    client_email = "cliente.pasto@test.com"
    client_password = "password123"
    store_password = "store123"

    categories_data = [
        {"name": "Viveres", "icon": "cart"},
        {"name": "Farmacia", "icon": "pill"},
        {"name": "Bebidas", "icon": "drink"},
        {"name": "Aseo", "icon": "clean"},
        {"name": "Mascotas", "icon": "pet"},
    ]

    stores_data = [
        {
            "name": "Mercado Centro Pasto",
            "owner_email": "tienda.pasto.1@test.com",
            "owner_name": "Tienda Pasto Centro",
            "address": "Calle 18 #25-20, Centro, Pasto, Narino",
            "description": "Viveres y productos basicos cerca de la Plaza de Narino.",
            "lat": Decimal("1.213610"),
            "lng": Decimal("-77.281110"),
            "rating": Decimal("4.70"),
        },
        {
            "name": "Drogueria Panamericana Pasto",
            "owner_email": "tienda.pasto.2@test.com",
            "owner_name": "Tienda Pasto Panamericana",
            "address": "Avenida Panamericana #19-80, Pasto, Narino",
            "description": "Medicamentos, cuidado personal y productos de emergencia.",
            "lat": Decimal("1.222520"),
            "lng": Decimal("-77.287060"),
            "rating": Decimal("4.55"),
        },
        {
            "name": "Mini Market Unicentro",
            "owner_email": "tienda.pasto.3@test.com",
            "owner_name": "Tienda Pasto Unicentro",
            "address": "Carrera 40 #19-45, Sector Unicentro, Pasto, Narino",
            "description": "Abarrotes, bebidas y snacks para compras rapidas.",
            "lat": Decimal("1.230180"),
            "lng": Decimal("-77.286620"),
            "rating": Decimal("4.62"),
        },
        {
            "name": "Super Tienda Torobajo",
            "owner_email": "tienda.pasto.4@test.com",
            "owner_name": "Tienda Pasto Torobajo",
            "address": "Calle 18 #49-10, Torobajo, Pasto, Narino",
            "description": "Productos de despensa y hogar para el sector universitario.",
            "lat": Decimal("1.232460"),
            "lng": Decimal("-77.293980"),
            "rating": Decimal("4.40"),
        },
        {
            "name": "Abarrotes Chapal",
            "owner_email": "tienda.pasto.5@test.com",
            "owner_name": "Tienda Pasto Chapal",
            "address": "Carrera 4 #12-75, Chapal, Pasto, Narino",
            "description": "Tienda de barrio con viveres, aseo y bebidas.",
            "lat": Decimal("1.200650"),
            "lng": Decimal("-77.276220"),
            "rating": Decimal("4.35"),
        },
        {
            "name": "Tienda Mijitayo Express",
            "owner_email": "tienda.pasto.6@test.com",
            "owner_name": "Tienda Pasto Mijitayo",
            "address": "Avenida Mijitayo #16-30, Pasto, Narino",
            "description": "Despensa, mascotas y productos cotidianos.",
            "lat": Decimal("1.219120"),
            "lng": Decimal("-77.292510"),
            "rating": Decimal("4.48"),
        },
        {
            "name": "Mercatodo Lorenzo",
            "owner_email": "tienda.pasto.7@test.com",
            "owner_name": "Tienda Pasto Lorenzo",
            "address": "Calle 21 #8-40, San Lorenzo, Pasto, Narino",
            "description": "Mercado local con productos de canasta familiar.",
            "lat": Decimal("1.218020"),
            "lng": Decimal("-77.268910"),
            "rating": Decimal("4.58"),
        },
    ]

    products_data = [
        ("Arroz Diana 500g", "Diana", "Viveres", "Arroz blanco para canasta familiar."),
        ("Aceite vegetal 900ml", "Premier", "Viveres", "Aceite de cocina de uso diario."),
        ("Azucar blanca 1kg", "Manuelita", "Viveres", "Azucar refinada para bebidas y recetas."),
        ("Panela redonda 500g", "La Pastusita", "Viveres", "Panela tradicional."),
        ("Cafe molido 250g", "Sello Rojo", "Viveres", "Cafe molido tostado."),
        ("Leche entera 1L", "Alqueria", "Bebidas", "Leche entera larga vida."),
        ("Agua sin gas 600ml", "Cristal", "Bebidas", "Agua embotellada."),
        ("Gaseosa cola 1.5L", "Coca-Cola", "Bebidas", "Bebida gaseosa familiar."),
        ("Jugo de naranja 1L", "Hit", "Bebidas", "Bebida de fruta sabor naranja."),
        ("Bebida hidratante 500ml", "Gatorade", "Bebidas", "Bebida hidratante."),
        ("Acetaminofen 500mg", "Genfar", "Farmacia", "Analgesico de venta libre."),
        ("Ibuprofeno 400mg", "MK", "Farmacia", "Antiinflamatorio de venta libre."),
        ("Alcohol antiseptico 700ml", "JGB", "Farmacia", "Alcohol para limpieza y desinfeccion."),
        ("Tapabocas paquete x10", "MedProtect", "Farmacia", "Tapabocas desechables."),
        ("Suero oral 500ml", "Pedialyte", "Farmacia", "Solucion de rehidratacion oral."),
        ("Jabon de barra x3", "Protex", "Aseo", "Jabon antibacterial en barra."),
        ("Detergente polvo 1kg", "Ariel", "Aseo", "Detergente para ropa."),
        ("Lavaloza liquido 500ml", "Axion", "Aseo", "Lavaloza liquido."),
        ("Papel higienico x4", "Familia", "Aseo", "Papel higienico doble hoja."),
        ("Desinfectante 1L", "Fabuloso", "Aseo", "Limpiador desinfectante para pisos."),
        ("Croquetas perro 1kg", "Dog Chow", "Mascotas", "Alimento para perros adultos."),
        ("Croquetas gato 1kg", "Cat Chow", "Mascotas", "Alimento para gatos adultos."),
        ("Arena sanitaria 4kg", "Michi", "Mascotas", "Arena sanitaria para gatos."),
        ("Shampoo mascotas 250ml", "CanAmor", "Mascotas", "Shampoo suave para mascotas."),
        ("Snacks perro 100g", "Pedigree", "Mascotas", "Premios para perro."),
    ]

    def handle(self, *args, **options):
        self.stdout.write("Seeding Pasto demo data...")

        categories = self.create_categories()
        self.create_client()
        stores = self.create_stores()
        products = self.create_products(categories)
        inventory_count = self.create_inventory(stores, products)

        self.stdout.write(self.style.SUCCESS("Pasto seed completed"))
        self.stdout.write(f"Client: {self.client_email} / {self.client_password}")
        self.stdout.write(f"Store users: tienda.pasto.N@test.com / {self.store_password}")
        self.stdout.write(f"Stores: {len(stores)}")
        self.stdout.write(f"Products in catalog: {len(products)}")
        self.stdout.write(f"Inventory items: {inventory_count}")

    def create_categories(self):
        categories = {}

        for data in self.categories_data:
            category, _ = Category.objects.update_or_create(
                name=data["name"],
                defaults={"icon": data["icon"]},
            )
            categories[data["name"]] = category

        return categories

    def create_client(self):
        user, created = User.objects.get_or_create(
            email=self.client_email,
            defaults={
                "name": "Cliente Demo Pasto",
                "phone": "3001234567",
                "role": "CLIENT",
                "is_verified": True,
            },
        )

        if created:
            user.set_password(self.client_password)
        else:
            user.name = "Cliente Demo Pasto"
            user.phone = "3001234567"
            user.role = "CLIENT"
            user.is_verified = True

        user.save()
        return user

    def create_stores(self):
        stores = []

        for data in self.stores_data:
            owner, owner_created = User.objects.get_or_create(
                email=data["owner_email"],
                defaults={
                    "name": data["owner_name"],
                    "phone": "3100000000",
                    "role": "STORE",
                    "is_verified": True,
                },
            )

            if owner_created:
                owner.set_password(self.store_password)
            else:
                owner.name = data["owner_name"]
                owner.role = "STORE"
                owner.is_verified = True

            owner.save()

            store, _ = Store.objects.update_or_create(
                name=data["name"],
                defaults={
                    "owner": owner,
                    "description": data["description"],
                    "address": data["address"],
                    "location": Point(float(data["lng"]), float(data["lat"]), srid=4326),
                    "verified": True,
                    "rating": data["rating"],
                },
            )
            stores.append(store)

        return stores

    def create_products(self, categories):
        products = []

        for name, brand, category_name, description in self.products_data:
            product, _ = Product.objects.update_or_create(
                name=name,
                brand=brand,
                defaults={
                    "category": categories[category_name],
                    "description": description,
                    "image": "https://via.placeholder.com/400x300.png?text=Find-It",
                },
            )
            products.append(product)

        return products

    def create_inventory(self, stores, products):
        inventory_count = 0

        for store_index, store in enumerate(stores):
            for product_index, product in enumerate(products):
                price = Decimal("2500.00") + Decimal(store_index * 450) + Decimal(product_index * 730)
                stock = 8 + ((store_index + product_index) % 38)
                available = stock > 0

                Inventory.objects.update_or_create(
                    store=store,
                    product=product,
                    defaults={
                        "price": price,
                        "stock": stock,
                        "available": available,
                    },
                )
                inventory_count += 1

        return inventory_count
