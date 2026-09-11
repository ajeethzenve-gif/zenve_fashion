from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # Frontend Auth API (/api/auth/...)
    path("api/auth/", include("accounts.auth_urls")),

    # Accounts & Legacy Auth (/api/accounts/...)
    path("api/accounts/", include("accounts.urls")),

    # Collections
    path("api/collections/", include("zenve_collections.urls")),

    # Editorial Journal
    path("api/journal/", include("journal.urls")),

    # Showroom Appointments & Experiences
    path("api/showroom/", include("showroom.urls")),

    # Catalog & Designers
    path("api/products/", include("products.urls")),
    path("api/designers/", include("designers.urls")),

    # Commerce & Checkout
    path("api/orders/", include("orders.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/cart/", include("cart.urls")),
    path("api/wishlist/", include("wishlist.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)