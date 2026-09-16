from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Designer
from .serializers import DesignerSerializer


class DesignerListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        designers = Designer.objects.filter(is_active=True).order_by("designer_name")
        serializer = DesignerSerializer(designers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DesignerDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk_or_code):
        if str(pk_or_code).isdigit():
            designer = Designer.objects.filter(id=int(pk_or_code), is_active=True).first()
        else:
            designer = Designer.objects.filter(
                Q(designer_code__iexact=pk_or_code) | Q(designer_name__iexact=pk_or_code),
                is_active=True
            ).first()

        if not designer:
            return Response({"detail": "Designer not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DesignerSerializer(designer)
        return Response(serializer.data, status=status.HTTP_200_OK)
