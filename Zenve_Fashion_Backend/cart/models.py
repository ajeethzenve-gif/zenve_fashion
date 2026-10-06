from django.db import models

from accounts.models import Customer
from products.models import Product


class Cart(models.Model):

    customer = models.OneToOneField(
        Customer,
        null=True, blank=True,
        on_delete=models.CASCADE,
        related_name="cart"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.customer.user.username


class CartItem(models.Model):

    user = models.ForeignKey("auth.User", null=True, on_delete=models.CASCADE)
    product_name = models.CharField(max_length=255, default="")
    product_image = models.URLField(blank=True, default="")
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    product = models.ForeignKey(
        Product,
        null=True, blank=True,
        on_delete=models.CASCADE
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    size = models.CharField(max_length=50, default="Standard")
    color = models.CharField(max_length=100, default="Standard")
    color_hex = models.CharField(max_length=20, default="#E4BD5A")

    class Meta:
        unique_together = ("user", "product", "size", "color")

    @property
    def subtotal(self):
        return self.product.price * self.quantity

    def __str__(self):
        return f"{self.product.product_name} ({self.quantity})"