from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from accounts.models import Customer
from products.models import Product
from products.serializers import ProductSerializer
from .models import Wishlist


class SavedWishlistAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def data(self, customer, request):
        products = Product.objects.filter(wishlist__customer=customer).distinct()
        return ProductSerializer(products, many=True, context={"request": request}).data

    def get(self, request):
        return Response(self.data(get_object_or_404(Customer, user=request.user), request))

    def delete(self, request):
        Wishlist.objects.filter(customer__user=request.user).delete()
        return Response([])

    @transaction.atomic
    def post(self, request):
        customer = get_object_or_404(Customer.objects.select_for_update(), user=request.user)
        ids = request.data.get("productIds")
        if not isinstance(ids, list) or len(ids)>200:
            raise ValidationError({"message": "Invalid wishlist."})
        try:
            ids = set(int(value) for value in ids)
        except (TypeError, ValueError):
            raise ValidationError({"message": "Invalid product ID."})
        products = list(Product.objects.filter(pk__in=ids))
        if len(products)!=len(ids):
            raise ValidationError({"message": "Product not found."})
        Wishlist.objects.filter(customer=customer).delete()
        Wishlist.objects.bulk_create([Wishlist(customer=customer, product=p) for p in products])
        return Response(self.data(customer, request))
