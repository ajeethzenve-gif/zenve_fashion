from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


class SafeJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that treats invalid/expired tokens as unauthenticated (AnonymousUser)
    rather than immediately aborting the entire request with 401.
    This prevents stale/expired tokens in frontend localStorage from breaking public views
    (e.g., catalog, products, journal, collections, promo codes).
    Views with IsAuthenticated will still enforce authentication and return 401 as expected.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, AuthenticationFailed, Exception):
            return None
