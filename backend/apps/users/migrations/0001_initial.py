# Generated manually for the Find-It custom user model.

import uuid

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models

import apps.users.models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("is_superuser", models.BooleanField(default=False, help_text="Designates that this user has all permissions without explicitly assigning them.", verbose_name="superuser status")),
                ("first_name", models.CharField(blank=True, max_length=150, verbose_name="first name")),
                ("last_name", models.CharField(blank=True, max_length=150, verbose_name="last name")),
                ("is_staff", models.BooleanField(default=False, help_text="Designates whether the user can log into this admin site.", verbose_name="staff status")),
                ("is_active", models.BooleanField(default=True, help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.", verbose_name="active")),
                ("date_joined", models.DateTimeField(default=django.utils.timezone.now, verbose_name="date joined")),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("deleted_at", models.DateTimeField(blank=True, null=True)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("name", models.CharField(max_length=120)),
                ("phone", models.CharField(blank=True, max_length=20)),
                ("avatar", models.URLField(blank=True)),
                ("role", models.CharField(choices=[("CLIENT", "Client"), ("STORE", "Store Owner"), ("ADMIN", "Administrator")], default="CLIENT", max_length=20)),
                ("is_verified", models.BooleanField(default=False)),
                ("groups", models.ManyToManyField(blank=True, help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.", related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups")),
                ("user_permissions", models.ManyToManyField(blank=True, help_text="Specific permissions for this user.", related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions")),
            ],
            options={
                "verbose_name": "User",
                "verbose_name_plural": "Users",
                "db_table": "users_user",
            },
            managers=[
                ("objects", apps.users.models.UserManager()),
            ],
        ),
        migrations.AddIndex(
            model_name="user",
            index=models.Index(fields=["email"], name="users_user_email_6f2530_idx"),
        ),
        migrations.AddIndex(
            model_name="user",
            index=models.Index(fields=["role"], name="users_user_role_36d76d_idx"),
        ),
        migrations.AddIndex(
            model_name="user",
            index=models.Index(fields=["created_at"], name="users_user_created_cf865c_idx"),
        ),
        migrations.AddIndex(
            model_name="user",
            index=models.Index(fields=["deleted_at"], name="users_user_deleted_37c818_idx"),
        ),
    ]
