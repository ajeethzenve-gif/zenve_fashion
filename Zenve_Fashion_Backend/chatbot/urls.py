from django.urls import path
from .views import ChatbotChatAPIView

urlpatterns = [
    path("chat/", ChatbotChatAPIView.as_view(), name="chatbot-chat"),
]
