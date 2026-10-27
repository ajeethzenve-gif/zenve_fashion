"""
Zenve Fashion — Local Knowledge Engine (no API key required).

A lightweight, rule-based conversational engine that:
  * understands intents via weighted keyword + fuzzy matching (typo tolerant),
  * extracts entities (colour, fabric, occasion, size, price range, category),
  * answers small talk and basic generic questions (greetings, date/time, maths),
  * gives fashion knowledge (colour pairing, fabrics, occasions, care, sizing),
  * searches the live Product table for real recommendations,
  * uses recent conversation history for simple follow-up context.

Entry point:  generate_reply(message: str, history: list) -> str
"""

from __future__ import annotations

import ast
import operator
import random
import re
from datetime import datetime
from decimal import Decimal
from difflib import get_close_matches

from django.db.models import Q

# ---------------------------------------------------------------------------
# KNOWLEDGE BASE
# ---------------------------------------------------------------------------

COLOUR_PAIRINGS = {
    "black": "Black is the ultimate canvas. Pair it with gold or ivory for evening glamour, blush pink for softness, or a bold emerald or ruby for drama.",
    "white": "White feels fresh and serene. Try it with pastel mint, powder blue, or gold zari accents. For contrast, navy or a pop of coral works beautifully.",
    "ivory": "Ivory is quietly luxurious. It glows next to antique gold, dusty rose, sage green, and deep maroon.",
    "beige": "Beige is a versatile neutral. Layer it with olive, rust, chocolate brown, or crisp white. A touch of gold jewellery lifts it instantly.",
    "red": "Red is festive and confident. Balance it with gold, ivory, or deep green. For a modern look, pair it with blush or navy.",
    "maroon": "Maroon is rich and regal. It pairs gorgeously with antique gold, mustard, ivory, and dusty pink.",
    "pink": "Pink is playful and romantic. Try it with mint, grey, navy, ivory, or a contrast of emerald green for festive flair.",
    "blue": "Blue is calm and elegant. Pair it with white, silver, mustard, or peach. Royal blue with gold is a timeless festive combination.",
    "navy": "Navy is a refined alternative to black. It shines with white, blush, mustard, silver, and burgundy.",
    "green": "Green feels lush and fresh. Emerald with gold is regal; sage with ivory or blush is soft and modern; olive pairs well with rust and beige.",
    "emerald": "Emerald is a jewel tone made for celebrations. Pair it with gold, ivory, magenta, or deep pink.",
    "yellow": "Yellow is cheerful and sunny — perfect for haldi and daytime events. Pair it with white, grey, royal blue, or soft pink.",
    "mustard": "Mustard adds warmth. Combine it with maroon, navy, olive, or ivory for a rich, earthy palette.",
    "orange": "Orange is vibrant and festive. Balance it with pink, gold, teal, or ivory.",
    "purple": "Purple is luxurious and dramatic. Try it with gold, silver, mint, or blush pink.",
    "lavender": "Lavender is soft and dreamy. It looks lovely with silver, white, mint, and pale grey.",
    "grey": "Grey is a sophisticated neutral. Pair it with pink, yellow, burgundy, or crisp white.",
    "brown": "Brown is earthy and warm. Pair it with cream, olive, rust, or turquoise accents.",
    "gold": "Gold elevates almost everything — especially black, maroon, emerald, navy, and ivory.",
    "silver": "Silver feels cool and modern. It pairs well with navy, lavender, black, grey, and icy pastels.",
    "peach": "Peach is soft and flattering. Pair it with mint, ivory, gold, or a touch of navy.",
    "teal": "Teal is a confident jewel tone. Pair it with coral, mustard, gold, or ivory.",
}
COLOUR_ALIASES = {"gray": "grey", "cream": "ivory", "off white": "ivory", "off-white": "ivory",
                  "wine": "maroon", "burgundy": "maroon", "olive": "green", "sage": "green",
                  "mint": "green", "rose": "pink", "blush": "pink", "magenta": "pink",
                  "violet": "purple", "tan": "beige", "khaki": "beige", "turquoise": "teal"}

FABRICS = {
    "silk": "Silk is lustrous, luxurious, and drapes beautifully — ideal for weddings and festive occasions. Dry clean, or hand wash gently in cold water with a mild detergent. Never wring it; dry in shade.",
    "cotton": "Cotton is breathable, soft, and perfect for warm weather and everyday wear. Machine or hand wash in cold water and dry in shade to protect the colour.",
    "linen": "Linen is airy, textured, and wonderful for summer. It creases naturally — that is part of its charm. Wash gently and iron while slightly damp.",
    "chanderi": "Chanderi is a lightweight, sheer fabric with a subtle sheen, often woven with silk and cotton. Lovely for day festivities. Dry clean is best.",
    "georgette": "Georgette is light, flowy, and slightly grainy — it drapes elegantly for sarees and anarkalis. Hand wash gently or dry clean.",
    "chiffon": "Chiffon is sheer, feather-light, and graceful. Perfect for evening and layered looks. Hand wash cold or dry clean.",
    "velvet": "Velvet is plush and regal — ideal for winter weddings and evening events. Always dry clean and store hanging to protect the pile.",
    "khadi": "Khadi is hand-spun and hand-woven, breathable and sustainable. It softens with every wash. Hand wash in cold water.",
    "muslin": "Muslin is soft, fine, and breathable — wonderful for summer and for pets with sensitive skin. Gentle hand wash recommended.",
    "rayon": "Rayon is soft, smooth, and drapes well, making it great for everyday kurtas. Hand wash cold; avoid wringing.",
    "satin": "Satin has a glossy finish and luxurious feel — beautiful for evening wear. Hand wash cold or dry clean; iron on low on the reverse side.",
    "organza": "Organza is crisp, sheer, and structured — perfect for statement dupattas and festive layers. Dry clean recommended.",
    "denim": "Denim is sturdy and versatile. Wash inside out in cold water to preserve colour, and air dry.",
    "wool": "Wool is warm and insulating. Hand wash in cold water with wool detergent or dry clean; dry flat.",
}

OCCASIONS = {
    "wedding": "For weddings, rich fabrics like silk, velvet, or brocade in jewel tones — maroon, emerald, royal blue, or gold — feel celebratory. Add statement jewellery and embroidered details like zari or gota.",
    "reception": "For a reception, think evening glamour: deep jewel tones, metallics, or soft champagne in georgette, satin, or silk. A sleek silhouette with shimmer works beautifully.",
    "haldi": "For haldi, sunny yellows, marigold, and soft greens in light cotton or chanderi are perfect. Keep it comfortable — things may get colourful!",
    "mehendi": "For mehendi, vibrant greens, pinks, and oranges in flowy fabrics like georgette are ideal, with playful mirror work or gota details.",
    "sangeet": "For sangeet, choose something you can dance in — lehengas or sharara sets in georgette with shimmer, sequins, or mirror work.",
    "festival": "For festivals like Diwali or Navratri, go for vibrant colours, traditional silhouettes, and festive embellishments. Silk or chanderi with zari is a lovely choice.",
    "party": "For parties, a well-fitted outfit with a touch of shimmer or a bold colour stands out. Satin, velvet, or sequinned fabrics work well for evenings.",
    "office": "For the office, choose clean silhouettes in breathable cotton, linen, or rayon in muted tones — navy, beige, pastels, or white — with minimal accessories.",
    "casual": "For casual days, comfortable cotton, linen, or khadi in relaxed fits is perfect. Pair with simple flats and light accessories.",
    "date": "For a date, pick something that makes you feel confident — a flattering fit in soft pastels, classic black, or a romantic red works wonderfully.",
    "vacation": "For vacations, breathable linen and cotton in light, airy colours are ideal. Add prints and easy, packable pieces.",
    "beach": "For the beach, light cotton or linen in whites, blues, and tropical prints keep you cool and stylish.",
    "interview": "For interviews, a crisp, well-fitted outfit in neutral tones — navy, grey, black, or white — looks polished and confident.",
    "puja": "For a puja, traditional wear in auspicious colours like red, yellow, or white in cotton or silk feels graceful and respectful.",
    "birthday": "For a birthday celebration, choose a cheerful colour and a fit you love — playful prints or a statement piece make it special.",
}
OCCASION_ALIASES = {"marriage": "wedding", "shaadi": "wedding", "engagement": "wedding",
                    "diwali": "festival", "navratri": "festival", "eid": "festival",
                    "christmas": "festival", "onam": "festival", "pongal": "festival",
                    "holi": "festival", "work": "office", "formal": "office",
                    "everyday": "casual", "daily": "casual", "trip": "vacation",
                    "travel": "vacation", "holiday": "vacation", "cocktail": "party",
                    "dinner": "date", "pooja": "puja"}

