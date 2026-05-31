from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.users.models import User, UserRole
from apps.users.permissions import IsAdmin, IsSelfOrAdmin
from apps.users.selectors import get_user_by_id, search_users, get_user_by_role
from apps.users.services import create_user, update_user, verify_user, delete_user
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    RegisterWithTokenSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserListSerializer,
)


class RegisterAPIView(CreateAPIView):
    serializer_class = RegisterWithTokenSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        return Response(serializer.to_representation(result), status=status.HTTP_201_CREATED)


class LoginAPIView(TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]


class MeAPIView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["role", "is_verified"]
    search_fields = ["email", "name", "phone"]
    ordering_fields = ["created_at", "name"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        elif self.action == "list":
            return UserListSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        elif self.action in ["destroy", "list"]:
            return [IsAdmin()]
        elif self.action in ["update", "partial_update"]:
            return [IsAuthenticated()]
        elif self.action == "retrieve":
            return [IsAuthenticated(), IsSelfOrAdmin()]
        return [IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if user != request.user and not request.user.is_superuser:
            return Response(
                {"error": "You can only update your own profile"},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin()])
    def verify(self, request, pk=None):
        user = self.get_object()
        verify_user(str(user.id))
        return Response(
            {"message": "User verified successfully"},
            status=status.HTTP_200_OK,
        )

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

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated()])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
