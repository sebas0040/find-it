from rest_framework import status
from rest_framework.test import APITestCase

from apps.categories.models import Category


class CategoryAPITests(APITestCase):
    def test_visitors_can_list_categories(self):
        Category.objects.create(name="Groceries", icon="shopping-basket")
        Category.objects.create(name="Pharmacy", icon="pill")

        response = self.client.get("/api/categories")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["results"] if "results" in response.data else response.data
        self.assertEqual([category["name"] for category in results], ["Groceries", "Pharmacy"])

    def test_categories_endpoint_is_read_only(self):
        response = self.client.post(
            "/api/categories",
            {"name": "Hardware", "icon": "hammer"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
