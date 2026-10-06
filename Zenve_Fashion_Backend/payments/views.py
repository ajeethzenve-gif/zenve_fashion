import razorpay

from decimal import Decimal

from django.conf import settings
from django.db import transaction

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Payment
from .serializers import CreatePaymentSerializer


# ==========================================
# RAZORPAY CLIENT
# ==========================================

razorpay_client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET,
    )
)


# ==========================================
# CREATE RAZORPAY ORDER
# ==========================================

class CreateRazorpayOrderAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

<<<<<<< HEAD
        serializer = CreatePaymentSerializer(
            data=request.data
=======
        if gateway == "cod":
            return Response(
                {
                    "paymentId": f"pay-cod-{uuid.uuid4().hex[:10]}",
                    "orderId": order_id,
                    "amount": amount,
                    "currency": currency,
                },
                status=status.HTTP_200_OK,
            )

        # Verify order ownership if order exists
        order = None
        clean_order_id = order_id.replace("ord-", "").strip()
        if clean_order_id.isdigit():
            order = Order.objects.filter(id=int(clean_order_id)).first()
        if not order:
            order = Order.objects.filter(order_number__iexact=order_id).first()

        if order and order.user is not None:
            if not request.user or not request.user.is_authenticated:
                return Response({"error": "Authentication required for this order."}, status=status.HTTP_401_UNAUTHORIZED)
            if order.user != request.user and not (request.user.is_staff or request.user.is_superuser):
                return Response({"error": "You do not have permission to pay for this order."}, status=status.HTTP_403_FORBIDDEN)

        key_id = os.getenv("RAZORPAY_KEY_ID") or getattr(settings, "RAZORPAY_KEY_ID", None)
        key_secret = os.getenv("RAZORPAY_KEY_SECRET") or getattr(settings, "RAZORPAY_KEY_SECRET", None)

        if key_id and key_secret and gateway == "razorpay":
            try:
                import razorpay
                client = razorpay.Client(auth=(key_id, key_secret))
                razorpay_order = client.order.create({
                    "amount": int(round(amount * 100)),
                    "currency": currency,
                    "receipt": order_id[-40:],
                    "payment_capture": 1,
                })
                return Response(
                    {
                        "paymentId": razorpay_order["id"],
                        "gatewayKeyId": key_id,
                        "orderId": order_id,
                        "amount": amount,
                        "currency": currency,
                    },
                    status=status.HTTP_200_OK,
                )
            except Exception as e:
                logger.warning(f"Razorpay order creation fallback: {e}")

        # Fallback seamless test payment response
        mock_payment_id = f"pay_zenve_{uuid.uuid4().hex[:12]}"
        return Response(
            {
                "paymentId": mock_payment_id,
                "gatewayKeyId": key_id or "rzp_test_zenve_atelier",
                "orderId": order_id,
                "amount": amount,
                "currency": currency,
            },
            status=status.HTTP_200_OK,
>>>>>>> 1102f7b78adaff24eee42324a35edbe7ea9083e2
        )

        serializer.is_valid(
            raise_exception=True
        )

        amount = serializer.validated_data["amount"]

        currency = serializer.validated_data.get(
            "currency",
            "INR"
        )

        try:

            # Razorpay requires amount in paise
            amount_in_paise = int(
                Decimal(amount) * 100
            )

            razorpay_order = razorpay_client.order.create(
                {
                    "amount": amount_in_paise,
                    "currency": currency,
                    "payment_capture": 1,
                }
            )

            # Save payment record
            Payment.objects.create(
                user=request.user,
                razorpay_order_id=razorpay_order["id"],
                amount=amount,
                currency=currency,
                status="created",
            )

            return Response(
                {
                    "success": True,
                    "razorpay_order_id": razorpay_order["id"],
                    "amount": razorpay_order["amount"],
                    "currency": razorpay_order["currency"],
                    "key": settings.RAZORPAY_KEY_ID,
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as error:

            print(
                "RAZORPAY CREATE ERROR:",
                str(error)
            )

            return Response(
                {
                    "success": False,
                    "message": str(error),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==========================================
# VERIFY RAZORPAY PAYMENT
# ==========================================

class VerifyRazorpayPaymentAPIView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        razorpay_payment_id = request.data.get(
            "razorpay_payment_id"
        )

<<<<<<< HEAD
        razorpay_order_id = request.data.get(
            "razorpay_order_id"
        )

        razorpay_signature = request.data.get(
            "razorpay_signature"
        )

        # ------------------------------------------
        # VALIDATE REQUIRED DATA
        # ------------------------------------------

        if not razorpay_payment_id:
            return Response(
                {
                    "success": False,
                    "message": "razorpay_payment_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not razorpay_order_id:
            return Response(
                {
                    "success": False,
                    "message": "razorpay_order_id is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not razorpay_signature:
            return Response(
                {
                    "success": False,
                    "message": "razorpay_signature is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            # ------------------------------------------
            # FIND PAYMENT
            # ------------------------------------------

            payment = Payment.objects.select_for_update().get(
                razorpay_order_id=razorpay_order_id,
                user=request.user
            )

            # Prevent duplicate verification
            if payment.status == "success":

                return Response(
                    {
                        "success": True,
                        "message": "Payment already verified.",
                        "payment_id": payment.razorpay_payment_id,
                    }
                )
=======
        if order:
            if order.user is not None:
                if not request.user or not request.user.is_authenticated:
                    return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
                if order.user != request.user and not (request.user.is_staff or request.user.is_superuser):
                    return Response({"error": "You do not have permission to verify this order."}, status=status.HTTP_403_FORBIDDEN)

            order.payment_status = "Paid"
            order.order_status = "Confirmed"
            order.save(update_fields=["payment_status", "order_status"])

            try:
                payment_user = order.user or (request.user if request.user and request.user.is_authenticated else None)
                Payment.objects.create(
                    order=order,
                    user=payment_user,
                    payment_id=payment_id,
                    amount=order.total,
                    currency="INR",
                    gateway=order.payment_method.lower() if order.payment_method else "cod",
                    status="captured",
                )
            except Exception as e:
                logger.warning(f"Payment record create fallback: {e}")
>>>>>>> 1102f7b78adaff24eee42324a35edbe7ea9083e2

            # ------------------------------------------
            # VERIFY RAZORPAY SIGNATURE
            # ------------------------------------------

            razorpay_client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )

            # ------------------------------------------
            # PAYMENT SUCCESS
            # ------------------------------------------

            payment.razorpay_payment_id = (
                razorpay_payment_id
            )

            payment.razorpay_signature = (
                razorpay_signature
            )

            payment.status = "success"

            payment.save()

            return Response(
                {
                    "success": True,
                    "message": "Payment verified successfully.",
                    "payment_id": razorpay_payment_id,
                    "razorpay_order_id": razorpay_order_id,
                },
                status=status.HTTP_200_OK
            )

        except Payment.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message": "Payment record not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except razorpay.errors.SignatureVerificationError:

            return Response(
                {
                    "success": False,
                    "message": "Payment signature verification failed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as error:

            print(
                "RAZORPAY VERIFY ERROR:",
                str(error)
            )

            return Response(
                {
                    "success": False,
                    "message": str(error),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )