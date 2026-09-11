from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .models import Article
from .serializers import ArticleSerializer

class JournalListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        articles = Article.objects.all()
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class JournalDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        article = get_object_or_404(Article, slug=slug)
        serializer = ArticleSerializer(article)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RelatedArticlesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        article = get_object_or_404(Article, slug=slug)
        limit = int(request.query_params.get("limit", 3))
        related = Article.objects.exclude(id=article.id)[:limit]
        serializer = ArticleSerializer(related, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
