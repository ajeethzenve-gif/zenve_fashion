from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import Customer
from products.models import Product

from .models import Wishlist
from .serializers import WishlistSerializer


<<<<<<< HEAD

class WishlistAPIView(APIView):
=======
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
>>>>>>> 1102f7b78adaff24eee42324a35edbe7ea9083e2

    permission_classes = [IsAuthenticated]


<<<<<<< HEAD
    # GET USER WISHLIST
    def get(self, request):

        customer = get_object_or_404(
            Customer,
            user=request.user
=======
        from django.db.models import Q
        products = Product.objects.filter(
            Q(id__in=numeric_ids) | Q(sku__in=slug_ids)
>>>>>>> 1102f7b78adaff24eee42324a35edbe7ea9083e2
        )


<<<<<<< HEAD
        wishlist = Wishlist.objects.filter(
            customer=customer
        )
=======
        # Maintain original order of requested IDs
        prod_map = {}
        for p in products:
            prod_map[str(p.id)] = p
            if getattr(p, "sku", None):
                prod_map[str(p.sku)] = p
            if getattr(p, "slug", None):
                prod_map[str(p.slug)] = p
>>>>>>> 1102f7b78adaff24eee42324a35edbe7ea9083e2


        serializer = WishlistSerializer(
            wishlist,
            many=True,
            context={
                "request": request
            }
        )


        return Response(
            serializer.data
        )



    # ADD PRODUCT TO WISHLIST
    def post(self, request):

        customer = get_object_or_404(
            Customer,
            user=request.user
        )


        product_id = request.data.get("product_id")


        product = get_object_or_404(
            Product,
            id=product_id
        )


        Wishlist.objects.get_or_create(

            customer=customer,

            product=product

        )


        return Response(
            {
                "message":"Added to wishlist"
            },
            status=status.HTTP_201_CREATED
        )



    # REMOVE PRODUCT
    def delete(self, request, product_id):

        customer = get_object_or_404(
            Customer,
            user=request.user
        )


        Wishlist.objects.filter(

            customer=customer,

            product_id=product_id

        ).delete()



        return Response(
            {
                "message":"Removed from wishlist"
            }
        )





class ToggleWishlistAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def post(self, request):


        customer = get_object_or_404(

            Customer,

            user=request.user

        )


        product = get_object_or_404(

            Product,

            id=request.data.get("product_id")

        )



        wishlist_item = Wishlist.objects.filter(

            customer=customer,

            product=product

        ).first()



        # REMOVE
        if wishlist_item:


            wishlist_item.delete()


            return Response(
                {

                    "in_wishlist":False,

                    "message":"Removed from wishlist"

                }
            )



        # ADD

        Wishlist.objects.create(

            customer=customer,

            product=product

        )


        return Response(
            {

                "in_wishlist":True,

                "message":"Added to wishlist"

            }
        )





class RemoveWishlistAPIView(APIView):

    permission_classes = [IsAuthenticated]


    def delete(self, request, product_id):


        customer = get_object_or_404(

            Customer,

            user=request.user

        )


        wishlist = Wishlist.objects.filter(

            customer=customer,

            product_id=product_id

        )



        if wishlist.exists():


            wishlist.delete()


            return Response(
                {
                    "message":"Removed from wishlist"
                }
            )



        return Response(
            {
                "message":"Product not found in wishlist"
            },
            status=status.HTTP_404_NOT_FOUND
        )