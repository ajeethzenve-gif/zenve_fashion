from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
from .models import CartItem


class CartSyncAPIView(APIView):
    """
    POST /api/cart/sync/
    Synchronizes cart items for both authenticated and guest shoppers.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        raw_items = request.data.get("items", [])
        if not isinstance(raw_items, list):
            return Response({"message": "items must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        # If user is authenticated, sync to DB
        if request.user and request.user.is_authenticated:
            with transaction.atomic():
                # Clear previous or reconcile
                CartItem.objects.filter(user=request.user).delete()
                for item in raw_items:
                    product_data = item.get("product") if isinstance(item.get("product"), dict) else {}
                    prod_id_val = product_data.get("id") or item.get("productId") or 1
                    try:
                        pid = int(prod_id_val)
                    except (ValueError, TypeError):
                        pid = 1

                    name = product_data.get("name") or item.get("productName") or "Atelier Piece"
                    imgs = product_data.get("images") or [item.get("productImage")]
                    img = imgs[0] if imgs and imgs[0] else ""
                    qty = max(1, int(item.get("quantity", 1)))
                    price = Decimal(str(item.get("price") or product_data.get("price") or 0))

                    selected_size = item.get("selectedSize") or item.get("size") or ""
                    selected_color = item.get("selectedColor")
                    color_str = ""
                    if isinstance(selected_color, dict):
                        color_str = selected_color.get("name", "")
                    elif isinstance(selected_color, str):
                        color_str = selected_color

                    CartItem.objects.create(
                        user=request.user,
                        product_id=pid,
                        product_name=name,
                        product_image=img,
                        quantity=qty,
                        price=price,
                        size=selected_size,
                        color=color_str,
                    )

        # Return items exactly as frontend expects
        return Response(raw_items, status=status.HTTP_200_OK)


class CartPromoAPIView(APIView):
    """
    POST /api/cart/promo/
    Validates luxury atelier invitation and promo codes.
    Available to all shoppers (guest & authenticated).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        code = str(request.data.get("code", "")).strip().upper()

        promo_map = {
            "ZENVE10": (10, "10% Atelier Welcome Privileges Applied"),
            "TWINLOVE": (15, "15% Twin Edit Privilege Applied"),
            "WELCOME20": (20, "20% Exclusive Member Privilege Applied"),
            "FASHION15": (15, "15% Haute Couture Privilege Applied"),
        }

        if code in promo_map:
            discount, message = promo_map[code]
            return Response(
                {
                    "valid": True,
                    "discountPercentage": discount,
                    "message": message,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "valid": False,
                "discountPercentage": 0,
                "message": "Invalid or expired invitation code.",
            },
            status=status.HTTP_200_OK,
        )