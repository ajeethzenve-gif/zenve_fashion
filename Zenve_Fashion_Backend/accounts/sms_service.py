"""APITxT customer OTP delivery. Never reports success without provider acceptance."""
import re
import logging
import requests
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



def send_otp_sms(phone, otp):
    api_key = getattr(settings, "SMS_AUTH_KEY", "") or getattr(settings, "SMS_API_KEY", "")
    if not api_key:
        logger.error("APITxT SMS_API_KEY is missing.")
        return {"success": False, "configured": False, "message": "Mobile OTP delivery is not configured."}
    mobile = format_e164_phone(phone).lstrip("+")
    if not re.fullmatch(r"[1-9]\d{9,14}", mobile):
        return {"success": False, "configured": True, "message": "Enter a valid mobile number."}
    try:
        response = requests.post(
            settings.SMS_API_URL,
            data={"authkey": api_key, "mobile": mobile, "otp": str(otp), "channel": "sms"},
            timeout=15,
        )
        response.raise_for_status()
        result = response.json()
    except (requests.RequestException, ValueError) as exc:
        logger.error("APITxT OTP request failed (%s).", type(exc).__name__)
        return {"success": False, "configured": True, "message": "Unable to send OTP. Please try again later."}
    if not isinstance(result, dict) or str(result.get("status", "")).lower() != "success":
        logger.error("APITxT rejected the OTP request.")
        return {"success": False, "configured": True, "message": "The SMS provider could not send the OTP. Please try again later."}
    return {"success": True, "configured": True, "message": "OTP sent via APITxT."}
