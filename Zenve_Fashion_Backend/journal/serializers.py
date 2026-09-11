from rest_framework import serializers
from .models import Article

class ArticleSerializer(serializers.ModelSerializer):
    readTime = serializers.CharField(source="read_time")
    publishedAt = serializers.CharField(source="published_at")

    class Meta:
        model = Article
        fields = [
            "id",
            "slug",
            "title",
            "category",
            "readTime",
            "description",
            "content",
            "image",
            "author",
            "publishedAt",
            "tags",
        ]
