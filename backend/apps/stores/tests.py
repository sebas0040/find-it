from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from rest_framework import status
from rest_framework.test import APITestCase

from apps.stores.models import Store
from apps.users.models import UserRole


class StoreAPITests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.store_owner = user_model.objects.create_user(
            email="store@example.com",
            name="Store Owner",
            password="StrongPass123",
            role=UserRole.STORE,
        )
        self.other_store_owner = user_model.objects.create_user(
            email="other-store@example.com",
            name="Other Store Owner",
            password="StrongPass123",
            role=UserRole.STORE,
        )
        self.client_user = user_model.objects.create_user(
            email="client@example.com",
            name="Client User",
            password="StrongPass123",
            role=UserRole.CLIENT,
        )
        self.admin_user = user_model.objects.create_user(
            email="admin@example.com",
            name="Admin User",
            password="StrongPass123",
            role=UserRole.ADMIN,
        )
        self.store = Store.objects.create(
            owner=self.store_owner,
            name="Central Market",
            description="Fresh products",
            address="Main Street",
            location=Point(-74.08175, 4.60971, srid=4326),
            rating=4.5,
        )

    def test_visitors_can_list_and_retrieve_stores(self):
        list_response = self.client.get("/api/stores")
        detail_response = self.client.get(f"/api/stores/{self.store.id}")

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["name"], "Central Market")
        self.assertEqual(detail_response.data["owner_name"], "Store Owner")

    def test_only_store_role_can_create_store(self):
        payload = {
            "name": "North Shop",
            "description": "Neighborhood shop",
            "address": "North Street",
            "latitude": 4.6500,
            "longitude": -74.0600,
        }

        self.client.force_authenticate(user=self.client_user)
        client_response = self.client.post("/api/stores", payload, format="json")
        self.assertEqual(client_response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.store_owner)
        store_response = self.client.post("/api/stores", payload, format="json")
        self.assertEqual(store_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(store_response.data["name"], "North Shop")
        self.assertEqual(Store.objects.get(name="North Shop").owner, self.store_owner)

    def test_only_owner_or_admin_can_patch_store(self):
        self.client.force_authenticate(user=self.other_store_owner)
        forbidden_response = self.client.patch(
            f"/api/stores/{self.store.id}",
            {"name": "Blocked Name"},
            format="json",
        )
        self.assertEqual(forbidden_response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.store_owner)
        owner_response = self.client.patch(
            f"/api/stores/{self.store.id}",
            {"name": "Owner Updated"},
            format="json",
        )
        self.assertEqual(owner_response.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.admin_user)
        admin_response = self.client.patch(
            f"/api/stores/{self.store.id}",
            {"address": "Admin Updated Address"},
            format="json",
        )
        self.assertEqual(admin_response.status_code, status.HTTP_200_OK)

    def test_geographic_filter_returns_nearby_stores_with_distance(self):
        Store.objects.create(
            owner=self.store_owner,
            name="Far Away Store",
            description="Different city",
            address="Far Street",
            location=Point(-75.56359, 6.25184, srid=4326),
            rating=5,
        )

        response = self.client.get("/api/stores?lat=4.60971&lng=-74.08175&radius=5")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"] if "results" in response.data else response.data
        names = [store["name"] for store in results]
        self.assertIn("Central Market", names)
        self.assertNotIn("Far Away Store", names)
        self.assertIsNotNone(results[0]["distance"])

    def test_invalid_geographic_filter_returns_400(self):
        response = self.client.get("/api/stores?lat=4.60971")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
