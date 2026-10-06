from unittest.mock import Mock, patch

import requests
from django.test import SimpleTestCase, override_settings

from .sms_service import send_otp_sms


@override_settings(SMS_API_KEY="test-api-key", SMS_AUTH_KEY="",
                   SMS_API_URL="https://apitxt.com/api/sendOTP")
class APITxTTests(SimpleTestCase):
    @patch("accounts.sms_service.requests.post")
    def test_api_key_only_uses_documented_form_payload(self, post):
        post.return_value = Mock(json=lambda: {"status": "success"})
        self.assertTrue(send_otp_sms("9876543210", "123456")["success"])
        self.assertEqual(post.call_args.kwargs["data"], {
            "authkey": "test-api-key", "mobile": "919876543210",
            "otp": "123456", "channel": "sms",
        })
        self.assertNotIn("json", post.call_args.kwargs)

    @patch("accounts.sms_service.requests.post")
    def test_rejected_delivery_is_failure(self, post):
        post.return_value = Mock(json=lambda: {"status": "error"})
        self.assertFalse(send_otp_sms("9876543210", "123456")["success"])

    @patch("accounts.sms_service.requests.post")
    def test_network_failure_is_failure(self, post):
        post.side_effect = requests.Timeout()
        self.assertFalse(send_otp_sms("9876543210", "123456")["success"])

    @override_settings(SMS_API_KEY="")
    @patch("accounts.sms_service.requests.post")
    def test_missing_key_does_not_send(self, post):
        self.assertFalse(send_otp_sms("9876543210", "123456")["success"])
        post.assert_not_called()
