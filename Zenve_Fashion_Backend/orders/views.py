from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Order, OrderItem
from .serializers import OrderSerializer


class OrderListCreateAPIView(APIView):
    """
    POST /api/orders/ - Place new order (supports guest and authenticated)
    GET  /api/orders/ - List orders for authenticated user
    """
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            orders = Order.objects.filter(user=request.user).prefetch_related("items").order_by("-created_at")
        else:
            orders = Order.objects.none()
        serializer = OrderSerializer(orders, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def post(self, request):
        data = request.data
        if not data:
            return Response({"error": "Empty order data"}, status=status.HTTP_400_BAD_REQUEST)

        shipping_address = data.get("shippingAddress", {})
        raw_items = data.get("items", [])

        # Strictly derive user identity from backend auth security context, never client payload
        if request.user and request.user.is_authenticated:
            user = request.user
            user_id_str = str(request.user.id)
        else:
            user = None
            user_id_str = "guest"

        subtotal = Decimal(str(data.get("subtotal", 0)))
        discount = Decimal(str(data.get("discount", 0)))
        shipping = Decimal(str(data.get("shipping", 0)))
        total = Decimal(str(data.get("total", 0)))
        payment_method = str(data.get("paymentMethod", "cod")).upper()
        payment_status = str(data.get("paymentStatus", "pending")).capitalize()
        order_status = str(data.get("orderStatus", "placed")).capitalize()
        delivery = data.get("estimatedDelivery", "3-5 Business Days")

        order = Order.objects.create(
            user=user,
            user_id_string=user_id_str,
            order_number=data.get("orderNumber"),
            subtotal=subtotal,
            discount=discount,
            shipping=shipping,
            total=total,
            payment_status=payment_status,
            payment_method=payment_method,
            order_status=order_status,
            shipping_full_name=shipping_address.get("fullName", "Valued Client"),
            shipping_phone=shipping_address.get("mobile", ""),
            shipping_email=shipping_address.get("email", ""),
            shipping_address_line1=shipping_address.get("addressLine1", ""),
            shipping_address_line2=shipping_address.get("addressLine2", ""),
            shipping_city=shipping_address.get("city", ""),
            shipping_state=shipping_address.get("state", ""),
            shipping_country=shipping_address.get("country", "India"),
            shipping_postal_code=shipping_address.get("pincode", ""),
            estimated_delivery=delivery,
        )

        # Create OrderItems
        for item in raw_items:
            product_dict = item.get("product", {}) if isinstance(item.get("product"), dict) else {}
            pid = str(product_dict.get("id") or item.get("product_id") or "1")
            name = product_dict.get("name") or item.get("product_name") or "Atelier Piece"
            imgs = product_dict.get("images", [])
            img = imgs[0] if imgs else (item.get("product_image") or "")
            qty = max(1, int(item.get("quantity", 1)))
            price = Decimal(str(item.get("price") or product_dict.get("price") or 0))

            selected_size = item.get("selectedSize") or item.get("size") or "Free Size"
            selected_color = item.get("selectedColor")
            color_name = "Standard"
            if isinstance(selected_color, dict):
                color_name = selected_color.get("name", "Standard")
            elif isinstance(selected_color, str):
                color_name = selected_color

            OrderItem.objects.create(
                order=order,
                product_id=pid,
                product_name=name,
                product_image=img,
                product_data=product_dict,
                quantity=qty,
                price=price,
                size=selected_size,
                color=color_name,
            )

        serializer = OrderSerializer(order, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderDetailAPIView(APIView):
    """
    GET /api/orders/<idOrNumber>/
    Strictly verifies ownership: A customer can only access their own order.
    """
    permission_classes = [AllowAny]

    def get(self, request, idOrNumber):
        target = str(idOrNumber).replace("ord-", "").strip()
        order = None
        if target.isdigit():
            order = Order.objects.filter(id=int(target)).first()
        if not order:
            order = Order.objects.filter(order_number__iexact=str(idOrNumber)).first()

        if not order:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Strict Authorization Check:
        if order.user is not None:
            # Order belongs to a registered customer.
            if not request.user or not request.user.is_authenticated:
                return Response(
                    {"detail": "Authentication required to view this order."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            if order.user != request.user and not (request.user.is_staff or request.user.is_superuser):
                return Response(
                    {"detail": "You do not have permission to view another customer's order."},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            # Guest order: allow if requested by staff, or matching verification
            is_staff = bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))
            if not is_staff:
                order_email = (order.shipping_email or "").strip().lower()
                query_email = str(request.query_params.get("email") or request.headers.get("X-Order-Email", "")).strip().lower()
                user_email = (request.user.email or "").strip().lower() if (request.user and request.user.is_authenticated) else ""
                
                # Allow if email matches
                if order_email and query_email != order_email and user_email != order_email:
                    return Response(
                        {"detail": "You do not have permission to view this order."},
                        status=status.HTTP_403_FORBIDDEN
                    )

        serializer = OrderSerializer(order, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)