CATEGORY_WORDS = ["saree", "sari", "kurta", "kurti", "lehenga", "dress", "gown", "anarkali",
                  "sherwani", "shirt", "top", "dupatta", "salwar", "sharara", "palazzo",
                  "jacket", "bandi", "twin", "pet", "dog", "cat", "men", "women", "kids"]

SIZES = ["xs", "s", "m", "l", "xl", "xxl", "free"]

JOKES = [
    "Why did the scarf break up with the hat? It felt it was always being left hanging!",
    "My wardrobe and I have a lot in common — we are both full of potential and slightly disorganised.",
    "Why do tailors make great friends? They always have your measurements and never leave you in stitches... well, maybe sometimes!",
    "I told my jeans a joke. They did not laugh — they were too tight-lipped.",
]

FASHION_TIPS = [
    "A perfect fit is the secret to looking expensive — a quick tailoring visit can transform any outfit.",
    "When in doubt, choose one statement piece and keep everything else simple.",
    "Neutral bases with one bold accent colour always look polished.",
    "Natural fabrics like cotton, linen, and silk breathe better and age more gracefully.",
    "Matching textures — like silk with silk or linen with cotton — creates a cohesive look.",
]

# ---------------------------------------------------------------------------
# INTENTS  (keyword -> weight)
# ---------------------------------------------------------------------------

INTENTS = {
    "greeting": {"hi": 3, "hello": 3, "hey": 3, "hiya": 3, "namaste": 3, "vanakkam": 3,
                 "good morning": 3, "good afternoon": 3, "good evening": 3, "greetings": 3, "yo": 2},
    "farewell": {"bye": 3, "goodbye": 3, "see you": 3, "later": 1, "goodnight": 3, "cya": 3},
    "thanks": {"thanks": 3, "thank": 3, "thx": 3, "appreciate": 2, "grateful": 2},
    "how_are_you": {"how are you": 4, "how r u": 4, "how are u": 4, "hows it going": 4,
                    "how do you do": 4, "whats up": 3, "wassup": 3},
    "identity": {"who are you": 4, "your name": 4, "what are you": 4, "are you a bot": 4,
                 "are you human": 4, "are you real": 3, "introduce yourself": 4},
    "capabilities": {"what can you do": 4, "help me": 2, "help": 2, "options": 2,
                     "how can you help": 4, "features": 2},
    "about": {"about zenve": 4, "what is zenve": 4, "zenve fashion": 3, "about you": 2,
              "your brand": 3, "your company": 3, "who owns": 3, "philosophy": 2},
    "twin": {"twin": 4, "matching": 3, "match my pet": 4, "pet": 3, "dog": 3, "cat": 3,
             "puppy": 3, "pets": 3},
    "colour": {"colour": 3, "color": 3, "colours": 3, "colors": 3, "goes with": 4,
               "go with": 4, "match with": 3, "combination": 3, "pair with": 4, "palette": 2,
               "skin tone": 3},
    "fabric": {"fabric": 3, "material": 3, "cloth": 2, "textile": 2},
    "care": {"wash": 3, "washing": 3, "clean": 2, "care": 2, "iron": 3, "dry clean": 4,
             "stain": 3, "maintain": 2, "store": 1, "shrink": 3},
    "occasion": {"occasion": 3, "wear to": 4, "wear for": 4, "outfit for": 4,
                 "dress for": 3, "what to wear": 4, "what should i wear": 4, "styling": 2,
                 "style": 1, "suggest an outfit": 4, "outfit": 2},
    "size": {"size": 3, "sizing": 3, "fit": 2, "fitting": 3, "measurement": 3,
             "measure": 3, "bust": 2, "waist": 2, "too small": 3, "too big": 3, "chart": 2},
    "shipping": {"delivery": 3, "shipping": 3, "ship": 2, "deliver": 3, "dispatch": 3,
                 "courier": 3, "how long": 2, "arrive": 2, "fast delivery": 4},
    "order": {"order": 3, "track": 3, "tracking": 3, "my order": 4, "order status": 4,
              "cancel": 3, "where is my": 4},
    "returns": {"return": 3, "refund": 3, "exchange": 3, "replace": 2, "final sale": 4,
                "money back": 3},
    "payment": {"payment": 3, "pay": 2, "upi": 3, "card": 2, "cod": 3,
                "cash on delivery": 4, "emi": 3},
    "contact": {"contact": 3, "support": 3, "customer care": 4, "phone number": 3,
                "email": 2, "call": 2, "talk to human": 4, "speak to someone": 4},
    "shop": {"show": 2, "find": 2, "looking for": 3, "buy": 3, "recommend": 3,
             "suggest": 2, "do you have": 4, "available": 2, "products": 3, "collection": 2,
             "new arrivals": 4, "latest": 2, "under": 1, "below": 1, "price": 2, "cost": 2,
             "cheap": 2, "budget": 2, "affordable": 2},
    "joke": {"joke": 4, "funny": 3, "make me laugh": 4, "humor": 3, "humour": 3},
    "tip": {"tip": 3, "tips": 3, "advice": 2, "trick": 2, "hack": 2},
    "datetime": {"time": 2, "date": 2, "today": 2, "day is it": 4, "what day": 4,
                 "current time": 4},
    "compliment": {"you are great": 4, "awesome": 2, "amazing": 2, "love you": 3,
                   "you are smart": 4, "good bot": 4, "nice": 1, "cool": 1, "helpful": 2},
    "negative": {"useless": 3, "stupid": 3, "bad bot": 4, "not helpful": 4, "wrong": 2,
                 "hate": 2},
    "affirm": {"yes": 2, "yeah": 2, "sure": 2, "ok": 1, "okay": 1, "yep": 2, "please": 1},
    "deny": {"no": 2, "nope": 2, "not really": 3, "nah": 2},
}

ALL_KEYWORDS = sorted({kw for kws in INTENTS.values() for kw in kws if " " not in kw})


# ---------------------------------------------------------------------------
# NLP HELPERS
# ---------------------------------------------------------------------------

def _normalise(text: str) -> str:
    text = text.lower().replace("’", "'")
    text = re.sub(r"[^a-z0-9₹\s\-\+\*/\.\(\)%']", " ", text)
    text = text.replace("'", "")
    return re.sub(r"\s+", " ", text).strip()


def _tokens(text: str) -> list[str]:
    return re.findall(r"[a-z]+", text)


def _corrected_tokens(tokens: list[str]) -> list[str]:
    """Fix small typos by snapping unknown words to known keywords/entities."""
    vocab = ALL_KEYWORDS + list(COLOUR_PAIRINGS) + list(COLOUR_ALIASES) + list(FABRICS) \
        + list(OCCASIONS) + list(OCCASION_ALIASES) + CATEGORY_WORDS
    fixed = []
    for t in tokens:
        if len(t) <= 3 or t in vocab:
            fixed.append(t)
            continue
        match = get_close_matches(t, vocab, n=1, cutoff=0.82)
        fixed.append(match[0] if match else t)
    return fixed


def _has(text: str, tokens: set[str], kw: str) -> bool:
    return (f" {kw} " in f" {text} ") if " " in kw else kw in tokens


def _score_intents(text: str, tokens: set[str]) -> dict[str, int]:
    scores = {}
    for intent, kws in INTENTS.items():
        s = sum(w for kw, w in kws.items() if _has(text, tokens, kw))
        if s:
            scores[intent] = s
    return scores


def _extract_entities(text: str, tokens: set[str]) -> dict:
    ent: dict = {}

    for c in COLOUR_PAIRINGS:
        if c in tokens:
            ent.setdefault("colours", []).append(c)
    for alias, c in COLOUR_ALIASES.items():
        if _has(text, tokens, alias) and c not in ent.get("colours", []):
            ent.setdefault("colours", []).append(c)

    ent["fabrics"] = [f for f in FABRICS if f in tokens]

    occ = [o for o in OCCASIONS if o in tokens]
    if "date" in occ and re.search(r"\b(the date|date today|todays date|what date|which date)\b", text):
        occ.remove("date")
    occ += [v for k, v in OCCASION_ALIASES.items() if k in tokens and v not in occ]
    ent["occasions"] = occ

    ent["categories"] = [c for c in CATEGORY_WORDS if c in tokens or f"{c}s" in tokens]

    size_match = re.search(r"\bsize\s+(xxl|xl|xs|s|m|l|free)\b", text)
    if size_match:
        ent["size"] = size_match.group(1).upper()

    nums = [Decimal(n) for n in re.findall(r"(?:₹|rs\.?\s*|inr\s*)?(\d{3,6})", text)]
    if nums:
        if re.search(r"\b(between|from)\b", text) and len(nums) >= 2:
            ent["min_price"], ent["max_price"] = min(nums[:2]), max(nums[:2])
        elif re.search(r"\b(above|over|more than|greater than|minimum|min)\b", text):
            ent["min_price"] = nums[0]
        elif re.search(r"\b(under|below|less than|within|upto|up to|max|maximum|budget)\b", text):
            ent["max_price"] = nums[0]

    return {k: v for k, v in ent.items() if v}


