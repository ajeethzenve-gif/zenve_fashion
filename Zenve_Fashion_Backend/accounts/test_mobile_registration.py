from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from .models import Customer
from .views import LoginAPIView, CompleteMobileRegistrationAPIView


class MobileRegistrationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.factory = APIRequestFactory()
        self.phone = "+919876543210"

    def verify(self):
        cache.set(f"login_otp_{self.phone}", {"otp": "123456"}, 300)
        return LoginAPIView.as_view()(self.factory.post("/", {
            "phone": self.phone, "otp": "123456",
        }, format="json"))

    def complete(self, token, name):
        return CompleteMobileRegistrationAPIView.as_view()(self.factory.post("/", {
            "registrationToken": token, "name": name,
        }, format="json"))

    def test_new_customer_created_only_after_name_is_saved(self):
        verified = self.verify()
        self.assertTrue(verified.data["requiresName"])
        self.assertFalse(Customer.objects.exists())
        token = verified.data["registrationToken"]
        saved = self.complete(token, "  Asha   Kumar ")
        self.assertEqual(saved.status_code, 201)
        customer = Customer.objects.get()
        self.assertEqual(customer.phone_number, self.phone)
        self.assertEqual(customer.user.get_full_name(), "Asha Kumar")
        self.assertFalse(customer.user.has_usable_password())
        self.assertIn("token", saved.data)
        self.assertEqual(self.complete(token, "Another Name").status_code, 401)

    def test_existing_customer_logs_in_without_name_step(self):
        user = User.objects.create_user("existing", first_name="Asha")
        Customer.objects.create(user=user, phone_number=self.phone)
        result = self.verify()
        self.assertIn("token", result.data)
        self.assertNotIn("requiresName", result.data)
        self.assertEqual(Customer.objects.count(), 1)

    def test_blank_name_does_not_create_account(self):
        token = self.verify().data["registrationToken"]
        self.assertEqual(self.complete(token, " ").status_code, 400)
        self.assertFalse(Customer.objects.exists())

    def test_unverified_token_cannot_create_account(self):
        self.assertEqual(self.complete("invalid", "Asha").status_code, 401)
        self.assertFalse(Customer.objects.exists())
