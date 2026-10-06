from django.urls import path
from .views import CollectionListAPIView, CollectionDetailAPIView

urlpatterns = [
    path("<slug:slug>", CollectionDetailAPIView.as_view(), name="collection-detail-noslash"),
    path("<slug:slug>/", CollectionDetailAPIView.as_view(), name="collection-detail"),
    path("<str:slug>", CollectionDetailAPIView.as_view(), name="collection-detail-str-noslash"),
    path("<str:slug>/", CollectionDetailAPIView.as_view(), name="collection-detail-str"),
    path("", CollectionListAPIView.as_view(), name="collection-list"),
]
