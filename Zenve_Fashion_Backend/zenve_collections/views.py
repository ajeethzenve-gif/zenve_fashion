from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .models import Collection
from .serializers import CollectionSerializer

class CollectionListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        collections = Collection.objects.all()
        serializer = CollectionSerializer(collections, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CollectionDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        collection = get_object_or_404(Collection, slug=slug)
        serializer = CollectionSerializer(collection)
        return Response(serializer.data, status=status.HTTP_200_OK)