def _context_from_history(history: list) -> dict:
    """Pull entities from the last few user turns so follow-ups make sense."""
    ctx: dict = {}
    for turn in reversed(history[-6:]):
        if turn.get("role") != "user":
            continue
        t = _normalise(turn.get("content", ""))
        toks = set(_corrected_tokens(_tokens(t)))
        for k, v in _extract_entities(t, toks).items():
            ctx.setdefault(k, v)
    return ctx


def _last_bot_text(history: list) -> str:
    for turn in reversed(history):
        if turn.get("role") == "assistant":
            return turn.get("content", "").lower()
    return ""


# ---------------------------------------------------------------------------
# SAFE MATHS (DEPRECATED)

# ---------------------------------------------------------------------------
# FASHION DOMAIN FILTER & LINE LIMITER
# ---------------------------------------------------------------------------

OUT_OF_DOMAIN_REPLY = "I can only assist with fashion, styling, and Zenve collections."
SUPPORT_TEAM_REPLY = (
    "Please contact our Support Team for further assistance.\n"
    "Phone: +91 98765 43210 | Email: support@zenvefashion.com"
)

FASHION_DOMAIN_KEYWORDS = {
    # General fashion & apparel
    "fashion", "style", "styling", "stylist", "outfit", "outfits", "dress", "dresses",
    "attire", "apparel", "clothing", "clothes", "wardrobe", "garment", "garments",
    "couture", "wear", "wearing", "look", "looks", "collection", "collections",
    "trend", "trends", "trendy", "twin", "matching", "silhouette", "designer", "atelier",
    "saree", "saris", "sari", "sarees", "lehenga", "lehengas", "kurta", "kurtas",
    "kurti", "kurtis", "suit", "suits", "shirt", "shirts", "tshirt", "tshirts", "t-shirt",
    "pant", "pants", "trousers", "trouser", "jeans", "skirt", "skirts", "top", "tops",
    "gown", "gowns", "blazer", "blazers", "jacket", "jackets", "coat", "coats",
    "dupatta", "dupattas", "sherwani", "sherwanis", "bandhgala", "anarkali", "sharara",
    "gharara", "kaftan", "tunic", "tunics", "footwear", "shoes", "shoe", "sandals",
    "heels", "sneakers", "boots", "jutti", "juttis", "bag", "bags", "handbag", "handbags",
    "purse", "clutch", "accessory", "accessories", "jewel", "jewelry", "jewellery",
    "earrings", "necklace", "bangles", "bracelet", "ring", "belt", "belts", "scarf",
    "scarves", "stole", "stoles", "sunglasses", "glasses", "eyewear", "watch", "watches",

    # Pet fashion
    "pet", "pets", "dog", "dogs", "puppy", "puppies", "cat", "cats", "kitten", "kittens",
    "canine", "feline", "collar", "leash", "harness", "bandana", "bandanas",

    # Fabrics & materials
    "silk", "cotton", "linen", "chanderi", "georgette", "chiffon", "velvet", "khadi",
    "muslin", "rayon", "satin", "organza", "denim", "wool", "leather", "suede", "cashmere",
    "tweed", "brocade", "lace", "polyester", "crepe", "jacquard", "fabric", "fabrics",
    "material", "materials", "textile", "textiles", "cloth", "cloths", "zari", "chikankari",
    "kantha", "bandhani", "phulkari", "gota", "embroidery", "embroidered", "print", "prints",
    "weave", "handloom", "dye", "sequin", "sequins", "mirror work",

    # Colours
    "colour", "colours", "color", "colors", "white", "ivory", "beige", "red", "maroon",
    "pink", "blue", "navy", "green", "emerald", "yellow", "mustard", "orange", "purple",
    "lavender", "grey", "gray", "brown", "gold", "silver", "peach", "teal", "coral",
    "pastel", "pastels", "cream", "wine", "burgundy", "olive", "sage", "mint", "rose",
    "blush", "magenta", "violet", "tan", "khaki", "turquoise", "shade", "shades", "palette",

    # Occasions
    "occasion", "occasions", "wedding", "weddings", "marriage", "shaadi", "reception",
    "haldi", "mehendi", "mehndi", "sangeet", "festival", "festivals", "diwali", "navratri",
    "eid", "christmas", "party", "parties", "cocktail", "office", "formal", "casual",
    "date", "vacation", "holiday", "beach", "summer", "winter", "puja", "pooja",
    "festive", "celebration", "birthday", "event", "events",

    # Fit, care, shopping & brand
    "zenve", "product", "products", "item", "items", "stock", "in stock", "picture", "pictures", "photo", "photos", "image", "images", "details", "size", "sizes", "sizing", "fit", "fits", "fitting", "measurement", "measurements",
    "bust", "waist", "alteration", "tailor", "tailoring", "bespoke", "custom", "order",
    "orders", "shipping", "delivery", "deliver", "dispatch", "track", "tracking", "return",
    "returns", "refund", "exchange", "cancel", "payment", "pay", "price", "pricing", "cost",
    "budget", "discount", "discounts", "coupon", "coupons", "cart", "buy", "purchase", "shop",
    "shopping", "store", "showroom", "care", "wash", "washing", "iron", "ironing", "clean",
    "cleaning", "stain", "stains", "dry clean", "shrink", "contact", "support"
}

CONVERSATIONAL_KEYWORDS = {
    "hi", "hello", "hey", "hiya", "namaste", "vanakkam", "greetings",
    "good morning", "good afternoon", "good evening", "good night",
    "how are you", "who are you", "what are you", "what can you do", "introduce yourself",
    "help", "help me", "thanks", "thank you", "thx", "bye", "goodbye", "cya",
    "yes", "yeah", "yep", "sure", "ok", "okay", "no", "nope", "nah"
}

NON_FASHION_PATTERNS = [
    # Coding, programming, software, web, IT, tech
    r"\b(python|javascript|typescript|java|c\+\+|c#|golang|rust|php|ruby|swift|kotlin|html|css|sql|nosql|mongodb|react|vue|angular|svelte|nextjs|django|flask|fastapi|spring|node|nodejs|express|docker|kubernetes|linux|ubuntu|windows|bash|shell|powershell|git|github|gitlab)\b",
    r"\b(code|coding|programmer|programming|software|developer|develop|development|algorithm|data structure|function|variable|debug|debugging|bug|bugs|script|scripting|compile|compiler|database|server|backend|frontend|api|rest api|endpoint|sdk|terminal|ide|npm|pip)\b",
    # Mathematics, calculations, arithmetic, formulas
    r"\b(solve|calculate|calculation|calculator|math|maths|mathematics|equation|formula|arithmetic|algebra|geometry|calculus|trigonometry|derivative|integral|multiplication|percentage of|sum of|square root)\b",
    r"\d+\s*[\+\-\*/%^=]\s*\d+",
    # Science, physics, chemistry, biology, space, medicine/disease
    r"\b(physics|chemistry|biology|chemical|chemicals|synthesize|synthesized|petroleum|quantum|gravity|atom|molecule|periodic table|photosynthesis|dna|rna|cellular|gravity|relativity|thermodynamics|newton|einstein|planet|planets|solar system|galaxy|universe|black hole|astronomy|telescope|mars|moon|nasa|isro)\b",
    r"\b(symptom|symptoms|disease|illness|infection|virus|bacteria|diagnos|diagnosis|medicine for|cure for|fever|cough|headache|cancer|diabetes|hospital|prescription)\b",
    # Politics, government, elections, news, military (use 'naval' so navy blue is preserved)
    r"\b(president|prime minister|chief minister|parliament|congress|bjp|democrat|republican|senate|senator|election|elections|vote|voting|ballot|political|politics|politician|constitution|democracy|treaty|united nations|war|military|army|naval|air force|missile)\b",
    # Sports, athletics, matches
    r"\b(cricket|football|soccer|fifa|ipl|tennis|basketball|nba|badminton|olympics|world cup|messi|ronaldo|virat|kohli|dhoni|sachin|goal|wicket|tournament|match score)\b",
    # Cooking, recipes, food preparation
    r"\b(recipe|recipes|how to cook|ingredients|bake|baking|biryani|curry|pasta|pizza|burger|sandwich|soup|salad|dessert|roast|culinary|chef)\b",
    # Stories, poems, essays, jokes, riddles, entertainment
    r"\b(story|stories|poem|poems|poetry|essay|essays|joke|jokes|riddle|riddles|lyrics|script|article)\b",
    r"\b(movie|movies|film|films|cinema|actor|actress|hollywood|bollywood|netflix|series|season|episode|anime|manga|singer|music track|album|game|gaming|playstation|xbox|minecraft)\b",
    # Finance, cryptocurrency, investments
    r"\b(cryptocurrency|crypto|bitcoin|ethereum|btc|eth|stocks|stock market|shares|mutual fund|forex|investing|investment|trading|loan|mortgage|interest rate|fixed deposit|bank account)\b",
    # General encyclopedic trivia, geography, history
    r"\b(capital of|population of|distance (from|to|between)|speed of light|weather in|temperature in|forecast for)\b",
    r"\b(who (invented|discovered|wrote|directed|created|painted|founded))\b",
    r"\b(who (is|was|are|were)\s+(the\s+)?(president|prime minister|king|queen|emperor|inventor|author|founder|ceo|creator|director|actor|actress))\b",
]

