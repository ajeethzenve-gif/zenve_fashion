from django.urls import path
from .views import DesignerListAPIView, DesignerDetailAPIView

urlpatterns = [
    path("<str:pk_or_code>", DesignerDetailAPIView.as_view(), name="designer-detail-noslash"),
    path("<str:pk_or_code>/", DesignerDetailAPIView.as_view(), name="designer-detail"),
    path("", DesignerListAPIView.as_view(), name="designer-list"),
]