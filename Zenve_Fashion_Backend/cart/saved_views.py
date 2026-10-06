from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from accounts.models import Customer
from products.models import Product
from products.serializers import ProductSerializer
from .models import Cart, CartItem


def cart_data(user, request):
    result = []
    for item in CartItem.objects.filter(user=user, product__isnull=False).select_related("product"):
        product = ProductSerializer(item.product, context={"request": request}).data
        result.append({"id": f"{product['id']}-{item.size}-{item.color}",
                       "product": product, "selectedSize": item.size,
                       "selectedColor": {"name": item.color, "hex": item.color_hex},
                       "quantity": item.quantity, "price": product["price"]})
    return result


class SavedCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer = get_object_or_404(Customer, user=request.user)
        return Response(cart_data(request.user, request))

    def delete(self, request):
        customer = get_object_or_404(Customer, user=request.user)
        CartItem.objects.filter(user=request.user).delete()
        return Response([])

    @transaction.atomic
    def post(self, request):
        customer = get_object_or_404(Customer, user=request.user)
        raw = request.data.get("items")
        if not isinstance(raw, list) or len(raw) > 200:
            raise ValidationError({"message": "Invalid cart items."})
        rows = []
        seen = set()
        for item in raw:
            try:
                pid = item["product"]["id"]
                product = get_object_or_404(Product, pk=int(pid))
                quantity = item["quantity"]
                if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
                    raise ValueError()
                size = str(item["selectedSize"])
                color = str(item["selectedColor"]["name"])
                color_hex = str(item["selectedColor"].get("hex", "#E4BD5A"))
                if not size or len(size)>50 or not color or len(color)>100 or len(color_hex)>20:
                    raise ValueError()
            except (KeyError, TypeError, ValueError):
                raise ValidationError({"message": "Invalid cart item."})
            if quantity > product.inventory_quantity:
                raise ValidationError({"message": "Insufficient stock."})
            identity = (product.pk, size, color)
            if identity in seen:
                raise ValidationError({"message": "Duplicate cart item."})
            seen.add(identity)
            rows.append((product, quantity, size, color, color_hex))
        Customer.objects.select_for_update().get(pk=customer.pk)
        CartItem.objects.filter(user=request.user).delete()
        CartItem.objects.bulk_create([CartItem(user=request.user, product=p, quantity=q, size=s, color=c, color_hex=h, product_name=p.product_name, price=p.selling_price)
                                      for p,q,s,c,h in rows])
        return Response(cart_data(request.user, request))
