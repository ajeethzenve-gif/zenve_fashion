from rest_framework import serializers
from .models import Collection

class CollectionSerializer(serializers.ModelSerializer):
    itemCount = serializers.IntegerField(source="item_count", read_only=True)

    class Meta:
        model = Collection
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image",
            "category",
            "itemCount",
        ]
