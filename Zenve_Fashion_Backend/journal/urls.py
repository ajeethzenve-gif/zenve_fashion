from django.urls import path
from .views import JournalListAPIView, JournalDetailAPIView, RelatedArticlesAPIView

urlpatterns = [
    path("<slug:slug>/related", RelatedArticlesAPIView.as_view(), name="journal-related-noslash"),
    path("<slug:slug>/related/", RelatedArticlesAPIView.as_view(), name="journal-related"),
    path("<str:slug>/related", RelatedArticlesAPIView.as_view(), name="journal-related-str-noslash"),
    path("<str:slug>/related/", RelatedArticlesAPIView.as_view(), name="journal-related-str"),
    path("<slug:slug>", JournalDetailAPIView.as_view(), name="journal-detail-noslash"),
    path("<slug:slug>/", JournalDetailAPIView.as_view(), name="journal-detail"),
    path("<str:slug>", JournalDetailAPIView.as_view(), name="journal-detail-str-noslash"),
    path("<str:slug>/", JournalDetailAPIView.as_view(), name="journal-detail-str"),
    path("", JournalListAPIView.as_view(), name="journal-list"),
]