def _matches_phrase_or_token(item: str, text: str, tokens: set[str]) -> bool:
    if " " in item:
        return f" {item} " in f" {text} "
    return item in tokens

def is_fashion_domain(message: str, history: list | None = None) -> bool:
    if not message:
        return False
    
    text = message.lower().strip()
    clean_text = re.sub(r"[^a-z0-9\s-]", " ", text)
    tokens = set(clean_text.split())

    # 1. Immediate rejection for any explicit non-fashion pattern
    # (coding, math, politics, science, recipes, trivia, stories, etc.)
    for pat in NON_FASHION_PATTERNS:
        if re.search(pat, text, re.IGNORECASE):
            return False

    # 2. Pure conversational greetings / courtesies (e.g. "hi", "hello", "thank you", "good morning")
    has_conv = any(_matches_phrase_or_token(conv, clean_text, tokens) for conv in CONVERSATIONAL_KEYWORDS)
    if has_conv and len(tokens) <= 5:
        return True

    # 3. Direct fashion domain keywords
    for word in FASHION_DOMAIN_KEYWORDS:
        if _matches_phrase_or_token(word, clean_text, tokens):
            return True

    # 4. History context for short follow-ups ("yes please", "what about silk?", "tell me more")
    if history and len(tokens) <= 6:
        for turn in reversed(history[-4:]):
            prev_content = turn.get("content", "").lower()
            prev_clean = re.sub(r"[^a-z0-9\s-]", " ", prev_content)
            prev_tokens = set(prev_clean.split())
            if any(_matches_phrase_or_token(w, prev_clean, prev_tokens) for w in FASHION_DOMAIN_KEYWORDS):
                return True

    return False

def enforce_line_limit(text: str, max_lines: int = 2) -> str:
    """Ensure the reply strictly does not exceed max_lines lines."""
    if not text:
        return ""
    
    text = text.strip()
    raw_lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # If the text already has line breaks, keep at most max_lines
    if len(raw_lines) > 1:
        return "\n".join(raw_lines[:max_lines]).strip()
    
    # If single paragraph, split by sentence endings (.!?)
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    if len(sentences) > max_lines:
        return "\n".join(sentences[:max_lines]).strip()
    elif len(sentences) > 1:
        return "\n".join(sentences).strip()
    
    return text

# ---------------------------------------------------------------------------

_OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
        ast.Div: operator.truediv, ast.Mod: operator.mod, ast.Pow: operator.pow,
        ast.USub: operator.neg, ast.UAdd: operator.pos}


