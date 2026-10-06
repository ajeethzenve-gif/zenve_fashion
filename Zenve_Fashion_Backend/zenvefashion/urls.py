from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # Frontend Auth API (/api/auth/...)
    re_path(r"^api/auth/?", include("accounts.auth_urls")),

    # Accounts & Legacy Auth (/api/accounts/...)
    re_path(r"^api/accounts/?", include("accounts.urls")),

    # Collections
    re_path(r"^api/collections/?", include("zenve_collections.urls")),

    # Editorial Journal
    re_path(r"^api/journal/?", include("journal.urls")),

    # Showroom Appointments & Experiences
    re_path(r"^api/showroom/?", include("showroom.urls")),

    # Catalog & Designers
    re_path(r"^api/products/?", include("products.urls")),
    re_path(r"^api/designers/?", include("designers.urls")),

    # Commerce & Checkout
    re_path(r"^api/orders/?", include("orders.urls")),
    re_path(r"^api/payments/?", include("payments.urls")),
    re_path(r"^api/cart/?", include("cart.urls")),
    re_path(r"^api/wishlist/?", include("wishlist.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)