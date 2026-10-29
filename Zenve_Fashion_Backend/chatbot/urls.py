from django.urls import path, re_path
from .views import ChatbotChatAPIView

urlpatterns = [
    path("chat/", ChatbotChatAPIView.as_view(), name="chatbot-chat"),
    re_path(r"^chat/?$", ChatbotChatAPIView.as_view(), name="chatbot-chat-noslash"),
]