def _safe_eval(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in _OPS:
        if isinstance(node.op, ast.Pow) and abs(_safe_eval(node.right)) > 12:
            raise ValueError("exponent too large")
        return _OPS[type(node.op)](_safe_eval(node.left), _safe_eval(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _OPS:
        return _OPS[type(node.op)](_safe_eval(node.operand))
    raise ValueError("unsupported expression")


def _try_maths(raw: str) -> str | None:
    text = raw.lower().replace("x", "*").replace("×", "*").replace("÷", "/")
    text = re.sub(r"\b(what is|whats|calculate|compute|solve|equals|=|\?)\b", " ", text)
    expr = re.sub(r"[^0-9\.\+\-\*/%\(\)\s]", "", text).strip()
    if not expr or not re.search(r"\d\s*[\+\-\*/%]\s*\(?\d", expr):
        return None
    try:
        result = _safe_eval(ast.parse(expr, mode="eval").body)
    except Exception:
        return None
    if isinstance(result, float):
        result = round(result, 4)
        if result.is_integer():
            result = int(result)
    return f"That comes to {result}. Numbers are lovely, but I am even better with hemlines and colour palettes — anything fashion I can help with?"


# ---------------------------------------------------------------------------
# PRODUCT SEARCH
# ---------------------------------------------------------------------------

def _search_products(ent: dict, raw_tokens: set[str], limit: int = 4) -> list[dict] | None:
    """Return matching live products, or None if the DB is unreachable."""
    try:
        from products.models import Product

        qs = Product.objects.filter(
            status__in=[Product.ProductStatus.APPROVED, Product.ProductStatus.LIVE],
            is_active=True,
        )
        for c in ent.get("colours", []):
            qs = qs.filter(colour__icontains=c)
        for f in ent.get("fabrics", []):
            qs = qs.filter(material__icontains=f)
        cats = [c for c in ent.get("categories", []) if c not in ("men", "women", "kids")]
        if cats:
            cq = Q()
            for c in cats:
                stem = c.rstrip("s") if c != "dress" else c
                cq |= Q(category__icontains=stem) | Q(subcategory__icontains=stem) | Q(product_name__icontains=stem)
            qs = qs.filter(cq)
        if ent.get("size"):
            qs = qs.filter(size=ent["size"])
        if ent.get("min_price") is not None:
            qs = qs.filter(selling_price__gte=ent["min_price"])
        if ent.get("max_price") is not None:
            qs = qs.filter(selling_price__lte=ent["max_price"])
        if "latest" in raw_tokens or "new" in raw_tokens:
            qs = qs.order_by("-id")
        return list(qs.values("product_name", "colour", "material", "selling_price", "category")[:limit])
    except Exception:
        return None


def _format_products(products: list[dict]) -> str:
    lines = []
    for p in products:
        details = " · ".join(x for x in [p.get("colour"), p.get("material")] if x)
        price = f" — ₹{p['selling_price']:,.0f}" if p.get("selling_price") is not None else ""
        lines.append(f"• {p['product_name']}{f' ({details})' if details else ''}{price}")
    return "\n".join(lines)


def _describe_filters(ent: dict) -> str:
    bits = []
    if ent.get("colours"):
        bits.append("/".join(ent["colours"]))
    if ent.get("fabrics"):
        bits.append("/".join(ent["fabrics"]))
    if ent.get("categories"):
        bits.append("/".join(ent["categories"]))
    if ent.get("size"):
        bits.append(f"size {ent['size']}")
    if ent.get("max_price") is not None:
        bits.append(f"under ₹{ent['max_price']:,.0f}")
    if ent.get("min_price") is not None:
        bits.append(f"above ₹{ent['min_price']:,.0f}")
    return " ".join(bits) or "pieces"


# ---------------------------------------------------------------------------
# RESPONDERS
# ---------------------------------------------------------------------------

def _greeting() -> str:
    hour = datetime.now().hour
    part = "Good morning" if hour < 12 else "Good afternoon" if hour < 17 else "Good evening"
    return random.choice([
        f"{part}, and welcome to Zenve Atelier! I am your personal style concierge. Are you shopping for a special occasion, or simply exploring today?",
        f"{part}! Lovely to see you. I can help with styling advice, colour pairing, fabrics, sizing, or our twin collections. What brings you here?",
    ])


def _colour_reply(ent: dict) -> str:
    colours = ent.get("colours", [])
    if colours:
        parts = [COLOUR_PAIRINGS[c] for c in colours[:2]]
        return " ".join(parts) + "\n\nWould you like me to look for pieces in these shades?"
    return ("Colour is where the magic begins! As a quick guide: warm undertones glow in mustard, rust, coral, olive, and gold; "
            "cool undertones shine in emerald, sapphire, lavender, and silver; and neutrals like ivory, navy, and blush flatter almost everyone.\n\n"
            "Tell me a colour you love — say \"what goes with maroon?\" — and I will suggest perfect pairings.")


def _fabric_reply(ent: dict, care_focus: bool = False) -> str:
    fabrics = ent.get("fabrics", [])
    if fabrics:
        return "\n\n".join(FABRICS[f] for f in fabrics[:2]) + "\n\nShall I suggest an occasion or outfit for this fabric?"
    if care_focus:
        return ("General care tips: always check the care label, wash darks separately in cold water, dry delicate fabrics in shade, "
                "and store silks and embroidered pieces wrapped in muslin. Which fabric are you caring for — silk, cotton, linen, velvet?")
    return ("Each fabric has its own personality: silk and velvet for grand celebrations, cotton, linen, and khadi for breathable everyday comfort, "
            "georgette and chiffon for graceful drapes, and chanderi or organza for light festive elegance. Which one would you like to know more about?")


def _occasion_reply(ent: dict) -> str:
    occ = ent.get("occasions", [])
    if occ:
        reply = OCCASIONS[occ[0]]
        if ent.get("colours"):
            reply += f" Since you mentioned {ent['colours'][0]}, " + COLOUR_PAIRINGS[ent["colours"][0]][0].lower() + COLOUR_PAIRINGS[ent["colours"][0]][1:]
        return reply + "\n\nWould you like me to check our collection for something suitable?"
    return ("I would love to help you style a look! Which occasion are you dressing for — a wedding, reception, festival, office, party, "
            "casual day out, or a vacation? Any favourite colours will help too.")


def _size_reply(ent: dict) -> str:
    return ("Here is a quick guide to our sizes (bust / waist in inches, approximate):\n"
            "• XS: 32 / 26\n• S: 34 / 28\n• M: 36 / 30\n• L: 38 / 32\n• XL: 40 / 34\n• XXL: 42 / 36\n• Free Size: relaxed, adjustable fit\n\n"
            "Measure around the fullest part of your bust and the narrowest part of your waist. If you fall between sizes, choose the larger one for comfort. "
            "Each product page also lists its exact size details.")


def _shop_reply(ent: dict, tokens: set[str]) -> str:
    advice = (OCCASIONS[ent["occasions"][0]] + "\n\n") if ent.get("occasions") else ""
    return advice + _shop_results(ent, tokens)


def _shop_results(ent: dict, tokens: set[str]) -> str:
    products = _search_products(ent, tokens)
    desc = _describe_filters(ent)
    if products is None:
        return "I am unable to browse the collection right this moment. Please explore our Shop page, and I will happily help with styling advice meanwhile."
    if products:
        return f"Here are some {desc} from our collection that you may love:\n{_format_products(products)}\n\nWould you like styling ideas for any of these?"
    if any(k in ent for k in ("colours", "fabrics", "categories", "size", "max_price", "min_price")):
        return (f"I could not find {desc} in our live collection just now. Try relaxing a filter — a different shade, fabric, or budget — "
                "or browse the Shop page for our full range. I can also suggest what to look for if you tell me the occasion.")
    return ("Our curated collection is being refreshed at the moment. Do browse the Shop page for the latest arrivals — "
            "and tell me the occasion, colour, or budget you have in mind so I can guide you.")



# ---------------------------------------------------------------------------
# 45 TRAINED FAQ RESPONSES (SECTIONS A - G)
# ---------------------------------------------------------------------------

TRAINED_FAQS = [
    # A. General website and brand questions
    {
        "id": "A1",
        "patterns": [
            r"what is zenve",
            r"what makes (it|zenve) different",
            r"about zenve fashion",
            r"why choose zenve",
            r"difference between zenve and other",
        ],
        "keywords": ["zenve", "different", "brand", "website", "what is zenve"],
        "answer": (
            "Zenve Fashion is India's premier luxury atelier designing couture for people and their pets together.\n"
            "We stand apart through artisanal craftsmanship, sustainable slow fashion, and our signature matching Twin sets."
        ),
    },
    {
        "id": "A2",
        "patterns": [
            r"what types of products can i buy",
            r"what (products|items) (can i buy|do you sell|are available)",
            r"what do you sell",
            r"product categories",
        ],
        "keywords": ["types of products", "can i buy", "what do you sell", "products can i buy"],
        "answer": (
            "You can shop designer ethnic and contemporary wear for men and women, handcrafted apparel for pets, and coordinated Twin collections.\n"
            "We also offer bespoke styling, artisanal accessories, bandanas, and festive wear."
        ),
    },
    {
        "id": "A3",
        "patterns": [
            r"difference between people,? pets,? and twin",
            r"what is (the )?difference between people,? pets",
            r"people vs pets vs twin",
            r"explain people pets twin",
        ],
        "keywords": ["difference between people", "pets and twin", "people pets twin"],
        "answer": (
            "Our People collection features couture for men and women, the Pets line offers pet-friendly comfort wear, and Twin sets deliver coordinated matching looks.\n"
            "Each Twin set shares identical fabrics, handloom textures, and embroidery motifs for you and your companion."
        ),
    },
    {
        "id": "A4",
        "patterns": [
            r"how (can|do) i explore all (the )?collections",
            r"explore all collections",
            r"browse (all )?collections",
            r"where can i see all collections",
        ],
        "keywords": ["explore all collections", "explore the collections", "browse all collections"],
        "answer": (
            "Use the top navigation bar to explore People, Pets, and Twin collections directly.\n"
            "You can also visit the Shop page to filter by designer, occasion, fabric, and color."
        ),
    },
    {
        "id": "A5",
        "patterns": [
            r"does zenve (fashion )?offer designer outfits for both people and pets",
            r"designer outfits for both people and pets",
            r"designer (wear|clothes|outfits) for (both )?people and pets",
        ],
        "keywords": ["designer outfits for both", "people and pets", "outfits for both people"],
        "answer": (
            "Yes! Zenve collaborates with top Indian artisans and designers to curate luxury outfits for both humans and pets.\n"
            "Every piece is handcrafted with skin-safe, premium fabrics and bespoke tailoring."
        ),
    },

    # B. Product discovery and shopping
    {
        "id": "B6",
        "patterns": [
            r"what products are currently available in the people collection",
            r"products (currently )?available in (the )?people collection",
            r"people collection (products|items)",
        ],
        "keywords": ["people collection", "available in the people", "products are currently available in the people"],
        "answer": (
            "Our People collection includes designer kurtas, lehengas, anarkalis, festive sherwanis, sarees, and relaxed linen casualwear.\n"
            "Explore the People section in our main menu to view all active designer pieces."
        ),
    },
    {
        "id": "B7",
        "patterns": [
            r"recommend (a |an )?(stylish )?outfit for (a )?wedding",
            r"outfit for (a )?wedding",
            r"what should i wear to a wedding",
            r"wedding (dress|wear|outfit) recommendation",
        ],
        "keywords": ["outfit for a wedding", "stylish outfit for a wedding", "wear for a wedding", "wedding outfit"],
        "answer": (
            "For weddings, we recommend opulent silk lehengas or sherwanis in regal jewel tones like emerald green, deep maroon, and royal gold.\n"
            "Detailed zari embroidery and brocade fabrics make an unforgettable statement."
        ),
    },
    {
        "id": "B8",
        "patterns": [
            r"what should i wear for an evening party",
            r"(outfit|dress) for (an )?evening party",
            r"recommend (something )?for (a |an )?evening party",
        ],
        "keywords": ["wear for an evening party", "evening party", "outfit for an evening party"],
        "answer": (
            "A sleek georgette anarkali, structured velvet blazer, or fluid satin gown in midnight blue or wine adds instant glamour.\n"
            "Pair with statement metallic accessories to complete your evening look."
        ),
    },
    {
        "id": "B9",
        "patterns": [
            r"(which|what) outfits would you recommend for everyday use",
            r"(outfit|clothes) for everyday (use)?",
            r"recommend for everyday",
            r"daily wear recommendation",
        ],
        "keywords": ["everyday use", "recommend for everyday", "outfits for everyday"],
        "answer": (
            "For effortless daily elegance, breathable handloom cotton kurtis, soft linen shirts, and relaxed khadi co-ords are ideal.\n"
            "They offer all-day comfort while keeping you impeccably styled."
        ),
    },
    {
        "id": "B10",
        "patterns": [
            r"do you have festive clothing suitable for indian celebrations",
            r"festive clothing (suitable for|for) indian celebrations",
            r"festive clothing suitable for indian",
            r"indian festive (wear|clothes|outfits)",
        ],
        "keywords": ["festive clothing", "indian celebrations", "suitable for indian celebrations"],
        "answer": (
            "Yes, our Festive Range features rich Chanderi, Banarasi silk, and handcrafted gota patti embroidery for celebrations like Diwali, Navratri, and Eid.\n"
            "Browse our Festive Edit on the Shop page for celebratory ensembles."
        ),
    },
    {
        "id": "B11",
        "patterns": [
            r"what clothing options are suitable for workwear",
            r"(clothing|outfit) options (suitable )?for workwear",
            r"suitable for workwear",
            r"office wear options",
        ],
        "keywords": ["suitable for workwear", "options are suitable for workwear", "workwear"],
        "answer": (
            "Clean-cut cotton kurtas, structured tailored bandis, and crisp linen shirts in muted tones like ivory, beige, and slate grey are perfect for workwear.\n"
            "They blend professional polish with breathable, all-day comfort."
        ),
    },
    {
        "id": "B12",
        "patterns": [
            r"recommend outfits for a holiday or resort vacation",
            r"(outfits|clothes) for (a )?(holiday|resort|vacation)",
            r"holiday or resort vacation",
            r"resort wear",
        ],
        "keywords": ["holiday or resort vacation", "resort vacation", "outfits for a holiday"],
        "answer": (
            "Breezy linen sets, printed cotton kaftans, and relaxed resort shirts in oceanic blues, ivory, and pastel yellows are vacation essentials.\n"
            "They pack lightly and keep you chic under sunny skies."
        ),
    },
    {
        "id": "B13",
        "patterns": [
            r"do you have clothing suitable for winter or monsoon weather",
            r"clothing suitable for winter or monsoon",
            r"winter or monsoon weather",
            r"winter or monsoon",
        ],
        "keywords": ["winter or monsoon", "winter or monsoon weather", "suitable for winter or monsoon"],
        "answer": (
            "For winter, we feature plush velvet kurtas, lined sherwanis, and wool-blend layers; for monsoon, we recommend fast-drying cottons and lightweight georgettes.\n"
            "Check our Seasonals tab on the Shop page for weather-ready fashion."
        ),
    },
    {
        "id": "B14",
        "patterns": [
            r"what accessories are available for pets",
            r"accessories (available )?for pets",
            r"pet accessories available",
            r"accessories for pets",
        ],
        "keywords": ["accessories are available for pets", "accessories for pets", "pet accessories"],
        "answer": (
            "Our pet accessories include artisanal printed bandanas, embroidered collars, velvet bow ties, festive dupattas, and padded coordinating leashes.\n"
            "All items use pet-friendly, non-toxic hardware and hypoallergenic fabrics."
        ),
    },
    {
        "id": "B15",
        "patterns": [
            r"suggest a stylish outfit for my dog for a special occasion",
            r"(stylish )?outfit for my dog for a special occasion",
            r"dog outfit for a special occasion",
            r"special occasion outfit for dog",
        ],
        "keywords": ["outfit for my dog for a special occasion", "stylish outfit for my dog", "dog for a special occasion"],
        "answer": (
            "A tailored brocade pet sherwani or a festive silk vest lined with breathable muslin is perfect for your dog's special day.\n"
            "It features ergonomic chest snaps so your pet stays handsome, regal, and happy."
        ),
    },

    # C. Twin fashion and styling recommendations
    {
        "id": "C16",
        "patterns": [
            r"what is twin fashion,? and how does it work",
            r"what is twin fashion",
            r"how does twin fashion work",
            r"explain twin fashion",
        ],
        "keywords": ["what is twin fashion", "twin fashion and how does it work", "how does it work twin"],
        "answer": (
            "Twin Fashion is Zenve's signature concept pairing coordinated human couture with pet outfits in matching artisan textiles and colors.\n"
            "You choose your ensemble, and your pet receives an ergonomically designed counterpart in identical fabric and detailing."
        ),
    },
    {
        "id": "C17",
        "patterns": [
            r"can you find matching outfits for me and my dog",
            r"matching outfits for me and my dog",
            r"outfits for me and my dog",
            r"match me and my dog",
        ],
        "keywords": ["matching outfits for me and my dog", "outfits for me and my dog", "me and my dog"],
        "answer": (
            "Yes! Explore our Twin Collection to discover coordinated sets like festive brocade kurtas with matching canine vests and silk bandanas.\n"
            "Select your size and your dog's breed size to order the synchronized duo."
        ),
    },
    {
        "id": "C18",
        "patterns": [
            r"do you have coordinated outfits for people and cats",
            r"coordinated outfits for people and cats",
            r"outfits for people and cats",
            r"matching outfits for cats",
        ],
        "keywords": ["coordinated outfits for people and cats", "people and cats", "outfits for people and cats"],
        "answer": (
            "Yes! We design ultra-lightweight, stress-free cat capes, collars, and bandanas tailored to match your saree, kurta, or dress.\n"
            "They are crafted from feather-light muslin and chanderi so your feline stays peaceful and poised."
        ),
    },
    {
        "id": "C19",
        "patterns": [
            r"can you recommend matching outfits for a festive photoshoot",
            r"recommend matching outfits for a festive photoshoot",
            r"matching outfits for a festive photoshoot",
            r"festive photoshoot outfits",
        ],
        "keywords": ["matching outfits for a festive photoshoot", "festive photoshoot", "photoshoot"],
        "answer": (
            "For celebratory photoshoots, rich marigold yellow chanderi or royal emerald silk twin sets reflect studio and outdoor light gorgeously.\n"
            "Coordinate subtle gold zari accents across both outfits for breathtaking portraits."
        ),
    },
    {
        "id": "C20",
        "patterns": [
            r"how can i coordinate my outfit with my pet without looking too similar",
            r"coordinate my outfit with my pet without looking too similar",
            r"without looking too similar",
            r"coordinate with pet without looking identical",
        ],
        "keywords": ["without looking too similar", "coordinate my outfit with my pet", "too similar"],
        "answer": (
            "Opt for accent coordination: match your pet's bandana or collar to your pocket square, dupatta border, or footwear rather than full print duplication.\n"
            "Using harmonious tone-on-tone shades like sage and olive also creates refined balance."
        ),
    },
    {
        "id": "C21",
        "patterns": [
            r"which twin collection would be suitable for a wedding or celebration",
            r"twin collection (would be )?suitable for a wedding or celebration",
            r"twin collection for a wedding",
            r"wedding twin collection",
        ],
        "keywords": ["twin collection would be suitable for a wedding", "twin collection for a wedding or celebration", "wedding or celebration"],
        "answer": (
            "Our Royal Heritage Twin collection in pure Banarasi silk and antique zari is tailor-made for weddings and galas.\n"
            "It pairs a majestic human ensemble with a comfortable, regal pet sherwani."
        ),
    },

    # D. Product details, sizing, and fit
    {
        "id": "D22",
        "patterns": [
            r"what material is this product made from",
            r"what material is (the|this) (product|outfit|fabric) made from",
            r"material is this product made from",
            r"what material is",
        ],
        "keywords": ["material is this product made from", "material is this product", "material is this"],
        "answer": (
            "Each garment lists its exact composition under the Product Details tab — we use pure silks, organic cottons, handspun khadi, and fine linen.\n"
            "Pet wear is additionally lined with hypoallergenic muslin for maximum comfort."
        ),
    },
    {
        "id": "D23",
        "patterns": [
            r"what sizes are available for this outfit",
            r"sizes (are )?available for this outfit",
            r"what sizes are available",
            r"available sizes for this outfit",
        ],
        "keywords": ["sizes are available for this outfit", "sizes are available", "available for this outfit"],
        "answer": (
            "People apparel is offered in sizes XS through XXL (with custom sizing available), while pet garments range from XS (puppy/kitten) to XXL (large breeds).\n"
            "Check the Size Selector on the product page for current availability."
        ),
    },
    {
        "id": "D24",
        "patterns": [
            r"does this product come in different colou?rs",
            r"come in different colou?rs",
            r"different colou?rs",
            r"colou?r options",
        ],
        "keywords": ["different colours", "different colors", "come in different"],
        "answer": (
            "Yes, available colorways are displayed as color chips on each product's page.\n"
            "Our bespoke atelier can also hand-dye select designer pieces in custom shades upon request."
        ),
    },
    {
        "id": "D25",
        "patterns": [
            r"how do i choose the correct size for myself",
            r"choose the correct size for myself",
            r"correct size for myself",
            r"choose size for myself",
        ],
        "keywords": ["correct size for myself", "choose the correct size", "size for myself"],
        "answer": (
            "Refer to the 'Size Guide' button on the product page to check your bust, waist, and hip measurements against our chart.\n"
            "If you are between sizes, we recommend selecting the larger size for a relaxed, comfortable drape."
        ),
    },
    {
        "id": "D26",
        "patterns": [
            r"how can i measure my pet before ordering clothes",
            r"measure my pet before ordering clothes",
            r"measure my pet before ordering",
            r"how to measure my pet",
        ],
        "keywords": ["measure my pet before ordering", "measure my pet", "before ordering clothes"],
        "answer": (
            "Measure your pet's neck circumference, chest girth at the widest ribcage area, and back length from collar base to tail base.\n"
            "Compare these three numbers with our Pet Sizing Chart for the perfect snug yet breathable fit."
        ),
    },
    {
        "id": "D27",
        "patterns": [
            r"will this pet outfit allow my dog to move comfortably",
            r"allow my dog to move comfortably",
            r"dog to move comfortably",
            r"pet outfit move comfortably",
        ],
        "keywords": ["move comfortably", "allow my dog to move", "allow my dog to move comfortably"],
        "answer": (
            "Absolutely. Zenve pet garments are ergonomically crafted with stretch gussets, wide leg cutouts, and soft inner linings.\n"
            "Your pet can walk, sit, run, and relieve themselves without restriction."
        ),
    },
    {
        "id": "D28",
        "patterns": [
            r"can i see more pictures and details of a product before purchasing",
            r"see more pictures and details of a product",
            r"more pictures and details of a product",
            r"pictures and details before purchasing",
        ],
        "keywords": ["see more pictures and details", "pictures and details of a product", "before purchasing"],
        "answer": (
            "Yes! Every product page features multi-angle high-resolution photography, fabric zoom, model dimensions, and styling videos.\n"
            "Tap any image in the gallery to inspect the weave, texture, and embroidery up close."
        ),
    },
    {
        "id": "D29",
        "patterns": [
            r"does the price change depending on the selected size",
            r"price change depending on the selected size",
            r"price change depending on size",
            r"does price change with size",
        ],
        "keywords": ["price change depending on the selected size", "price change depending", "selected size"],
        "answer": (
            "Standard ready-to-wear sizes from XS to XXL are priced identically.\n"
            "Only specialized bespoke customizations requiring extensive hand-embroidery or custom fabric yardage reflect nominal adjustments."
        ),
    },

    # E. Prices, discounts, and availability
    {
        "id": "E30",
        "patterns": [
            r"what is the price of this product",
            r"price of this product",
            r"what is the price",
            r"cost of this product",
        ],
        "keywords": ["price of this product", "what is the price of this product"],
        "answer": (
            "All product prices in INR (inclusive of all applicable taxes) are clearly displayed next to the item name on its product card and page.\n"
            "Any ongoing festive discounts are factored into the displayed price."
        ),
    },
    {
        "id": "E31",
        "patterns": [
            r"are there any discounts available on this outfit",
            r"discounts available on this outfit",
            r"discounts on this outfit",
            r"any discounts available",
        ],
        "keywords": ["discounts available on this outfit", "discounts available", "discounts on this outfit"],
        "answer": (
            "Current seasonal promotions and active coupon codes are showcased on our top promotional banner.\n"
            "You can enter eligible voucher codes at checkout to apply instant discounts."
        ),
    },
    {
        "id": "E32",
        "patterns": [
            r"can you show me products within my budget of ?[₹rs\.]* ?2,?000",
            r"show me products within my budget of ?[₹rs\.]* ?2,?000",
            r"products within my budget of ?[₹rs\.]* ?2,?000",
            r"budget of ?[₹rs\.]* ?2,?000",
        ],
        "keywords": ["budget of 2,000", "budget of 2000", "within my budget of", "budget of 2"],
        "answer": (
            "You can find handcrafted pet bandanas, bowties, cotton accessories, and light dupattas in our Under ₹2,000 curation.\n"
            "Use the price slider on our Shop page to browse all pieces tailored to your exact budget."
        ),
    },
    {
        "id": "E33",
        "patterns": [
            r"which products are currently in stock",
            r"products are currently in stock",
            r"currently in stock",
            r"which products in stock",
        ],
        "keywords": ["currently in stock", "products are currently in stock", "which products are currently"],
        "answer": (
            "All items displayed on our website with an active 'Add to Cart' button are currently in stock and ready for processing.\n"
            "You can also use the 'In Stock' filter on the Shop page to view immediate-dispatch collections."
        ),
    },
    {
        "id": "E34",
        "patterns": [
            r"can i find similar products at a lower price",
            r"find similar products at a lower price",
            r"similar products at a lower price",
            r"similar at a lower price",
        ],
        "keywords": ["similar products at a lower price", "at a lower price", "similar products at a lower"],
        "answer": (
            "Yes, check the 'You May Also Like' and 'Similar Styles' recommendations at the bottom of each product page for budget-friendly alternatives.\n"
            "You can also sort any collection by 'Price: Low to High'."
        ),
    },
    {
        "id": "E35",
        "patterns": [
            r"how can i sort products by price or ratings",
            r"sort products by price or ratings",
            r"sort by price or ratings",
            r"sort products by price",
        ],
        "keywords": ["sort products by price or ratings", "sort products by price", "price or ratings"],
        "answer": (
            "On the Shop or Collection page, click the 'Sort By' dropdown on the top-right to order pieces by Price: Low to High, High to Low, or Customer Rating.\n"
            "You can combine sorting with category filters for effortless discovery."
        ),
    },

    # F. Cart, wishlist, checkout, and orders
    {
        "id": "F36",
        "patterns": [
            r"how do i add a product to my shopping cart",
            r"add a product to my shopping cart",
            r"add to shopping cart",
            r"add to my cart",
        ],
        "keywords": ["add a product to my shopping cart", "add a product to my shopping", "shopping cart"],
        "answer": (
            "Select your desired size and color on the product page, then click the golden 'Add to Cart' button.\n"
            "A confirmation tray will appear, and your cart count in the top-right header will update immediately."
        ),
    },
    {
        "id": "F37",
        "patterns": [
            r"can i save products to my wishlist and purchase them later",
            r"save products to my wishlist and purchase them later",
            r"save to my wishlist and purchase them later",
            r"wishlist and purchase them later",
        ],
        "keywords": ["wishlist and purchase them later", "save products to my wishlist", "purchase them later"],
        "answer": (
            "Yes! Tap the heart icon on any product card or detail page to save it directly to your Wishlist.\n"
            "You can access and move saved items to your cart anytime from the heart icon in the navigation bar."
        ),
    },
    {
        "id": "F38",
        "patterns": [
            r"how can i buy a product after selecting its colou?r and size",
            r"buy a product after selecting its colou?r and size",
            r"buy a product after selecting",
            r"after selecting its colou?r and size",
        ],
        "keywords": ["after selecting its colour and size", "after selecting its color and size", "buy a product after selecting"],
        "answer": (
            "Once your color and size are selected, click 'Add to Cart', open your bag via the Cart icon, and click 'Proceed to Checkout'.\n"
            "Enter your shipping address and choose your payment method to confirm the purchase."
        ),
    },
    {
        "id": "F39",
        "patterns": [
            r"what payment methods are supported at checkout",
            r"payment methods are supported at checkout",
            r"payment methods supported at checkout",
            r"supported at checkout",
        ],
        "keywords": ["payment methods are supported at checkout", "payment methods are supported", "supported at checkout"],
        "answer": (
            "We accept all major payment methods including UPI (GPay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), and Net Banking.\n"
            "All transactions are processed through 256-bit encrypted secure gateways."
        ),
    },
    {
        "id": "F40",
        "patterns": [
            r"how can i check the status of my order",
            r"check the status of my order",
            r"status of my order",
            r"order status check",
        ],
        "keywords": ["check the status of my order", "status of my order", "check status of my order"],
        "answer": (
            "Log into your Zenve account and visit 'My Orders' to see live tracking milestones and courier details for your package.\n"
            "You will also receive SMS and email tracking links upon dispatch."
        ),
    },
    {
        "id": "F41",
        "patterns": [
            r"where can i view my previous orders",
            r"view my previous orders",
            r"see my previous orders",
            r"previous orders view",
        ],
        "keywords": ["view my previous orders", "my previous orders", "previous orders"],
        "answer": (
            "Click on your profile avatar in the header and select 'My Orders' from the dropdown menu.\n"
            "There you will find your complete purchase history, past receipts, and reorder options."
        ),
    },

    # G. Shipping, returns, and website assistance
    {
        "id": "G42",
        "patterns": [
            r"do you offer free shipping across india",
            r"offer free shipping across india",
            r"free shipping across india",
            r"shipping across india",
        ],
        "keywords": ["free shipping across india", "shipping across india", "offer free shipping"],
        "answer": (
            "Yes, Zenve Fashion offers complimentary standard shipping across India on qualifying orders.\n"
            "Express courier options are also selectable at checkout for urgent festive occasions."
        ),
    },
    {
        "id": "G43",
        "patterns": [
            r"how long will it take for my order to arrive",
            r"how long will it take for my order",
            r"take for my order to arrive",
            r"how long for order to arrive",
        ],
        "keywords": ["how long will it take for my order to arrive", "for my order to arrive", "take for my order to arrive"],
        "answer": (
            "Standard delivery takes 3 to 7 business days depending on your location, while Fast Delivery items arrive within 48 to 72 hours.\n"
            "Estimated arrival dates are displayed on each product page and at checkout."
        ),
    },
    {
        "id": "G44",
        "patterns": [
            r"can i exchange an outfit if the size does not fit",
            r"exchange an outfit if the size does not fit",
            r"if the size does not fit",
            r"exchange if size does not fit",
        ],
        "keywords": ["exchange an outfit if the size does not fit", "if the size does not fit", "exchange an outfit"],
        "answer": (
            "Yes! You can initiate a hassle-free size exchange within 7 days of delivery from the 'My Orders' section of your account.\n"
            "Items must be unworn, in original condition with all designer tags intact."
        ),
    },
    {
        "id": "G45",
        "patterns": [
            r"what should i do if my order arrives damaged or i need help with a purchase",
            r"order arrives damaged or i need help with a purchase",
            r"order arrives damaged",
            r"need help with a purchase",
        ],
        "keywords": ["order arrives damaged or i need help with a purchase", "order arrives damaged", "need help with a purchase"],
        "answer": (
            "Please reach out immediately via our Contact page or email support@zenvefashion.com with your Order ID and photos of the damage.\n"
            "Our dedicated care team will arrange a prompt priority replacement or full refund."
        ),
    },
]

def match_trained_faq(query: str) -> str | None:
    if not query:
        return None
    clean_q = re.sub(r"[^a-z0-9\s]", " ", query.lower()).strip()
    
    # 1. Regex pattern matching
    for faq in TRAINED_FAQS:
        for p in faq["patterns"]:
            if re.search(p, clean_q):
                return faq["answer"]
                
    # 2. Key phrase matching
    best_faq = None
    best_score = 0
    for faq in TRAINED_FAQS:
        score = 0
        for kw in faq["keywords"]:
            if kw in clean_q:
                score += len(kw.split()) * 3
        if score > best_score and score >= 4:
            best_score = score
            best_faq = faq
            
    if best_faq:
        return best_faq["answer"]
    return None


RESPONSES = {
    "farewell": ["It was a pleasure styling with you. Come back anytime — Zenve Atelier is always here for you!",
                 "Goodbye for now! May your wardrobe always feel like you."],
    "thanks": ["You are most welcome! Is there anything else I can help you style today?",
               "My pleasure entirely. Anything else you would like to explore?"],
    "how_are_you": ["I am wonderful, thank you for asking! Surrounded by beautiful fabrics, how could I not be? How can I help you today?",
                    "Feeling fabulous and ready to style! How are you doing?"],
    "identity": ["I am Zenve, the virtual style concierge of Zenve Fashion. I am a friendly assistant (not a human) built to help with styling, colours, fabrics, sizing, and finding pieces in our collection."],
    "capabilities": ["I can help you with:\n• Outfit ideas for any occasion\n• Colour pairing and palettes\n• Fabric guides and garment care\n• Size and fit guidance\n• Finding products by colour, fabric, or budget\n• Twin (human + pet) matching outfits\n• Delivery, returns, and payment questions\n\nWhat would you like to start with?"],
    "about": ["Zenve Fashion is an artisanal Indian fashion house celebrating handcrafted garments, curated designer collections, and our signature twin sets — matching outfits for you and your beloved pet. We champion slow fashion, skilled artisans, and timeless craftsmanship."],
    "twin": ["Our signature Twin Collection lets you and your pet step out in coordinated style! Each set mirrors the fabric, colour, and motifs of your outfit in a pet-friendly, comfortable cut. Soft cotton and muslin are wonderful for pets, while silk accents add festive charm.\n\nTell me your pet's size and the occasion, and I can guide you further."],
    "shipping": ["We dispatch orders as quickly as possible, and products marked Fast Delivery reach you sooner. Exact delivery timelines depend on your location and are shown at checkout. Once shipped, you can follow your order from the My Orders section of your account."],
    "order": ["For your order status, tracking, or cancellation, please log into your account and open My Orders — you will find the latest updates there. If anything looks off, our support team will gladly help."],
    "returns": ["Return eligibility depends on the product — each item is marked either Returnable or Final Sale on its product page. For returnable items, you can raise a request from My Orders in your account. Please keep the garment unworn with tags attached."],
    "payment": ["We support secure online payments at checkout. The available payment methods are shown on the checkout page for your order. If you face any payment issue, please contact our support team."],
    "contact": ["You can reach our support team through the Contact page on our website. For order-specific help, please log into your account so we can assist you faster."],
    "compliment": ["You are too kind! It is a joy to help you. What shall we style next?",
                   "Thank you — that made my day! Anything else on your style wishlist?"],
    "negative": ["I am sorry I could not help as well as you deserved. Could you rephrase your question? I am best at styling, colours, fabrics, sizing, and finding products — or our support team can help via the Contact page."],
    "deny": ["No problem at all! Let me know whenever you need styling help."],
}

FALLBACKS = [
    "I specialize in fashion styling, fabrics, sizing, and our collections.\nCould you tell me more about the outfit or look you are seeking?",
    "I am here to help with your fashion queries, color pairings, or our twin sets.\nWhat style or occasion are you shopping for today?"
]


# ---------------------------------------------------------------------------
# MAIN ENTRY
# ---------------------------------------------------------------------------

def generate_reply(message: str, history: list | None = None) -> str:
    history = history or []
    
    # 0. Allow answers for only 2 questions in a fresh chat; on 3rd question, route to support
    prior_user_questions = sum(1 for turn in history if turn.get("role") == "user")
    if prior_user_questions >= 2:
        return SUPPORT_TEAM_REPLY

    # 1. Check trained FAQ repository (Sections A - G) directly
    trained_ans = match_trained_faq(message)
    if trained_ans:
        return enforce_line_limit(trained_ans, max_lines=2)

    # 2. Enforce strict fashion domain check
    if not is_fashion_domain(message, history):
        return OUT_OF_DOMAIN_REPLY

    text = _normalise(message)
    raw_tokens = _tokens(text)
    tokens = set(_corrected_tokens(raw_tokens))
    tokens |= {t[:-1] for t in tokens if t.endswith("s") and len(t) > 3}
    tokens |= {t[:-2] for t in tokens if t.endswith("es") and len(t) > 4}
    corrected_text = " ".join(_corrected_tokens(raw_tokens))

    scores = _score_intents(corrected_text, tokens)
    ent = _extract_entities(f"{corrected_text} {text}", tokens)

    # Entities alone imply intents
    if ent.get("occasions"):
        scores["occasion"] = scores.get("occasion", 0) + 3
    if ent.get("fabrics") and "care" not in scores:
        scores["fabric"] = scores.get("fabric", 0) + 2
    if ent.get("colours") and not ent.get("categories"):
        scores["colour"] = scores.get("colour", 0) + 1
    garment_cats = [c for c in ent.get("categories", []) if c not in ("twin", "pet", "dog", "cat")]
    if garment_cats or "max_price" in ent or "min_price" in ent:
        scores["shop"] = scores.get("shop", 0) + 4

    # Short follow-ups ("yes please", "what about silk?") inherit earlier context
    if scores.keys() <= {"affirm", "deny"} or len(raw_tokens) <= 4:
        ctx = _context_from_history(history)
        last_bot = _last_bot_text(history)
        if "affirm" in scores and ("look for" in last_bot or "check our collection" in last_bot):
            merged = {**ctx, **ent}
            reply = _shop_reply(merged, tokens)
            return enforce_line_limit(reply, max_lines=2)
        for k, v in ctx.items():
            ent.setdefault(k, v)

    if not scores:
        return enforce_line_limit(random.choice(FALLBACKS), max_lines=2)

    # Greeting combined with a real question -> answer the question
    if len(scores) > 1:
        for social in ("greeting", "affirm", "compliment"):
            scores.pop(social, None)

    # Service questions ("do you have returns?") should beat the generic shopping trigger
    if ("shop" in scores and not garment_cats and "max_price" not in ent and "min_price" not in ent
            and scores.keys() & {"returns", "shipping", "payment", "order", "size", "care", "contact"}):
        scores.pop("shop")

    intent = max(scores, key=scores.get)

    if intent == "greeting":
        reply = _greeting()
    elif intent == "joke":
        reply = random.choice(JOKES) + "\nNow, shall we find you something that truly fits?"
    elif intent == "tip":
        reply = "Here is a styling tip: " + random.choice(FASHION_TIPS)
    elif intent == "colour":
        reply = _colour_reply(ent)
    elif intent == "fabric":
        reply = _fabric_reply(ent)
    elif intent == "care":
        reply = _fabric_reply(ent, care_focus=True)
    elif intent == "occasion":
        reply = _occasion_reply(ent)
    elif intent == "size":
        reply = _size_reply(ent)
    elif intent == "shop":
        reply = _shop_reply(ent, tokens)
    elif intent == "affirm":
        reply = "Wonderful! Tell me the occasion, a colour you love, or your budget, and I will guide you."
    elif intent in RESPONSES:
        reply = random.choice(RESPONSES[intent])
    else:
        reply = random.choice(FALLBACKS)

    return enforce_line_limit(reply, max_lines=2)