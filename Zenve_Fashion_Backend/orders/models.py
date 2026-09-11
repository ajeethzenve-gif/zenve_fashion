from django.db import models
from django.contrib.auth.models import User


# ============================================================
# ORDER
# ============================================================

class Order(models.Model):

    PAYMENT_STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Paid", "Paid"),
        ("Failed", "Failed"),
        ("Refunded", "Refunded"),
        ("Partially Refunded", "Partially Refunded"),
    )

    ORDER_STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Processing", "Processing"),
        ("Shipped", "Shipped"),
        ("Out for Delivery", "Out for Delivery"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
        ("Returned", "Returned"),
    )

    PAYMENT_METHOD_CHOICES = (
        ("COD", "Cash on Delivery"),
        ("Cash on Delivery", "Cash on Delivery"),
        ("Razorpay", "Razorpay"),
        ("Wallet", "Wallet"),
        ("UPI", "UPI"),
        ("Card", "Card"),
        ("Net Banking", "Net Banking"),
    )

    # --------------------------------------------------------
    # User
    # --------------------------------------------------------

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    user_id_string = models.CharField(
        max_length=100,
        default="guest",
        blank=True,
    )

    # --------------------------------------------------------
    # Order identification
    # --------------------------------------------------------

    order_number = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
    )

    # --------------------------------------------------------
    # Amounts
    # --------------------------------------------------------

    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    shipping = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # --------------------------------------------------------
    # Payment
    # --------------------------------------------------------

    payment_status = models.CharField(
        max_length=30,
        choices=PAYMENT_STATUS_CHOICES,
        default="Pending",
    )

    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        default="COD",
    )

    # --------------------------------------------------------
    # Order status
    # --------------------------------------------------------

    order_status = models.CharField(
        max_length=50,
        choices=ORDER_STATUS_CHOICES,
        default="Pending",
    )

    # --------------------------------------------------------
    # Shipping address
    # --------------------------------------------------------

    shipping_full_name = models.CharField(
        max_length=100,
    )

    shipping_phone = models.CharField(
        max_length=15,
    )

    shipping_email = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    shipping_address_line1 = models.CharField(
        max_length=255,
    )

    shipping_address_line2 = models.CharField(
        max_length=255,
        blank=True,
    )

    shipping_city = models.CharField(
        max_length=100,
    )

    shipping_state = models.CharField(
        max_length=100,
    )

    shipping_country = models.CharField(
        max_length=100,
        default="India",
    )

    shipping_postal_code = models.CharField(
        max_length=10,
    )

    # --------------------------------------------------------
    # Delivery
    # --------------------------------------------------------

    estimated_delivery = models.CharField(
        max_length=100,
        default="3-5 Business Days",
        blank=True,
        null=True,
    )

    # --------------------------------------------------------
    # Timestamps
    # --------------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number or f"Order {self.id}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new and not self.order_number:
            import random
            self.order_number = f"ZNV-{self.created_at.year}-{1000 + self.id}"
            super().save(update_fields=["order_number"])


# ============================================================
# ORDER ITEM
# ============================================================

class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product_id = models.CharField(
        max_length=100,
        default="",
    )

    product_name = models.CharField(
        max_length=255,
    )

    product_image = models.TextField(
        blank=True,
        null=True,
    )

    product_data = models.JSONField(
        default=dict,
        blank=True,
    )

    quantity = models.PositiveIntegerField(
        default=1,
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    # Optional variant information
    size = models.CharField(
        max_length=50,
        blank=True,
    )

    color = models.CharField(
        max_length=100,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def save(self, *args, **kwargs):

        self.total = self.price * self.quantity

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"