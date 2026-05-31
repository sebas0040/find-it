from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


class AuthAPITests(APITestCase):
    def test_register_creates_user_without_username(self):
        response = self.client.post(
            "/api/auth/register",
            {
                "email": "client@example.com",
                "name": "Client User",
                "password": "StrongPass123",
                "password_confirm": "StrongPass123",
                "role": "CLIENT",
                "phone": "5551234",
                "avatar": "https://example.com/avatar.png",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "client@example.com")
        self.assertEqual(response.data["role"], "CLIENT")
        self.assertNotIn("password", response.data)

        user = get_user_model().objects.get(email="client@example.com")
        field_names = [field.name for field in user._meta.fields]
        self.assertNotIn("username", field_names)
        self.assertTrue(user.check_password("StrongPass123"))

    def test_register_rejects_public_admin_creation(self):
        response = self.client.post(
            "/api/auth/register",
            {
                "email": "admin@example.com",
                "name": "Admin User",
                "password": "StrongPass123",
                "password_confirm": "StrongPass123",
                "role": "ADMIN",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_tokens_and_user(self):
        get_user_model().objects.create_user(
            email="client@example.com",
            name="Client User",
            password="StrongPass123",
        )

        response = self.client.post(
            "/api/auth/login",
            {"email": "client@example.com", "password": "StrongPass123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "client@example.com")

    def test_refresh_returns_access_token(self):
        get_user_model().objects.create_user(
            email="client@example.com",
            name="Client User",
            password="StrongPass123",
        )
        login_response = self.client.post(
            "/api/auth/login",
            {"email": "client@example.com", "password": "StrongPass123"},
            format="json",
        )

        response = self.client.post(
            "/api/auth/refresh",
            {"refresh": login_response.data["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_me_requires_authentication_and_returns_current_user(self):
        user = get_user_model().objects.create_user(
            email="client@example.com",
            name="Client User",
            password="StrongPass123",
        )

        anonymous_response = self.client.get("/api/auth/me")
        self.assertEqual(anonymous_response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=user)
        response = self.client.get("/api/auth/me")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "client@example.com")
