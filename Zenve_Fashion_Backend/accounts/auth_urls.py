from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    AuthMeAPIView,
    AuthLogoutAPIView,
    AuthRefreshTokenAPIView,
    SendOTPAPIView,
    ResetPasswordAPIView,
    GoogleLoginAPIView,
)

urlpatterns = [
    path("register", RegisterAPIView.as_view(), name="auth-register-noslash"),
    path("register/", RegisterAPIView.as_view(), name="auth-register"),
    path("login", LoginAPIView.as_view(), name="auth-login-noslash"),
    path("login/", LoginAPIView.as_view(), name="auth-login"),
    path("logout", AuthLogoutAPIView.as_view(), name="auth-logout-noslash"),
    path("logout/", AuthLogoutAPIView.as_view(), name="auth-logout"),
    path("me", AuthMeAPIView.as_view(), name="auth-me-noslash"),
    path("me/", AuthMeAPIView.as_view(), name="auth-me"),
    path("refresh-token", AuthRefreshTokenAPIView.as_view(), name="auth-refresh-token-noslash"),
    path("refresh-token/", AuthRefreshTokenAPIView.as_view(), name="auth-refresh-token"),
    path("send-otp", SendOTPAPIView.as_view(), name="auth-send-otp-noslash"),
    path("send-otp/", SendOTPAPIView.as_view(), name="auth-send-otp"),
    path("reset-password", ResetPasswordAPIView.as_view(), name="auth-reset-password-noslash"),
    path("reset-password/", ResetPasswordAPIView.as_view(), name="auth-reset-password"),
    path("google", GoogleLoginAPIView.as_view(), name="auth-google-noslash"),
    path("google/", GoogleLoginAPIView.as_view(), name="auth-google"),
]
