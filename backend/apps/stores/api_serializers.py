from rest_framework import serializers
from apps.stores.models import Store


class StoreSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.name", read_only=True)
    owner_email = serializers.CharField(source="owner.email", read_only=True)
    location = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = [
            "id",
            "owner",
            "owner_name",
            "owner_email",
            "name",
            "description",
            "address",
            "location",
            "verified",
            "rating",
            "distance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "verified", "rating", "distance", "created_at", "updated_at"]

    def get_location(self, obj):
        if obj.location:
            return {
                "latitude": obj.location.y,
                "longitude": obj.location.x,
                "type": "Point",
            }
        return None

    def get_distance(self, obj):
        distance = getattr(obj, "distance", None)
        if distance is None:
            return None
        return {
            "m": round(distance.m, 2),
            "km": round(distance.km, 3),
        }


class StoreCreateUpdateSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(write_only=True, min_value=-90, max_value=90, required=False)
    longitude = serializers.FloatField(write_only=True, min_value=-180, max_value=180, required=False)

    class Meta:
        model = Store
        fields = [
            "name",
            "description",
            "address",
            "latitude",
            "longitude",
        ]

    def validate(self, attrs):
        has_latitude = "latitude" in attrs
        has_longitude = "longitude" in attrs

        if self.instance is None and (not has_latitude or not has_longitude):
            raise serializers.ValidationError({
                "location": "latitude and longitude are required."
            })

        if has_latitude != has_longitude:
            raise serializers.ValidationError({
                "location": "latitude and longitude must be provided together."
            })

        return attrs

    def create(self, validated_data):
        from django.contrib.gis.geos import Point
        
        latitude = validated_data.pop("latitude")
        longitude = validated_data.pop("longitude")
        validated_data["location"] = Point(longitude, latitude, srid=4326)
        validated_data["owner"] = self.context["request"].user
        
        return Store.objects.create(**validated_data)

    def update(self, instance, validated_data):
        from django.contrib.gis.geos import Point
        
        latitude = validated_data.pop("latitude", None)
        longitude = validated_data.pop("longitude", None)
        
        if latitude is not None and longitude is not None:
            instance.location = Point(longitude, latitude, srid=4326)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class StoreListSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.name", read_only=True)
    location = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = [
            "id",
            "owner_name",
            "name",
            "address",
            "location",
            "verified",
            "rating",
            "distance",
            "created_at",
        ]

    def get_location(self, obj):
        if obj.location:
            return {
                "latitude": obj.location.y,
                "longitude": obj.location.x,
                "type": "Point",
            }
        return None

    def get_distance(self, obj):
        distance = getattr(obj, "distance", None)
        if distance is None:
            return None
        return {
            "m": round(distance.m, 2),
            "km": round(distance.km, 3),
        }
