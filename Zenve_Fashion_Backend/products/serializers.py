from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """
    Public Product Serializer for Zenve Fashion.

    Only fields that actually exist in the Product model are used.
    """

    id = serializers.SerializerMethodField()

    name = serializers.CharField(
        source="product_name"
    )

    description = serializers.CharField(
        allow_blank=True,
        allow_null=True,
        required=False
    )

    category = serializers.SerializerMethodField()

    collection = serializers.SerializerMethodField()

    collectionSlug = serializers.SerializerMethodField()

    price = serializers.SerializerMethodField()

    originalPrice = serializers.SerializerMethodField()

    discount = serializers.SerializerMethodField()

    rating = serializers.SerializerMethodField()

    reviewCount = serializers.SerializerMethodField()

    images = serializers.SerializerMethodField()

    colors = serializers.SerializerMethodField()

    sizes = serializers.SerializerMethodField()

    stock = serializers.IntegerField(
        source="inventory_quantity"
    )

    designer = serializers.SerializerMethodField()

    occasion = serializers.SerializerMethodField()

    badge = serializers.SerializerMethodField()

    material = serializers.SerializerMethodField()

    careInstructions = serializers.SerializerMethodField()

    featured = serializers.SerializerMethodField()

    atelierPick = serializers.SerializerMethodField()

    createdAt = serializers.SerializerMethodField()

    slug = serializers.SerializerMethodField()

    status = serializers.CharField(
        read_only=True
    )

    isLive = serializers.BooleanField(
        source="is_live",
        read_only=True
    )

    isActive = serializers.BooleanField(
        source="is_active",
        read_only=True
    )

    fulfilmentLocation = serializers.CharField(
        source="fulfilment_location",
        read_only=True
    )

    fastDelivery = serializers.BooleanField(
        source="fast_delivery",
        read_only=True
    )

    returnPolicy = serializers.CharField(
        source="return_policy",
        read_only=True
    )

    # =========================================================
    # META
    # =========================================================

    class Meta:
        model = Product

        fields = [
            "id",
            "slug",
            "name",
            "description",
            "category",
            "collection",
            "collectionSlug",
            "price",
            "originalPrice",
            "discount",
            "rating",
            "reviewCount",
            "images",
            "colors",
            "sizes",
            "stock",
            "designer",
            "occasion",
            "badge",
            "sku",
            "material",
            "careInstructions",
            "featured",
            "atelierPick",
            "createdAt",

            # Additional useful product fields
            "status",
            "isLive",
            "isActive",
            "fulfilmentLocation",
            "fastDelivery",
            "returnPolicy",
        ]

    # =========================================================
    # ID
    # =========================================================

    def get_id(self, obj):
        return str(obj.id)

    # =========================================================
    # SLUG
    # =========================================================

    def get_slug(self, obj):
        """
        Product model does not have a slug field.
        Use SKU as a stable frontend identifier.
        """

        return str(obj.sku)

    # =========================================================
    # CATEGORY
    # =========================================================

    def get_category(self, obj):

        category = (obj.category or "people").strip().lower()

        if category in [
            "people",
            "pets",
            "twin",
        ]:
            return category

        if (
            "pet" in category
            or "dog" in category
            or "cat" in category
        ):
            return "pets"

        if (
            "twin" in category
            or "pair" in category
        ):
            return "twin"

        return "people"

    # =========================================================
    # COLLECTION
    # =========================================================

    def get_collection(self, obj):

        # Product model currently has no collection field.
        return "Signature Atelier"

    # =========================================================
    # COLLECTION SLUG
    # =========================================================

    def get_collectionSlug(self, obj):

        return "signature-atelier"

    # =========================================================
    # PRICE
    # =========================================================

    def get_price(self, obj):

        if obj.selling_price is None:
            return 0.0

        return float(obj.selling_price)

    # =========================================================
    # ORIGINAL PRICE
    # =========================================================

    def get_originalPrice(self, obj):

        if obj.mrp is None:
            return self.get_price(obj)

        return float(obj.mrp)

    # =========================================================
    # DISCOUNT
    # =========================================================

    def get_discount(self, obj):

        if obj.discount_percentage is not None:
            return int(
                round(
                    float(obj.discount_percentage)
                )
            )

        if (
            obj.mrp
            and obj.selling_price
            and obj.mrp > obj.selling_price
        ):
            return int(
                round(
                    (
                        (
                            float(obj.mrp)
                            - float(obj.selling_price)
                        )
                        / float(obj.mrp)
                    )
                    * 100
                )
            )

        return 0

    # =========================================================
    # RATING
    # =========================================================

    def get_rating(self, obj):

        # Product model currently has no rating field.
        return 5.0

    # =========================================================
    # REVIEW COUNT
    # =========================================================

    def get_reviewCount(self, obj):

        # Product model currently has no review_count field.
        return 0

    # =========================================================
    # IMAGES
    # =========================================================

    def get_images(self, obj):

        images = []

        if obj.primary_image:

            request = self.context.get("request")

            if request:

                images.append(
                    request.build_absolute_uri(
                        obj.primary_image.url
                    )
                )

            else:

                images.append(
                    obj.primary_image.url
                )

        if not images:

            images.append(
                "/images/products/people-evening-1.jpg"
            )

        return images

    # =========================================================
    # COLORS
    # =========================================================

    def get_colors(self, obj):

        if obj.colour:

            return [
                {
                    "name": obj.colour,
                    "hex": "#1A1A1A",
                }
            ]

        return [
            {
                "name": "Midnight Noir",
                "hex": "#1A1A1A",
            }
        ]

    # =========================================================
    # SIZES
    # =========================================================

    def get_sizes(self, obj):

        if obj.size:

            return [obj.size]

        return ["FREE"]

    # =========================================================
    # DESIGNER
    # =========================================================

    def get_designer(self, obj):

        if obj.designer:

            return str(obj.designer)

        return "Zenve Atelier"

    # =========================================================
    # OCCASION
    # =========================================================

    def get_occasion(self, obj):

        # Product model currently has no occasion field.
        return None

    # =========================================================
    # BADGE
    # =========================================================

    def get_badge(self, obj):

        if obj.status == Product.ProductStatus.APPROVED:
            return "Approved"

        return None

    # =========================================================
    # MATERIAL
    # =========================================================

    def get_material(self, obj):

        return (
            obj.material
            or "100% Mulberry Silk & Cashmere Blend"
        )

    # =========================================================
    # CARE INSTRUCTIONS
    # =========================================================

    def get_careInstructions(self, obj):

        return (
            "Dry clean only. Store in garment pouch."
        )

    # =========================================================
    # FEATURED
    # =========================================================

    def get_featured(self, obj):

        return False

    # =========================================================
    # ATELIER PICK
    # =========================================================

    def get_atelierPick(self, obj):

        return False

    # =========================================================
    # CREATED AT
    # =========================================================

    def get_createdAt(self, obj):

        if obj.created_at:

            return obj.created_at.isoformat()

        return "2026-01-01T00:00:00Z"