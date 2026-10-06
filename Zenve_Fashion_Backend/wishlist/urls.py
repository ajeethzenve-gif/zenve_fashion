from django.urls import path

from .views import (
    WishlistAPIView,
    ToggleWishlistAPIView,
    RemoveWishlistAPIView,
)


urlpatterns = [
<<<<<<< HEAD

    path(
        "",
        WishlistAPIView.as_view(),
        name="wishlist"
    ),


    path(
        "toggle/",
        ToggleWishlistAPIView.as_view(),
        name="toggle-wishlist"
    ),


    path(
        "remove/<int:product_id>/",
        RemoveWishlistAPIView.as_view(),
        name="remove-wishlist"
    ),

=======
    path("", WishlistSyncAPIView.as_view(), name="wishlist-root"),
    path("sync", WishlistSyncAPIView.as_view(), name="wishlist-sync-noslash"),
    path("sync/", WishlistSyncAPIView.as_view(), name="wishlist-sync"),
>>>>>>> 1102f7b78adaff24eee42324a35edbe7ea9083e2
]