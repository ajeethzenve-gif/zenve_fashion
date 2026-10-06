import random
import secrets
import re

from django.core.cache import cache
from django.core.mail import send_mail
from django.db.models import Q
from rest_framework.permissions import AllowAny

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, logout as django_logout
from django.conf import settings
from .twilio_service import (
    send_twilio_otp_sms,
    send_twilio_welcome_sms,
    send_twilio_registration_otp_sms,
    format_e164_phone,
)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from google.oauth2 import id_token
from google.auth.transport import requests


from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db import IntegrityError
from .models import Customer, CustomerAddress
from .serializers import CustomerAddressSerializer


from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
)

from .models import (
    Customer,
    Role,
    UserRole
)


# =========================================================
# AUTH RESPONSE HELPER
# =========================================================

def _get_auth_user_data(user, request=None):
    """Return the user shape expected by the frontend auth APIs."""
    is_admin = bool(user.is_staff or user.is_superuser)
    role = "customer"
    try:
        r = user.user_role.role.name.lower()
        if "admin" in r:
            role = "admin"
    except (UserRole.DoesNotExist, Role.DoesNotExist, AttributeError):
        pass
    if is_admin:
        role = "admin"

    phone = ""
    avatar = None
    addresses = []

    try:
        customer = user.customer
        phone = customer.phone_number or ""

        if customer.profile_image:
            avatar = customer.profile_image.url
            if request is not None:
                avatar = request.build_absolute_uri(avatar)

        for addr in customer.addresses.all().order_by("-is_default", "-id"):
            addresses.append({
                "id": str(addr.id),
                "fullName": addr.full_name,
                "name": addr.full_name,
                "mobile": addr.phone_number,
                "phone": addr.phone_number,
                "email": user.email,
                "addressLine1": addr.address_line1,
                "addressLine2": addr.address_line2 or "",
                "city": addr.city,
                "state": addr.state,
                "pincode": addr.postal_code,
                "country": addr.country,
                "isDefault": addr.is_default,
            })
    except Customer.DoesNotExist:
        pass

    name = (f"{user.first_name} {user.last_name}").strip()
    if not name:
        name = user.username

    return {
        "id": str(user.id),
        "name": name,
        "email": user.email,
        "phone": phone,
        "role": role,
        "avatar": avatar,
        "addresses": addresses,
    }



# ==========================
# REGISTER API
# ==========================

class RegisterAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        # New frontend contract:
        # {name, email, phone, password}
        if "name" in request.data:
            name = str(request.data.get("name", "")).strip()
            email = str(request.data.get("email", "")).strip().lower()
            phone = str(request.data.get("phone", "")).strip()
            password = request.data.get("password")

            if not name:
                return Response({"message": "Name is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not email:
                return Response({"message": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not phone:
                return Response({"message": "Phone is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not password:
                return Response({"message": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)
            if len(password) < 8:
                return Response({"message": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email__iexact=email).exists():
                return Response({"message": "An account with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)
            if Customer.objects.filter(phone_number=phone).exists():
                return Response({"message": "An account with this phone number already exists."}, status=status.HTTP_400_BAD_REQUEST)

            parts = name.split(None, 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

            # Keep username compatible with the existing Django authentication.
            base_username = email.split("@")[0] or "customer"
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            try:
                user = User.objects.create_user(
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    password=password,
                )

                customer_role, _ = Role.objects.get_or_create(name="Customer", defaults={"description": "Standard atelier client"})
                UserRole.objects.create(user=user, role=customer_role)
                Customer.objects.create(
                    user=user,
                    phone_number=phone,
                    country="India",
                )

                # Send official welcome SMS to the new customer via Twilio
                if phone:
                    customer_display_name = user.first_name or name or "Valued Client"
                    send_twilio_welcome_sms(phone, customer_display_name)
            except Role.DoesNotExist:
                return Response(
                    {"message": "Customer role is not configured. Create a Customer role first."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            except IntegrityError:
                return Response(
                    {"message": "Unable to create the account. Email or phone may already exist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Registration Successful",
                    "user": _get_auth_user_data(user, request),
                    "token": str(refresh.access_token),
                    "refreshToken": str(refresh),
                    # Keep old keys for backward compatibility.
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "username": user.username,
                    "role": "Customer",
                },
                status=status.HTTP_201_CREATED,
            )

        # Existing registration contract — kept intact.
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            try:
                user = User.objects.create_user(
                    username=serializer.validated_data["username"],
                    first_name=serializer.validated_data["first_name"],
                    last_name=serializer.validated_data["last_name"],
                    email=serializer.validated_data["email"],
                    password=serializer.validated_data["password"]
                )

                customer_role, _ = Role.objects.get_or_create(name="Customer", defaults={"description": "Standard atelier client"})

                UserRole.objects.create(
                    user=user,
                    role=customer_role
                )

                Customer.objects.create(
                    user=user,
                    phone_number=serializer.validated_data["phone_number"],
                    gender=serializer.validated_data.get("gender"),
                    date_of_birth=serializer.validated_data.get("date_of_birth"),
                    address=serializer.validated_data.get("address"),
                    city=serializer.validated_data.get("city"),
                    state=serializer.validated_data.get("state"),
                    country=serializer.validated_data.get("country", "India"),
                    postal_code=serializer.validated_data.get("postal_code")
                )

                # Send official welcome SMS to the new customer via Twilio
                client_phone = serializer.validated_data.get("phone_number")
                if client_phone:
                    client_name = user.first_name or user.username or "Valued Client"
                    send_twilio_welcome_sms(client_phone, client_name)
            except Role.DoesNotExist:
                return Response(
                    {"message": "Customer role is not configured. Create a Customer role first."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            except IntegrityError:
                return Response(
                    {"message": "Unable to create the account. Email, username, or phone may already exist."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response({"message": "Registration Successful"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================
# LOGIN API
# ==========================

class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        # Supports both the old username field and the new email/phone/OTP contract.
        email = str(request.data.get("email", "")).strip().lower()
        username_or_email = str(request.data.get("username", "")).strip()
        phone = str(request.data.get("phone", "")).strip()
        password = request.data.get("password")
        otp = str(request.data.get("otp", "")).strip()

        user = None

        # Phone + OTP login. OTP is created by SendLoginOTPAPIView below.
        if phone and otp and not password:
            formatted_phone = format_e164_phone(phone)
            otp_data = cache.get(f"login_otp_{phone}") or cache.get(f"login_otp_{formatted_phone}")

            if not otp_data:
                return Response({"message": "OTP has expired. Please request a new OTP."}, status=status.HTTP_401_UNAUTHORIZED)

            if str(otp_data.get("otp")) != otp:
                return Response({"message": "Invalid OTP."}, status=status.HTTP_401_UNAUTHORIZED)

            # Look up customer by either raw or formatted phone
            customer = Customer.objects.select_related("user").filter(
                Q(phone_number=phone) | Q(phone_number=formatted_phone)
            ).first()

            if customer and customer.user:
                user = customer.user
            else:
                # Auto-create client user & customer record for seamless mobile login
                clean_digits = re.sub(r"\D", "", phone)[-10:]
                username = f"client_{clean_digits}"
                existing_user = User.objects.filter(username=username).first()
                if existing_user:
                    user = existing_user
                else:
                    user = User.objects.create_user(
                        username=username,
                        email=f"{clean_digits}@zenvefashion.com",
                        first_name="Zenve Client",
                    )
                customer, _ = Customer.objects.get_or_create(
                    user=user,
                    defaults={"phone_number": formatted_phone or phone}
                )

            cache.delete(f"login_otp_{phone}")
            if formatted_phone:
                cache.delete(f"login_otp_{formatted_phone}")

        else:
            login_value = email or username_or_email

            if not login_value or not password:
                return Response({"message": "Email/username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user_obj = User.objects.get(email__iexact=login_value)
                username = user_obj.username
            except User.DoesNotExist:
                username = login_value

            user = authenticate(username=username, password=password)

            if user is None:
                return Response(
                    {"message": "Invalid Username/Email or Password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        refresh = RefreshToken.for_user(user)

        try:
            role = user.user_role.role.name
        except (UserRole.DoesNotExist, AttributeError):
            role = None

        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        return Response(
            {
                "message": "Login Successful",
                "user": _get_auth_user_data(user, request),
                "token": access_token,
                "refreshToken": refresh_token,
                # Existing frontend compatibility.
                "access": access_token,
                "refresh": refresh_token,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": role,
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# SEND OTP (Password Reset or Phone Login)
# =========================================================

class SendOTPAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        phone = str(request.data.get("phone", "")).strip()

        if not email and not phone:
            return Response(
                {"success": False, "message": "Email or phone is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp = str(random.randint(100000, 999999))

        if email:
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return Response(
                    {"success": False, "message": "No account exists with this email address."},
                    status=status.HTTP_404_NOT_FOUND
                )

            cache.set(
                f"reset_otp_{email}",
                {"otp": otp, "user_id": user.id},
                timeout=600
            )

            try:
                send_mail(
                    subject="Zenve Fashion Atelier - Password Reset Code",
                    message=(
                        f"Hello {user.first_name or user.username},\n\n"
                        f"Your Zenve password reset OTP is: {otp}\n\n"
                        "This code is valid for 10 minutes.\n\n"
                        "Zenve Fashion Atelier"
                    ),
                    from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception:
                pass

            return Response(
                {
                    "success": True,
                    "otp": otp,
                    "message": "Verification OTP sent to your registered email.",
                },
                status=status.HTTP_200_OK
            )

        else:
            formatted_phone = format_e164_phone(phone)
            customer = Customer.objects.select_related("user").filter(
                Q(phone_number=phone) | Q(phone_number=formatted_phone)
            ).first()

            user_id = customer.user_id if customer else None

            # Store OTP in cache for both raw and formatted phone
            cache.set(
                f"login_otp_{phone}",
                {"otp": otp, "user_id": user_id, "phone": phone},
                timeout=300
            )
            if formatted_phone and formatted_phone != phone:
                cache.set(
                    f"login_otp_{formatted_phone}",
                    {"otp": otp, "user_id": user_id, "phone": formatted_phone},
                    timeout=300
                )

            # Dispatch real mobile SMS via Twilio
            sms_result = send_twilio_otp_sms(phone, otp)

            # If customer has email on file, also send email copy
            if customer and customer.user and customer.user.email:
                try:
                    send_mail(
                        subject="Zenve Fashion Atelier - Login OTP",
                        message=(
                            f"Hello {customer.user.first_name or customer.user.username},\n\n"
                            f"Your login OTP is: {otp}\n\n"
                            "This OTP is valid for 5 minutes.\n\n"
                            "Zenve Fashion Atelier"
                        ),
                        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                        recipient_list=[customer.user.email],
                        fail_silently=True,
                    )
                except Exception:
                    pass

            response_data = {
                "success": True,
                "phone": phone,
                "formatted_phone": formatted_phone,
                "message": f"Verification OTP sent to {formatted_phone} via SMS." if sms_result.get("success") else "OTP generated successfully.",
                "twilio_status": "sent" if sms_result.get("success") else sms_result.get("message", "pending"),
            }

            # If Twilio credentials are not configured yet, include OTP so development/testing is not blocked
            if not sms_result.get("configured") or getattr(settings, "DEBUG", False):
                response_data["otp"] = otp
                if not sms_result.get("configured"):
                    response_data["dev_note"] = "Twilio credentials pending in .env. Enter TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to deliver live SMS."

            return Response(response_data, status=status.HTTP_200_OK)

SendLoginOTPAPIView = SendOTPAPIView


# =========================================================
# SEND REGISTRATION OTP API
# =========================================================

class SendRegistrationOTPAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        phone = str(request.data.get("phone", "")).strip()
        if not phone:
            return Response({"success": False, "message": "Phone number is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if phone is already registered
        if Customer.objects.filter(phone_number=phone).exists():
            return Response({"success": False, "message": "An account with this phone number already exists."}, status=status.HTTP_400_BAD_REQUEST)

        otp = str(random.randint(100000, 999999))
        formatted_phone = format_e164_phone(phone)

        cache.set(f"reg_otp_{phone}", otp, timeout=300)
        if formatted_phone != phone:
            cache.set(f"reg_otp_{formatted_phone}", otp, timeout=300)

        sms_result = send_twilio_registration_otp_sms(phone, otp)

        res_data = {
            "success": True,
            "phone": phone,
            "formatted_phone": formatted_phone,
            "message": f"Verification code sent to {formatted_phone} via SMS." if sms_result.get("success") else "OTP generated successfully.",
            "twilio_status": "sent" if sms_result.get("success") else sms_result.get("message", "pending"),
        }
        if not sms_result.get("configured") or getattr(settings, "DEBUG", False):
            res_data["otp"] = otp

        return Response(res_data, status=status.HTTP_200_OK)




# =========================================================
# AUTH ME API
# =========================================================

class AuthMeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(_get_auth_user_data(request.user, request), status=status.HTTP_200_OK)


# =========================================================
# REFRESH TOKEN API
# =========================================================

class AuthRefreshTokenAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token") or request.data.get("refreshToken")

        if not token:
            return Response({"message": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(token)
            return Response({"token": str(refresh.access_token)}, status=status.HTTP_200_OK)
        except TokenError:
            # If token cannot be decoded as RefreshToken (e.g. access token passed), return token
            return Response({"token": token}, status=status.HTTP_200_OK)


# =========================================================
# LOGOUT API
# =========================================================

class AuthLogoutAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Blacklist the supplied refresh token when available.
        refresh_token = request.data.get("refreshToken") or request.data.get("refresh")

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except (TokenError, AttributeError, Exception):
                pass

        try:
            django_logout(request)
        except Exception:
            pass

        return Response({"message": "Logout Successful"}, status=status.HTTP_200_OK)


# ==========================
# GOOGLE LOGIN API
# DO NOT TOUCH THIES CODE. THIS CODE WORKING CORRECTLY
# ==========================

class GoogleLoginAPIView(APIView):

    def post(self, request):

        token = request.data.get(
            "token"
        )


        if not token:

            return Response(
                {
                    "message":
                    "Google Token Required"
                },

                status=status.HTTP_400_BAD_REQUEST
            )


        try:


            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )


            email = idinfo.get(
                "email"
            )

            first_name = idinfo.get(
                "given_name",
                ""
            )

            last_name = idinfo.get(
                "family_name",
                ""
            )


            username = email.split("@")[0]



            user, created = User.objects.get_or_create(

                email=email,

                defaults={

                    "username":
                    username,

                    "first_name":
                    first_name,

                    "last_name":
                    last_name

                }

            )



            # Get Customer Role

            customer_role, _ = Role.objects.get_or_create(name="Customer", defaults={"description": "Standard atelier client"})



            # Assign Role

            UserRole.objects.get_or_create(

                user=user,

                defaults={

                    "role":
                    customer_role

                }

            )



            # Create Customer Profile

            customer, created = Customer.objects.get_or_create(

                user=user,

                defaults={

                    "phone_number":
                    f"google_{user.id}",

                    "country":
                    "India"

                }

            )



            refresh = RefreshToken.for_user(
                user
            )



            return Response(

                {

                    "message":
                    "Google Login Successful",


                    "access":
                    str(refresh.access_token),


                    "refresh":
                    str(refresh),


                    "username":
                    user.username,


                    "email":
                    user.email,


                    "first_name":
                    user.first_name,


                    "last_name":
                    user.last_name,


                    "role":
                    user.user_role.role.name

                },

                status=status.HTTP_200_OK

            )


        except Exception as e:


            return Response(

                {
                    "message":
                    str(e)
                },

                status=status.HTTP_400_BAD_REQUEST

            )



# ==========================
# PROFILE API
# ==========================

class ProfileAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    def get(self, request):

        try:

            customer = Customer.objects.get(
                user=request.user
            )

            serializer = ProfileSerializer(
                customer
            )


            return Response(
                serializer.data
            )


        except Customer.DoesNotExist:


            return Response(
                {
                    "message":
                    "Customer profile not found"
                },

                status=status.HTTP_404_NOT_FOUND
            )



# ==========================
# UPDATE PROFILE API
# ==========================

class UpdateProfileAPIView(APIView):

    permission_classes = [
        IsAuthenticated
    ]


    parser_classes = [
        MultiPartParser,
        FormParser
    ]



    def put(self, request):

        customer = Customer.objects.get(
            user=request.user
        )


        serializer = ProfileSerializer(
            customer,
            data=request.data,
            partial=True
        )


        if serializer.is_valid():

            serializer.save()


            return Response(
                {
                    "message":
                    "Profile updated successfully",

                    "profile":
                    serializer.data
                }
            )


        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

# ==========================================
# ADDRESS LIST + CREATE
# ==========================================

class CustomerAddressListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    # ======================================
    # GET ALL ADDRESSES
    # ======================================
    def get(self, request):
        customer, _ = Customer.objects.get_or_create(
            user=request.user,
            defaults={"phone_number": getattr(request.user, "username", f"user_{request.user.id}")}
        )

        addresses = (
            CustomerAddress.objects
            .filter(customer=customer)
            .order_by("-is_default", "-id")
        )

        serializer = CustomerAddressSerializer(addresses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ======================================
    # ADD NEW ADDRESS
    # ======================================
    @transaction.atomic
    def post(self, request):
        customer, _ = Customer.objects.get_or_create(
            user=request.user,
            defaults={"phone_number": getattr(request.user, "username", f"user_{request.user.id}")}
        )

        serializer = CustomerAddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        requested_default = request.data.get("is_default", request.data.get("isDefault", False))
        if isinstance(requested_default, str):
            requested_default = requested_default.lower() in ["true", "1", "yes"]

        has_existing_address = CustomerAddress.objects.filter(customer=customer).exists()

        if not has_existing_address or requested_default:
            # If this is the first address or explicitly requested default,
            # clear any existing defaults and make this one default
            CustomerAddress.objects.filter(customer=customer, is_default=True).update(is_default=False)
            address = serializer.save(customer=customer, is_default=True)
        else:
            address = serializer.save(customer=customer, is_default=False)

        return Response(CustomerAddressSerializer(address).data, status=status.HTTP_201_CREATED)


# ==========================================
# ADDRESS UPDATE + DELETE
# ==========================================

class CustomerAddressDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_customer(self, request):
        customer, _ = Customer.objects.get_or_create(
            user=request.user,
            defaults={"phone_number": getattr(request.user, "username", f"user_{request.user.id}")}
        )
        return customer

    def get_address(self, request, pk):
        customer = self.get_customer(request)
        return get_object_or_404(CustomerAddress, id=pk, customer=customer)

    def get(self, request, pk):
        address = self.get_address(request, pk)
        return Response(CustomerAddressSerializer(address).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def put(self, request, pk):
        customer = self.get_customer(request)
        address = get_object_or_404(CustomerAddress, id=pk, customer=customer)

        requested_default = request.data.get("is_default", request.data.get("isDefault", address.is_default))
        if isinstance(requested_default, str):
            requested_default = requested_default.lower() in ["true", "1", "yes"]

        if requested_default:
            CustomerAddress.objects.filter(customer=customer, is_default=True).exclude(id=address.id).update(is_default=False)
            serializer = CustomerAddressSerializer(address, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            updated_address = serializer.save(is_default=True)
        else:
            serializer = CustomerAddressSerializer(address, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            updated_address = serializer.save()

        return Response(CustomerAddressSerializer(updated_address).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def patch(self, request, pk):
        customer = self.get_customer(request)
        address = get_object_or_404(CustomerAddress, id=pk, customer=customer)

        requested_default = request.data.get("is_default", request.data.get("isDefault", None))
        if isinstance(requested_default, str):
            requested_default = requested_default.lower() in ["true", "1", "yes"]

        if requested_default is True:
            CustomerAddress.objects.filter(customer=customer, is_default=True).exclude(id=address.id).update(is_default=False)

        serializer = CustomerAddressSerializer(address, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_address = serializer.save()

        return Response(CustomerAddressSerializer(updated_address).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request, pk):
        customer = self.get_customer(request)
        address = get_object_or_404(CustomerAddress, id=pk, customer=customer)

        was_default = address.is_default
        address.delete()

        # If deleted address was default, make the most recent remaining address default
        if was_default:
            new_default = CustomerAddress.objects.filter(customer=customer).order_by("-id").first()
            if new_default:
                new_default.is_default = True
                new_default.save(update_fields=["is_default"])

        return Response({"success": True, "message": "Address deleted successfully."}, status=status.HTTP_200_OK)

class ForgotPasswordAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        # =====================================================
        # GET EMAIL
        # =====================================================

        email = request.data.get(
            "email",
            ""
        ).strip().lower()

        # =====================================================
        # CHECK EMAIL PROVIDED
        # =====================================================

        if not email:

            return Response(
                {
                    "detail": "Email is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # CHECK USER EXISTS
        # =====================================================

        try:

            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "detail":
                    "No account exists with this email address."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # =====================================================
        # GENERATE 6 DIGIT OTP
        # =====================================================

        otp = str(
            random.randint(
                100000,
                999999
            )
        )

        # =====================================================
        # GENERATE RESET TOKEN
        # =====================================================

        reset_token = secrets.token_urlsafe(32)

        # =====================================================
        # CACHE KEY
        # =====================================================

        cache_key = (
            f"password_reset_{reset_token}"
        )

        # =====================================================
        # STORE OTP IN CACHE
        #
        # NOT DATABASE
        #
        # 5 MINUTES
        # =====================================================

        cache.set(

            cache_key,

            {
                "user_id": user.id,

                "email": email,

                "otp": otp,

                "verified": False
            },

            timeout=300
        )

        # =====================================================

class VerifyPasswordOTPAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        # =====================================================
        # GET DATA
        # =====================================================

        email = request.data.get(
            "email",
            ""
        ).strip().lower()

        otp = request.data.get(
            "otp",
            ""
        ).strip()

        reset_token = request.data.get(
            "reset_token",
            ""
        ).strip()

        # =====================================================
        # VALIDATE EMAIL
        # =====================================================

        if not email:

            return Response(
                {
                    "detail":
                    "Email is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # VALIDATE OTP
        # =====================================================

        if not otp:

            return Response(
                {
                    "detail":
                    "OTP is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # VALIDATE RESET TOKEN
        # =====================================================

        if not reset_token:

            return Response(
                {
                    "detail":
                    "Reset token is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # GET CACHE DATA
        # =====================================================

        cache_key = (
            f"password_reset_{reset_token}"
        )

        reset_data = cache.get(
            cache_key
        )

        # =====================================================
        # CHECK TOKEN / OTP EXPIRY
        # =====================================================

        if not reset_data:

            return Response(
                {
                    "detail":
                    "OTP has expired. Please request a new OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # CHECK EMAIL
        # =====================================================

        if reset_data.get("email") != email:

            return Response(
                {
                    "detail":
                    "Invalid password reset request."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # CHECK OTP
        # =====================================================

        if reset_data.get("otp") != otp:

            return Response(
                {
                    "detail":
                    "Invalid OTP."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =====================================================
        # MARK OTP VERIFIED
        # =====================================================

        reset_data["verified"] = True

        cache.set(

            cache_key,

            reset_data,

            timeout=300
        )

        # =====================================================
        # SUCCESS
        # =====================================================

        return Response(
            {
                "message":
                "OTP verified successfully.",

                "verified":
                True,

                "reset_token":
                reset_token
            },
            status=status.HTTP_200_OK
        )

# =========================================================
# RESET PASSWORD
# =========================================================

class ResetPasswordAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        otp = str(request.data.get("otp", "") or request.data.get("reset_token", "")).strip()
        new_password = request.data.get("newPassword") or request.data.get("new_password")

        if not email:
            return Response(
                {"success": False, "message": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not otp:
            return Response(
                {"success": False, "message": "Verification code (OTP) is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not new_password:
            return Response(
                {"success": False, "message": "New password is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {"success": False, "message": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "User account not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check cached reset OTP
        cache_data = cache.get(f"reset_otp_{email}") or cache.get(f"password_reset_{otp}")
        if cache_data:
            cached_otp = cache_data.get("otp") if isinstance(cache_data, dict) else str(cache_data)
            if cached_otp and cached_otp != otp:
                return Response(
                    {"success": False, "message": "Invalid verification code."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cache.delete(f"reset_otp_{email}")
            cache.delete(f"password_reset_{otp}")

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {
                "success": True,
                "message": "Password reset successfully. You may now log in with your new password.",
            },
            status=status.HTTP_200_OK
        )