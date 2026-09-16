from django.urls import path
from .views import WishlistSyncAPIView

urlpatterns = [
    path("", WishlistSyncAPIView.as_view(), name="wishlist-root"),
    path("sync", WishlistSyncAPIView.as_view(), name="wishlist-sync-noslash"),
    path("sync/", WishlistSyncAPIView.as_view(), name="wishlist-sync"),
]