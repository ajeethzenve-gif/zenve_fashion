from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from accounts.models import Customer
from products.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


<<<<<<< HEAD
class CartAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        customer = get_object_or_404(
            Customer,
            user=request.user
        )

        cart, created = Cart.objects.get_or_create(
            customer=customer
        )

        serializer = CartSerializer(cart)

        return Response(serializer.data)


class AddToCartAPIView(APIView):

    permission_classes = [IsAuthenticated]
=======
class CartSyncAPIView(APIView):
    """
    GET    /api/cart/      - Retrieve authenticated customer's cart items
    POST   /api/cart/sync/ - Synchronizes cart items strictly under authenticated user
    DELETE /api/cart/      - Clears customer's cart items in database
    """
    permission_classes = [AllowAny]
>>>>>>> 1102f7b78adaff24eee42324a35edbe7ea9083e2

    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response([], status=status.HTTP_200_OK)

        items = CartItem.objects.filter(user=request.user)
        results = []
        for item in items:
            results.append({
                "id": f"{item.product_id}-{item.size}-{item.color}",
                "product": {
                    "id": str(item.product_id),
                    "name": item.product_name,
                    "price": float(item.price),
                    "images": [item.product_image] if item.product_image else [],
                },
                "selectedSize": item.size or "Standard",
                "selectedColor": {"name": item.color or "Standard", "hex": "#E4BD5A"},
                "quantity": item.quantity,
                "price": float(item.price),
            })
        return Response(results, status=status.HTTP_200_OK)

    def delete(self, request):
        if request.user and request.user.is_authenticated:
            CartItem.objects.filter(user=request.user).delete()
        return Response({"message": "Cart cleared successfully."}, status=status.HTTP_200_OK)

    def post(self, request):

<<<<<<< HEAD
        customer = get_object_or_404(
            Customer,
            user=request.user
        )
=======
        # If user is authenticated, sync strictly to authenticated user's records
        if request.user and request.user.is_authenticated:
            with transaction.atomic():
                # Clear previous items for this specific user only
                CartItem.objects.filter(user=request.user).delete()
                for item in raw_items:
                    product_data = item.get("product") if isinstance(item.get("product"), dict) else {}
                    prod_id_val = product_data.get("id") or item.get("productId") or 1
                    try:
                        pid = int(prod_id_val)
                    except (ValueError, TypeError):
                        pid = 1
>>>>>>> 1102f7b78adaff24eee42324a35edbe7ea9083e2

        cart, created = Cart.objects.get_or_create(
            customer=customer
        )

        product_id = request.data.get("product_id")

        quantity = int(request.data.get("quantity", 1))

        product = get_object_or_404(
            Product,
            id=product_id
        )

        if quantity <= 0:

            return Response(
                {
                    "message": "Quantity must be greater than zero."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity > product.stock:

            return Response(
                {
                    "message": "Insufficient stock."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item, created = CartItem.objects.get_or_create(

            cart=cart,

            product=product,

            defaults={
                "quantity": quantity
            }

        )

        if not created:

            new_quantity = cart_item.quantity + quantity

            if new_quantity > product.stock:

                return Response(
                    {
                        "message": "Insufficient stock."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = new_quantity

            cart_item.save()

        serializer = CartSerializer(cart)

        return Response(

            {
                "message": "Product added to cart.",
                "cart": serializer.data
            },

            status=status.HTTP_200_OK

        )


class UpdateCartAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        customer = get_object_or_404(
            Customer,
            user=request.user
        )

        cart = get_object_or_404(
            Cart,
            customer=customer
        )

        product_id = request.data.get("product_id")

        quantity = int(request.data.get("quantity"))

        cart_item = get_object_or_404(

            CartItem,

            cart=cart,

            product_id=product_id

        )

        if quantity <= 0:

            cart_item.delete()

        else:

            if quantity > cart_item.product.stock:

                return Response(

                    {
                        "message": "Insufficient stock."
                    },

                    status=status.HTTP_400_BAD_REQUEST

                )

            cart_item.quantity = quantity

            cart_item.save()

        serializer = CartSerializer(cart)

        return Response(

            {
                "message": "Cart updated successfully.",
                "cart": serializer.data
            }

        )


class RemoveCartItemAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):

        customer = get_object_or_404(
            Customer,
            user=request.user
        )

        cart = get_object_or_404(
            Cart,
            customer=customer
        )

        cart_item = get_object_or_404(

            CartItem,

            cart=cart,

            product_id=product_id

        )

        cart_item.delete()

        serializer = CartSerializer(cart)

        return Response(

            {
                "message": "Product removed from cart.",
                "cart": serializer.data
            }

        )