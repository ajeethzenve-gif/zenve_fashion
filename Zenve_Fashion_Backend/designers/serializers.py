from rest_framework import serializers
from .models import Designer


class DesignerSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    name = serializers.CharField(source="designer_name")
    brand = serializers.CharField(source="brand_name")
    code = serializers.CharField(source="designer_code")

    class Meta:
        model = Designer
        fields = [
            "id",
            "code",
            "name",
            "brand",
            "owner_name",
            "email",
            "phone",
            "city",
            "state",
            "country",
            "tier",
            "is_active",
        ]

    def get_id(self, obj):
        return str(obj.id)
