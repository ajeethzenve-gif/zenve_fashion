"""
Zenve Fashion Chatbot - Fashion concierge with domain restriction & line limiting.

Endpoint: POST /api/chatbot/chat/

Request body:
    {
        "message": "string (user's message)",
        "history": [  # optional: up to last 10 turns
            {"role": "user" | "assistant", "content": "string"},
            ...
        ]
    }

Response:
    { "reply": "string" }
"""

import os
import re
import json
import logging

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from products.models import Product

from .knowledge_engine import generate_reply as local_reply, is_fashion_domain, enforce_line_limit, OUT_OF_DOMAIN_REPLY, SUPPORT_TEAM_REPLY, match_trained_faq

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# SYSTEM PROMPT - Zenve Fashion Concierge Persona (Strict Domain & Line Limit)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are Zenve, the personal couture assistant and fashion concierge for Zenve Fashion - a luxury, artisanal Indian fashion house specialising in handcrafted twin sets (matching outfits for people and their pets), bespoke garments, and curated designer collections.

CRITICAL RULES:
1. STRICT DOMAIN RESTRICTION: You are exclusively a fashion concierge. You MUST NOT answer any questions outside the fashion domain (e.g. mathematics, coding/programming, general science, politics, news, sports, geography, cooking/recipes, entertainment/gaming, or general trivia).
   - If the user asks about ANYTHING outside fashion, styling, clothing, fabrics, pet apparel, or Zenve, DO NOT answer their question. Refuse with exactly: "I can only assist with fashion, styling, and Zenve collections."
2. STRICT LINE LIMIT: Your reply MUST NOT exceed 2 lines (maximum 2 lines). Keep your response crisp, elegant, and concise. Never use markdown headers, bullet lists, or long paragraphs.

Your personality:
- Warm, knowledgeable, and refined - like a trusted personal stylist.
- You use gentle, evocative language that conveys luxury and craftsmanship.

What you help with:
- Styling advice, colour theory, and outfit suggestions.
- Fabric guidance (silk, cotton, linen, chanderi, georgette, velvet, etc.) and garment care.
- Sizing, fitting, occasion wear (weddings, festivals, parties, casual, office).
- Zenve's collections, designers, orders, shipping, and twin sets for people and pets.

