from django.urls import path
from .views import OrderListCreateAPIView, OrderDetailAPIView

urlpatterns = [
    path("<str:idOrNumber>", OrderDetailAPIView.as_view(), name="order-detail-noslash"),
    path("<str:idOrNumber>/", OrderDetailAPIView.as_view(), name="order-detail"),
    path("", OrderListCreateAPIView.as_view(), name="order-list-create"),
]