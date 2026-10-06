from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ("product_name", "product_id", "size", "color", "quantity", "price")
    readonly_fields = ("product_name", "product_id", "size", "color", "quantity", "price")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "shipping_full_name",
        "total",
        "payment_method",
        "payment_status",
        "order_status",
        "created_at",
    )
    list_editable = ("order_status", "payment_status")
    list_filter = ("order_status", "payment_status", "payment_method", "created_at")
    search_fields = (
        "order_number",
        "shipping_full_name",
        "shipping_phone",
        "shipping_email",
        "user__username",
        "user__email",
    )
    readonly_fields = (
        "order_number",
        "created_at",
        "updated_at",
        "total",
        "subtotal",
        "discount",
        "shipping",
    )
    fieldsets = (
        (
            "Commission Identification",
            {
                "fields": (
                    "order_number",
                    "user",
                    "user_id_string",
                    "created_at",
                    "updated_at",
                )
            },
        ),
        (
            "Financial & Processing Status",
            {
                "fields": (
                    "order_status",
                    "payment_status",
                    "payment_method",
                    "subtotal",
                    "discount",
                    "shipping",
                    "total",
                )
            },
        ),
        (
            "Client & Delivery Details",
            {
                "fields": (
                    "shipping_full_name",
                    "shipping_phone",
                    "shipping_email",
                    "shipping_address_line1",
                    "shipping_address_line2",
                    "shipping_city",
                    "shipping_state",
                    "shipping_country",
                    "shipping_postal_code",
                    "estimated_delivery",
                )
            },
        ),
    )
    inlines = [OrderItemInline]
    ordering = ("-created_at",)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_name", "size", "color", "quantity", "price")
    search_fields = ("order__order_number", "product_name", "product_id")