{product_context}
"""

PRODUCT_CONTEXT_TEMPLATE = """
Current Live Products from Zenve's Collection (use naturally if relevant):
{products}
"""


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------

def _get_product_context() -> str:
    """Fetch a brief snapshot of live products to ground the AI."""
    try:
        products = Product.objects.filter(
            status=Product.ProductStatus.APPROVED,
            is_active=True,
        ).select_related("designer").values(
            "product_name", "category", "subcategory",
            "colour", "material", "size", "selling_price",
            "return_policy", "fast_delivery",
        )[:20]

        if not products:
            return ""

        lines = []
        for p in products:
            line_parts = [f"• {p['product_name']}"]
            if p.get("category"):
                line_parts.append(f"({p['category']}")
                if p.get("subcategory"):
                    line_parts[-1] += f" / {p['subcategory']}"
                line_parts[-1] += ")"
            if p.get("colour"):
                line_parts.append(f"Colour: {p['colour']}")
            if p.get("material"):
                line_parts.append(f"Material: {p['material']}")
            if p.get("size"):
                line_parts.append(f"Size: {p['size']}")
            if p.get("selling_price"):
                line_parts.append(f"₹{p['selling_price']}")
            lines.append(" | ".join(line_parts))

        return PRODUCT_CONTEXT_TEMPLATE.format(products="\n".join(lines))
    except Exception as exc:
        logger.warning("Could not fetch product context for chatbot: %s", exc)
        return ""


def _build_gemini_history(history: list) -> list:
    """
    Convert frontend history format to Gemini SDK contents format.
    history = [{"role": "user"|"assistant", "content": "..."}, ...]
    """
    contents = []
    for turn in history:
        role = "user" if turn.get("role") == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": turn.get("content", "")}],
        })
    return contents


# ---------------------------------------------------------------------------
# VIEW
# ---------------------------------------------------------------------------

class ChatbotChatAPIView(APIView):
    """
    POST /api/chatbot/chat/
    Powers the Zenve Fashion AI concierge with strict fashion domain & line limits.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        message = (request.data.get("message") or "").strip()
        history = request.data.get("history") or []

        if not message:
            return Response(
                {"error": "Message is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 0. Limit answers to 2 questions per fresh chat; on 3rd question onwards, return Support Team
        prior_user_questions = sum(1 for turn in history if turn.get("role") == "user")
        if prior_user_questions >= 2:
            return Response(
                {"reply": SUPPORT_TEAM_REPLY, "contact_support": True},
                status=status.HTTP_200_OK,
            )

        # 1. Check trained FAQ repository (Sections A - G) directly
        trained_ans = match_trained_faq(message)
        if trained_ans:
            return Response(
                {"reply": enforce_line_limit(trained_ans, max_lines=2), "engine": "trained_faq"},
                status=status.HTTP_200_OK,
            )

        # 2. Strict domain check: reject non-fashion queries immediately
        if not is_fashion_domain(message, history):
            return Response(
                {"reply": OUT_OF_DOMAIN_REPLY},
                status=status.HTTP_200_OK,
            )

        # 2. Gemini is paused unless explicitly enabled; the local engine needs no API key.
        use_gemini = os.getenv("CHATBOT_USE_GEMINI", "False").strip().lower() in ("1", "true", "yes")
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not use_gemini or not api_key:
            reply = local_reply(message, history)
            return Response(
                {"reply": enforce_line_limit(reply, max_lines=2), "engine": "local"},
                status=status.HTTP_200_OK,
            )

        try:
            from google import genai

            client = genai.Client(api_key=api_key)

            # Build product-grounded system prompt
            product_context = _get_product_context()
            system_instruction = SYSTEM_PROMPT.format(
                product_context=product_context
            )

            # Build conversation history for context (max last 8 turns)
            history = history[-8:] if len(history) > 8 else history
            contents = _build_gemini_history(history)

            # Add current user message
            contents.append({
                "role": "user",
                "parts": [{"text": message}],
            })

            # Try the fast, responsive model with fallbacks
            candidate_models = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"]
            response = None
            last_err = None

            for m in candidate_models:
                try:
                    response = client.models.generate_content(
                        model=m,
                        contents=contents,
                        config={
                            "system_instruction": system_instruction,
                            "temperature": 0.7,
                            "max_output_tokens": 200,
                            "top_p": 0.95,
                        },
                    )
                    if response:
                        break
                except Exception as err:
                    last_err = err
                    logger.warning("Gemini model %s failed: %s, trying next...", m, err)

            if not response:
                raise last_err or Exception("All Gemini models failed")

            reply_text = ""
            if hasattr(response, "text") and response.text:
                reply_text = response.text.strip()
            elif response.candidates:
                candidate = response.candidates[0]
                if candidate.content and candidate.content.parts:
                    reply_text = "".join(
                        part.text for part in candidate.content.parts
                        if hasattr(part, "text")
                    ).strip()

            if not reply_text:
                reply_text = "I appreciate your question! Let me connect you with our styling team for the most personalised answer."

            # Enforce line limitation
            reply_text = enforce_line_limit(reply_text, max_lines=2)
            return Response({"reply": reply_text}, status=status.HTTP_200_OK)

        except Exception as exc:
            logger.error("Chatbot Gemini error, falling back to local engine: %s", exc, exc_info=True)
            reply = local_reply(message, history)
            return Response(
                {"reply": enforce_line_limit(reply, max_lines=2), "engine": "local"},
                status=status.HTTP_200_OK,
            )
