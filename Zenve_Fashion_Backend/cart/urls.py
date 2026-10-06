from django.urls import path

from .views import (
    CartAPIView,
    AddToCartAPIView,
    UpdateCartAPIView,
    RemoveCartItemAPIView,
)

urlpatterns = [
<<<<<<< HEAD
    path("",CartAPIView.as_view(),name="cart"),
    path("add/",AddToCartAPIView.as_view(),name="add-cart"),
    path("update/",UpdateCartAPIView.as_view(),name="update-cart"),
    path("remove/<int:product_id>/",RemoveCartItemAPIView.as_view(),name="remove-cart"),
=======
    path("", CartSyncAPIView.as_view(), name="cart-root"),
    path("sync", CartSyncAPIView.as_view(), name="cart-sync-noslash"),
    path("sync/", CartSyncAPIView.as_view(), name="cart-sync"),
    path("promo", CartPromoAPIView.as_view(), name="cart-promo-noslash"),
    path("promo/", CartPromoAPIView.as_view(), name="cart-promo"),
>>>>>>> 1102f7b78adaff24eee42324a35edbe7ea9083e2
]