from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db.models import Q

from .models import Product
from .serializers import ProductSerializer


# ============================================================
# PUBLIC PRODUCT QUERYSET
# ============================================================

def get_public_products():
    """
    Public storefront should show ONLY:

    1. Approved products
    2. Active products
    """

    return Product.objects.filter(
        status=Product.ProductStatus.APPROVED,
        is_active=True,
    )


# ============================================================
# PRODUCT LIST
# GET /api/products/
# ============================================================

class ProductListAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        qs = get_public_products()

        # ----------------------------------------------------
        # CATEGORY / AUDIENCE
        # ----------------------------------------------------

        category = (
            request.query_params.get("category")
            or request.query_params.get("audience")
        )

        if category and category.lower() != "all":

            category = category.strip().lower()

            if category == "pets":

                qs = qs.filter(
                    Q(category__icontains="pet")
                    |
                    Q(category__icontains="dog")
                    |
                    Q(category__icontains="cat")
                )

            elif category == "twin":

                qs = qs.filter(
                    Q(category__icontains="twin")
                    |
                    Q(category__icontains="pair")
                )

            elif category == "people":

                qs = qs.exclude(
                    Q(category__icontains="pet")
                    |
                    Q(category__icontains="dog")
                    |
                    Q(category__icontains="cat")
                    |
                    Q(category__icontains="twin")
                    |
                    Q(category__icontains="pair")
                )

            else:

                qs = qs.filter(
                    category__iexact=category
                )

        # ----------------------------------------------------
        # PRICE RANGE
        # ----------------------------------------------------

        min_price = request.query_params.get(
            "minPrice"
        )

        if min_price:

            try:

                qs = qs.filter(
                    selling_price__gte=float(
                        min_price
                    )
                )

            except (
                ValueError,
                TypeError
            ):

                pass

        max_price = request.query_params.get(
            "maxPrice"
        )

        if max_price:

            try:

                qs = qs.filter(
                    selling_price__lte=float(
                        max_price
                    )
                )

            except (
                ValueError,
                TypeError
            ):

                pass

        # ----------------------------------------------------
        # STOCK
        # ----------------------------------------------------

        in_stock_only = request.query_params.get(
            "inStockOnly"
        )

        if str(in_stock_only).lower() in [
            "true",
            "1",
        ]:

            qs = qs.filter(
                inventory_quantity__gt=0
            )

        # ----------------------------------------------------
        # SEARCH
        # ----------------------------------------------------

        search_query = (
            request.query_params.get("searchQuery")
            or request.query_params.get("search")
        )

        if search_query:

            query = search_query.strip()

            if query:

                qs = qs.filter(
                    Q(product_name__icontains=query)
                    |
                    Q(description__icontains=query)
                    |
                    Q(material__icontains=query)
                    |
                    Q(category__icontains=query)
                    |
                    Q(subcategory__icontains=query)
                    |
                    Q(colour__icontains=query)
                    |
                    Q(sku__icontains=query)
                )

        # ----------------------------------------------------
        # SORTING
        # ----------------------------------------------------

        sort = request.query_params.get(
            "sort",
            "newest"
        )

        if sort == "price-low":

            qs = qs.order_by(
                "selling_price"
            )

        elif sort == "price-asc":

            qs = qs.order_by(
                "selling_price"
            )

        elif sort == "price-high":

            qs = qs.order_by(
                "-selling_price"
            )

        elif sort == "price-desc":

            qs = qs.order_by(
                "-selling_price"
            )

        elif sort == "newest":

            qs = qs.order_by(
                "-created_at"
            )

        else:

            qs = qs.order_by(
                "-created_at"
            )

        # ----------------------------------------------------
        # SERIALIZE
        # ----------------------------------------------------

        serializer = ProductSerializer(
            qs,
            many=True,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# PRODUCT DETAIL
# GET /api/products/<slug>/
# ============================================================

class ProductDetailBySlugAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, slug):

        # Only approved + active products
        qs = get_public_products()

        product = None

        # ----------------------------------------------------
        # ID
        # ----------------------------------------------------

        if str(slug).isdigit():

            product = qs.filter(
                id=int(slug)
            ).first()

        # ----------------------------------------------------
        # SKU
        # ----------------------------------------------------

        if not product:

            product = qs.filter(
                sku__iexact=str(slug)
            ).first()

        # ----------------------------------------------------
        # NOT FOUND
        # ----------------------------------------------------

        if not product:

            return Response(
                {
                    "detail": "Product not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProductSerializer(
            product,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# ATELIER PICKS
# GET /api/products/atelier-picks/
# ============================================================

class AtelierPicksAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        # ONLY APPROVED + ACTIVE PRODUCTS
        qs = get_public_products()

        # The current Product model does not contain
        # featured or atelier_pick fields.
        #
        # Therefore, use the newest approved products
        # as Atelier Picks.

        picks = qs.order_by(
            "-created_at"
        )[:8]

        serializer = ProductSerializer(
            picks,
            many=True,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# CATEGORY PRODUCTS
# GET /api/products/category/<category>/
# ============================================================

class ProductCategoryAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, category):

        qs = get_public_products()

        category = category.strip().lower()

        if category == "pets":

            qs = qs.filter(
                Q(category__icontains="pet")
                |
                Q(category__icontains="dog")
                |
                Q(category__icontains="cat")
            )

        elif category == "twin":

            qs = qs.filter(
                Q(category__icontains="twin")
                |
                Q(category__icontains="pair")
            )

        elif category == "people":

            qs = qs.exclude(
                Q(category__icontains="pet")
                |
                Q(category__icontains="dog")
                |
                Q(category__icontains="cat")
                |
                Q(category__icontains="twin")
                |
                Q(category__icontains="pair")
            )

        else:

            qs = qs.filter(
                category__iexact=category
            )

        qs = qs.order_by(
            "-created_at"
        )

        serializer = ProductSerializer(
            qs,
            many=True,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# RELATED PRODUCTS
# GET /api/products/<productId>/related/
# ============================================================

class RelatedProductsAPIView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, productId):

        try:

            limit = int(
                request.query_params.get(
                    "limit",
                    4
                )
            )

        except (
            ValueError,
            TypeError
        ):

            limit = 4

        # Keep limit reasonable
        limit = max(
            1,
            min(limit, 20)
        )

        category = request.query_params.get(
            "category"
        )

        # ONLY APPROVED + ACTIVE
        qs = get_public_products()

        # ----------------------------------------------------
        # EXCLUDE CURRENT PRODUCT
        # ----------------------------------------------------

        if str(productId).isdigit():

            qs = qs.exclude(
                id=int(productId)
            )

        else:

            qs = qs.exclude(
                sku__iexact=str(productId)
            )

        # ----------------------------------------------------
        # CATEGORY
        # ----------------------------------------------------

        if category and category.lower() != "all":

            category = category.strip().lower()

            if category == "pets":

                qs = qs.filter(
                    Q(category__icontains="pet")
                    |
                    Q(category__icontains="dog")
                    |
                    Q(category__icontains="cat")
                )

            elif category == "twin":

                qs = qs.filter(
                    Q(category__icontains="twin")
                    |
                    Q(category__icontains="pair")
                )

            else:

                qs = qs.filter(
                    category__iexact=category
                )

        # ----------------------------------------------------
        # RESULTS
        # ----------------------------------------------------

        related = qs.order_by(
            "-created_at"
        )[:limit]

        serializer = ProductSerializer(
            related,
            many=True,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )