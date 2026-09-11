from rest_framework import serializers
from decimal import Decimal
from .models import Order, OrderItem


class OrderShippingAddressSerializer(serializers.Serializer):
    id = serializers.CharField(required=False, allow_blank=True)
    fullName = serializers.CharField(max_length=100)
    mobile = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True)
    addressLine1 = serializers.CharField(max_length=255)
    addressLine2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100, default="India")


class OrderSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    orderNumber = serializers.CharField(source="order_number")
    userId = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    shipping = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    paymentStatus = serializers.SerializerMethodField()
    orderStatus = serializers.SerializerMethodField()
    paymentMethod = serializers.SerializerMethodField()
    shippingAddress = serializers.SerializerMethodField()
    estimatedDelivery = serializers.SerializerMethodField()
    createdAt = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "orderNumber",
            "userId",
            "items",
            "subtotal",
            "discount",
            "shipping",
            "total",
            "paymentStatus",
            "orderStatus",
            "paymentMethod",
            "shippingAddress",
            "estimatedDelivery",
            "createdAt",
        ]

    def get_id(self, obj):
        return f"ord-{obj.id}"

    def get_userId(self, obj):
        if obj.user:
            return str(obj.user.id)
        return obj.user_id_string or "guest"

    def get_subtotal(self, obj):
        return float(obj.subtotal)

    def get_discount(self, obj):
        return float(obj.discount)

    def get_shipping(self, obj):
        return float(obj.shipping)

    def get_total(self, obj):
        return float(obj.total)

    def get_paymentStatus(self, obj):
        return (obj.payment_status or "pending").lower()

    def get_orderStatus(self, obj):
        return (obj.order_status or "placed").lower()

    def get_paymentMethod(self, obj):
        return (obj.payment_method or "cod").lower()

    def get_estimatedDelivery(self, obj):
        return obj.estimated_delivery or "3-5 Business Days"

    def get_createdAt(self, obj):
        return obj.created_at.isoformat() if obj.created_at else ""

    def get_shippingAddress(self, obj):
        return {
            "id": f"addr-{obj.id}",
            "fullName": obj.shipping_full_name,
            "mobile": obj.shipping_phone,
            "email": obj.shipping_email or (obj.user.email if obj.user else ""),
            "addressLine1": obj.shipping_address_line1,
            "addressLine2": obj.shipping_address_line2 or "",
            "city": obj.shipping_city,
            "state": obj.shipping_state,
            "pincode": obj.shipping_postal_code,
            "country": obj.shipping_country,
        }

    def get_items(self, obj):
        res = []
        for item in obj.items.all():
            p_data = item.product_data or {}
            # Reconstruct product dict for frontend CartItem contract
            product_dict = {
                "id": str(item.product_id),
                "name": item.product_name,
                "price": float(item.price),
                "images": [item.product_image] if item.product_image else ["/images/products/people-evening-1.jpg"],
                "category": p_data.get("category", "people"),
                "collection": p_data.get("collection", "Signature Atelier"),
                "slug": p_data.get("slug", f"product-{item.product_id}"),
                "description": p_data.get("description", ""),
                "originalPrice": p_data.get("originalPrice", float(item.price)),
                "discount": p_data.get("discount", 0),
                "rating": 5.0,
                "reviewCount": 0,
                "colors": [],
                "sizes": [],
                "stock": 10,
                "sku": p_data.get("sku", f"SKU-{item.product_id}"),
                "material": p_data.get("material", ""),
                "careInstructions": p_data.get("careInstructions", ""),
                "createdAt": "",
            }
            res.append({
                "product": product_dict,
                "selectedSize": item.size or "Free Size",
                "selectedColor": {"name": item.color or "Standard", "hex": "#1A1A1A"},
                "quantity": item.quantity,
                "price": float(item.price),
            })
        return res