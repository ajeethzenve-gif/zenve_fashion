import os
import re
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def format_e164_phone(raw_phone: str, default_country_code: str = "+91") -> str:
    """
    Format a phone number into valid E.164 international format.
    Example:
      '6380924878' -> '+916380924878'
      '916380924878' -> '+916380924878'
      '+916380924878' -> '+916380924878'
    """
    if not raw_phone:
        return ""

    # Strip whitespace, hyphens, parentheses
    cleaned = re.sub(r"[\s\-\(\)]", "", str(raw_phone).strip())

    if cleaned.startswith("+"):
        return cleaned

    # If 12 digits starting with 91, add +
    if len(cleaned) == 12 and cleaned.startswith("91"):
        return f"+{cleaned}"

    # If 10 digits standard mobile number, prepend default country code (e.g. +91 for India)
    if len(cleaned) == 10:
        return f"{default_country_code}{cleaned}"

    # Fallback prepend + if digits only
    if cleaned.isdigit():
        return f"+{cleaned}"

    return cleaned


def send_twilio_sms(phone: str, message_body: str) -> dict:
    """
    Base helper to send an SMS using Twilio REST API.
    Returns dict:
      {
        "success": bool,
        "configured": bool,
        "sid": Optional[str],
        "message": str,
        "error": Optional[str]
      }
    """
    account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", None) or os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", None) or os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    from_number = getattr(settings, "TWILIO_PHONE_NUMBER", None) or os.getenv("TWILIO_PHONE_NUMBER", "").strip()
    messaging_service_sid = getattr(settings, "TWILIO_MESSAGING_SERVICE_SID", None) or os.getenv("TWILIO_MESSAGING_SERVICE_SID", "").strip()

    formatted_to = format_e164_phone(phone)

    # Check if credentials exist
    if not account_sid or not auth_token:
        warning_msg = (
            f"[Twilio SMS Notice] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is not configured in .env. "
            f"Message would have been sent to {formatted_to}: {message_body[:50]}..."
        )
        print(warning_msg)
        logger.warning(warning_msg)
        return {
            "success": False,
            "configured": False,
            "sid": None,
            "message": "Twilio credentials not configured in environment.",
            "error": "TWILIO_CREDENTIALS_MISSING",
        }

    try:
        from twilio.rest import Client

        client = Client(account_sid, auth_token)

        create_kwargs = {
            "to": formatted_to,
            "body": message_body,
        }

        if messaging_service_sid:
            create_kwargs["messaging_service_sid"] = messaging_service_sid
        elif from_number:
            create_kwargs["from_"] = from_number
        else:
            err = "Neither TWILIO_PHONE_NUMBER nor TWILIO_MESSAGING_SERVICE_SID is configured in .env."
            print(f"[Twilio SMS Error] {err}")
            return {
                "success": False,
                "configured": True,
                "sid": None,
                "message": err,
                "error": "TWILIO_SENDER_MISSING",
            }

        message = client.messages.create(**create_kwargs)

        success_msg = f"[Twilio SMS Success] Delivered to {formatted_to} (SID: {message.sid}, Status: {message.status})"
        print(success_msg)
        logger.info(success_msg)

        return {
            "success": True,
            "configured": True,
            "sid": message.sid,
            "status": message.status,
            "message": "SMS sent successfully via Twilio.",
            "error": None,
        }

    except Exception as exc:
        error_msg = f"[Twilio SMS Error] Failed to send to {formatted_to}: {str(exc)}"
        print(error_msg)
        logger.error(error_msg, exc_info=True)

        return {
            "success": False,
            "configured": True,
            "sid": None,
            "message": f"Twilio SMS delivery failed: {str(exc)}",
            "error": str(exc),
        }


def send_twilio_otp_sms(phone: str, otp: str) -> dict:
    """
    Send Login OTP verification SMS.
    """
    body = (
        f"Your ZENVE Atelier login verification code is: {otp}\n\n"
        "This code is valid for 5 minutes. Do not share this code with anyone."
    )
    return send_twilio_sms(phone, body)


def send_twilio_welcome_sms(phone: str, customer_name: str = "Valued Client") -> dict:
    """
    Send official welcome SMS to newly registered customer account.
    """
    body = (
        f"Welcome to ZENVE Haute Couture Atelier, {customer_name}! "
        "Your private customer account has been registered successfully. "
        "Enjoy complimentary styling and white-glove shipping. "
        "Explore: www.zenvefashion.com"
    )
    return send_twilio_sms(phone, body)


def send_twilio_registration_otp_sms(phone: str, otp: str) -> dict:
    """
    Send Account Registration verification OTP SMS.
    """
    body = (
        f"Your ZENVE Atelier registration code is: {otp}\n\n"
        "Valid for 5 minutes. Enter this code to verify your mobile number."
    )
    return send_twilio_sms(phone, body)
