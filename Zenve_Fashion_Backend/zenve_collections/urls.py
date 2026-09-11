from django.urls import path
from .views import CollectionListAPIView, CollectionDetailAPIView

urlpatterns = [
    path("", CollectionListAPIView.as_view(), name="collection-list"),
    path("<slug:slug>/", CollectionDetailAPIView.as_view(), name="collection-detail"),
    path("<str:slug>/", CollectionDetailAPIView.as_view(), name="collection-detail-str"),
]
