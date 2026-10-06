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
        raw_order_status = str(data.get("orderStatus") or data.get("order_status") or "Placed").strip()
        clean_os = raw_order_status.lower().replace("_", " ")
        status_map = {
            "pending": "Pending",
            "placed": "Placed",
            "confirmed": "Confirmed",
            "processing": "Processing",
            "shipped": "Shipped",
            "out for delivery": "Out for Delivery",
            "delivered": "Delivered",
            "cancelled": "Cancelled",
            "returned": "Returned",
        }
        order_status = status_map.get(clean_os, "Placed")
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
    GET   /api/orders/<idOrNumber>/ - Retrieve order details
    PATCH /api/orders/<idOrNumber>/ - Update order status, payment status, delivery (Admin/Staff or owner cancellation)
    PUT   /api/orders/<idOrNumber>/ - Alias to PATCH
    """
    permission_classes = [AllowAny]

    def _get_order(self, idOrNumber):
        target = str(idOrNumber).replace("ord-", "").strip()
        order = None
        if target.isdigit():
            order = Order.objects.filter(id=int(target)).first()
        if not order:
            order = Order.objects.filter(order_number__iexact=str(idOrNumber)).first()
        return order

    def get(self, request, idOrNumber):
        order = self._get_order(idOrNumber)

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

    def patch(self, request, idOrNumber):
        order = self._get_order(idOrNumber)
        if not order:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        is_staff = bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))
        is_owner = bool(request.user and request.user.is_authenticated and order.user == request.user)

        if not (is_staff or is_owner):
            return Response(
                {"detail": "Authentication required to update this order."},
                status=status.HTTP_401_UNAUTHORIZED if not (request.user and request.user.is_authenticated) else status.HTTP_403_FORBIDDEN
            )

        data = request.data
        new_order_status = data.get("orderStatus") or data.get("order_status")
        new_payment_status = data.get("paymentStatus") or data.get("payment_status")
        estimated_delivery = data.get("estimatedDelivery") or data.get("estimated_delivery")

        if new_order_status:
            clean_s = str(new_order_status).strip().lower().replace("_", " ")
            status_map = {
                "pending": "Pending",
                "placed": "Placed",
                "confirmed": "Confirmed",
                "processing": "Processing",
                "shipped": "Shipped",
                "out for delivery": "Out for Delivery",
                "delivered": "Delivered",
                "cancelled": "Cancelled",
                "returned": "Returned",
            }
            if clean_s not in status_map:
                return Response(
                    {"detail": f"Invalid order status '{new_order_status}'. Allowed choices: {list(status_map.keys())}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not is_staff:
                if clean_s != "cancelled":
                    return Response(
                        {"detail": "Only staff members can update orders to statuses other than 'cancelled'."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                if order.order_status.lower() in ["shipped", "out for delivery", "delivered", "cancelled"]:
                    return Response(
                        {"detail": f"Cannot cancel an order that is already {order.order_status}."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            order.order_status = status_map[clean_s]

        if new_payment_status and is_staff:
            clean_p = str(new_payment_status).strip().lower()
            payment_map = {
                "pending": "Pending",
                "paid": "Paid",
                "failed": "Failed",
                "refunded": "Refunded",
                "partially refunded": "Partially Refunded",
            }
            if clean_p in payment_map:
                order.payment_status = payment_map[clean_p]

        if estimated_delivery and is_staff:
            order.estimated_delivery = str(estimated_delivery).strip()

        order.save()
        serializer = OrderSerializer(order, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, idOrNumber):
        return self.patch(request, idOrNumber)