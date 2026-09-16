from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.db.models import Q
from products.models import Product
from products.serializers import ProductSerializer
from .models import WishlistItem


class WishlistSyncAPIView(APIView):
    """
    GET    /api/wishlist/      - Retrieve authenticated customer's wishlist items
    POST   /api/wishlist/sync/ - Synchronizes client wishlist product IDs strictly under authenticated user
    DELETE /api/wishlist/      - Clears customer's wishlist items in database
    """
    permission_classes = [AllowAny]

    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response([], status=status.HTTP_200_OK)

        items = WishlistItem.objects.filter(user=request.user)
        product_ids = [item.product_id for item in items]
        products = Product.objects.filter(id__in=product_ids)
        serializer = ProductSerializer(products, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        if request.user and request.user.is_authenticated:
            WishlistItem.objects.filter(user=request.user).delete()
        return Response({"message": "Wishlist cleared successfully."}, status=status.HTTP_200_OK)

    def post(self, request):
        product_ids = request.data.get("productIds", [])
        if not isinstance(product_ids, list):
            return Response([], status=status.HTTP_200_OK)

        cleaned_ids = [str(pid) for pid in product_ids if pid]

        # Match by ID or slug
        numeric_ids = [int(pid) for pid in cleaned_ids if pid.isdigit()]
        slug_ids = [pid for pid in cleaned_ids if not pid.isdigit()]

        from django.db.models import Q
        products = Product.objects.filter(
            Q(id__in=numeric_ids) | Q(sku__in=slug_ids)
        )

        # If user is authenticated, sync items into DB
        if request.user and request.user.is_authenticated:
            with transaction.atomic():
                WishlistItem.objects.filter(user=request.user).delete()
                for prod in products:
                    WishlistItem.objects.create(user=request.user, product_id=prod.id)

        # Maintain original order of requested IDs
        prod_map = {}
        for p in products:
            prod_map[str(p.id)] = p
            if getattr(p, "sku", None):
                prod_map[str(p.sku)] = p
            if getattr(p, "slug", None):
                prod_map[str(p.slug)] = p

        ordered_products = []
        seen = set()
        for pid in cleaned_ids:
            if pid in prod_map and prod_map[pid].id not in seen:
                ordered_products.append(prod_map[pid])
                seen.add(prod_map[pid].id)

        serializer = ProductSerializer(ordered_products, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)