from django.urls import path
from .views import (
    ProductListAPIView,
    ProductDetailBySlugAPIView,
    AtelierPicksAPIView,
    ProductCategoryAPIView,
    RelatedProductsAPIView,
)

urlpatterns = [
    # Atelier Picks
    path("atelier-picks", AtelierPicksAPIView.as_view(), name="atelier-picks-noslash"),
    path("atelier-picks/", AtelierPicksAPIView.as_view(), name="atelier-picks"),

    # Category Products
    path("category/<str:category>", ProductCategoryAPIView.as_view(), name="product-category-noslash"),
    path("category/<str:category>/", ProductCategoryAPIView.as_view(), name="product-category"),

    # Related Products
    path("<str:productId>/related", RelatedProductsAPIView.as_view(), name="related-products-noslash"),
    path("<str:productId>/related/", RelatedProductsAPIView.as_view(), name="related-products"),

    # Product Detail by Slug / ID
    path("<str:slug>", ProductDetailBySlugAPIView.as_view(), name="product-detail-by-slug-noslash"),
    path("<str:slug>/", ProductDetailBySlugAPIView.as_view(), name="product-detail-by-slug"),

    # Catalog List
    path("", ProductListAPIView.as_view(), name="product-list"),
]