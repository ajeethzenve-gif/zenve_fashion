from django.urls import path
from .views import JournalListAPIView, JournalDetailAPIView, RelatedArticlesAPIView

urlpatterns = [
    path("", JournalListAPIView.as_view(), name="journal-list"),
    path("<slug:slug>/related/", RelatedArticlesAPIView.as_view(), name="journal-related"),
    path("<str:slug>/related/", RelatedArticlesAPIView.as_view(), name="journal-related-str"),
    path("<slug:slug>/", JournalDetailAPIView.as_view(), name="journal-detail"),
    path("<str:slug>/", JournalDetailAPIView.as_view(), name="journal-detail-str"),
]
