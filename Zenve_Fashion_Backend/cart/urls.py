from django.urls import path
from .views import CartSyncAPIView, CartPromoAPIView

urlpatterns = [
    path("sync", CartSyncAPIView.as_view(), name="cart-sync-noslash"),
    path("sync/", CartSyncAPIView.as_view(), name="cart-sync"),
    path("promo", CartPromoAPIView.as_view(), name="cart-promo-noslash"),
    path("promo/", CartPromoAPIView.as_view(), name="cart-promo"),
]