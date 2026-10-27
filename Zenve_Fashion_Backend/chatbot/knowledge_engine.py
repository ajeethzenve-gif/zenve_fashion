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
    "pets": {"pet outfit": 5, "pet outfits": 5, "pet clothes": 5, "dog clothes": 5, "cat clothes": 5, "pet accessories": 5, "for my dog": 4, "for my pet": 4, "for my cat": 4, "pets collection": 5, "pet collection": 5, "dog": 3, "cat": 3, "puppy": 3, "kitten": 3, "pet": 3, "pets": 3},
    "twin": {"twin": 5, "twin collection": 5, "matching": 4, "match my pet": 5, "coordinated": 4},
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

OUT_OF_DOMAIN_REPLY = (
    "I can only assist with fashion, styling, and Zenve collections.\n"
    "Please ask me about our luxury outfits, collections, or sizing advice."
)
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

def enforce_line_limit(text: str, max_lines: int = 3, min_lines: int = 2) -> str:
    """Ensure the reply strictly has 2 or 3 short lines."""
    if not text:
        return ""
    
    text = text.strip()
    raw_lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # If text already has 2 or more lines, clamp to at most max_lines
    if len(raw_lines) >= min_lines:
        return "\n".join(raw_lines[:max_lines]).strip()
    
    # If single line, split by sentence endings (.!?)
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    if len(sentences) >= min_lines:
        return "\n".join(sentences[:max_lines]).strip()
    
    # If single long sentence, try to split at a midpoint punctuation
    if len(sentences) == 1 and len(text) > 60:
        mid = len(text) // 2
        for punct in [', ', '; ', ' - ', ' and ']:
            idx = text.find(punct, int(mid * 0.7), int(mid * 1.3))
            if idx != -1:
                split_idx = idx + len(punct)
                return f"{text[:split_idx].strip()}\n{text[split_idx:].strip()}"
    
    # Ensure 2 lines by suggesting the shop URL
    return f"{text}\nExplore our collections here: /shop"

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
        c = colours[0]
        return f"Shades of {c} look stunning paired with gold, ivory, or pearl accents.\nExplore {c} outfits here: /shop"
    return "Warm tones glow in mustard and rust, while cool tones shine in emerald and sapphire.\nFilter products by colour: /shop"


def _fabric_reply(ent: dict, care_focus: bool = False) -> str:
    fabrics = ent.get("fabrics", [])
    if fabrics:
        f = fabrics[0]
        return f"Our {f} garments are handcrafted for breathability and luxury drape.\nExplore {f} designs: /shop"
    return "We handcraft our couture in pure silk, breathable cotton, and chanderi.\nBrowse by fabric here: /shop"


def _occasion_reply(ent: dict) -> str:
    occ = ent.get("occasions", [])
    if occ:
        o = occ[0]
        return f"For {o}, we recommend our regal silk ensembles and statement motifs.\nExplore occasion outfits: /shop"
    return "From royal weddings to festive parties, discover our designer wear.\nBrowse occasion couture: /shop"


def _size_reply(ent: dict) -> str:
    return "We offer sizes XS through XXL for humans and XS to XXL for pets.\nView our full sizing chart on: /shop"


def _shop_reply(ent: dict, tokens: set[str]) -> str:
    cat = ent.get("categories", [])
    if "twin" in cat or "matching" in tokens or "twin" in tokens:
        return "Coordinated couture for you and your pet in matching fabrics.\nExplore the Twin collection: /twin"
    if "pet" in cat or "dog" in cat or "cat" in cat:
        return "Handcrafted designer apparel and comfortable accessories for pets.\nExplore the Pets collection: /pets"
    if "men" in cat or "women" in cat or "people" in cat:
        return "Handcrafted ethnic and modern designer wear for men and women.\nExplore the People collection: /people"
    return "Browse our luxury collection of artisanal couture and festive wear.\nExplore all products: /shop"


# 45 TRAINED FAQ RESPONSES (SECTIONS A - G)
# ---------------------------------------------------------------------------

TRAINED_FAQS = [
    # A. General website and brand questions
    {
        "id": "A1",
        "patterns": [r"what is zenve", r"what makes (it|zenve) different", r"about zenve fashion", r"why choose zenve", r"difference between zenve and other"],
        "keywords": ["zenve", "different", "brand", "website", "what is zenve"],
        "answer": "Zenve Fashion is India's luxury couture atelier for people and pets together.\nExplore our brand story and collections: /collections",
    },
    {
        "id": "A2",
        "patterns": [r"what types of products can i buy", r"what (products|items) (can i buy|do you sell|are available)", r"what do you sell", r"product categories"],
        "keywords": ["types of products", "can i buy", "what do you sell", "products can i buy"],
        "answer": "Shop ethnic & contemporary wear, handcrafted pet apparel, and Twin sets.\nBrowse our full catalog: /shop",
    },
    {
        "id": "A3",
        "patterns": [r"difference between people,? pets,? and twin", r"what is (the )?difference between people,? pets", r"people vs pets vs twin", r"explain people pets twin"],
        "keywords": ["difference between people", "pets and twin", "people pets twin"],
        "answer": "People has human couture, Pets has pet wear, and Twin coordinates both.\nExplore our Twin collection: /twin",
    },
    {
        "id": "A4",
        "patterns": [r"how (can|do) i explore all (the )?collections", r"explore all collections", r"browse (all )?collections", r"where can i see all collections"],
        "keywords": ["explore all collections", "explore the collections", "browse all collections"],
        "answer": "Use our top navigation bar or filter by collection on our Shop page.\nExplore all collections here: /collections",
    },
    {
        "id": "A5",
        "patterns": [r"does zenve (fashion )?offer designer outfits for both people and pets", r"designer outfits for both people and pets", r"designer (wear|clothes|outfits) for (both )?people and pets"],
        "keywords": ["designer outfits for both", "people and pets", "outfits for both people"],
        "answer": "Yes, our ateliers craft bespoke luxury couture for humans and their pets.\nDiscover outfits for both: /collections",
    },

    # B. Product discovery and shopping
    {
        "id": "B6",
        "patterns": [r"what products are currently available in the people collection", r"products in (the )?people collection", r"people collection (items|products|clothes)", r"show me people collection"],
        "keywords": ["people collection", "products in people", "available in people"],
        "answer": "Handcrafted silk sarees, designer lehengas, kurtas, and modern silhouettes.\nBrowse the People collection: /people",
    },
    {
        "id": "B7",
        "patterns": [r"recommend a stylish outfit for a wedding", r"wedding (outfit|wear|dress|clothes|lehenga)", r"what to wear to a wedding", r"wedding guest outfit"],
        "keywords": ["outfit for a wedding", "wedding outfit", "wedding wear", "wedding clothes"],
        "answer": "Opulent silk lehengas and royal sherwanis in emerald, maroon, and gold.\nExplore wedding couture: /shop",
    },
    {
        "id": "B8",
        "patterns": [r"what should i wear for an evening party", r"evening party (outfit|wear|dress)", r"party wear outfit", r"party wear"],
        "keywords": ["evening party", "party wear", "party outfit", "wear for an evening party"],
        "answer": "Shimmering georgette sarees, velvet evening gowns, and sleek blazers.\nDiscover evening party styles: /shop",
    },
    {
        "id": "B9",
        "patterns": [r"outfits would you recommend for everyday use", r"everyday (use|wear|outfits|clothing)", r"casual (wear|outfits|clothes)", r"daily wear"],
        "keywords": ["everyday use", "everyday wear", "casual wear", "daily wear"],
        "answer": "Breathable pure cotton kurtas, soft linen shirts, and relaxed co-ords.\nBrowse everyday wear: /shop",
    },
    {
        "id": "B10",
        "patterns": [r"festive clothing suitable for indian celebrations", r"festive (clothing|wear|outfits)", r"indian celebrations", r"diwali|eid|puja outfits"],
        "keywords": ["festive clothing", "indian celebrations", "festive wear", "festive outfits"],
        "answer": "Hand-embroidered chanderi kurtas, brocade lehengas, and silk kurtas.\nShop festive collections: /shop",
    },
    {
        "id": "B11",
        "patterns": [r"clothing options are suitable for workwear", r"workwear (options|clothing|outfits)", r"office wear", r"formal (wear|clothing)"],
        "keywords": ["suitable for workwear", "workwear", "office wear", "formal wear"],
        "answer": "Crisp linen shirts, tailored cotton kurtis, and minimalist trousers.\nExplore elegant workwear: /shop",
    },
    {
        "id": "B12",
        "patterns": [r"recommend outfits for a holiday or resort vacation", r"holiday or resort (vacation|outfits)", r"resort wear", r"vacation (outfits|clothes)"],
        "keywords": ["holiday or resort vacation", "resort wear", "vacation outfits", "holiday outfits"],
        "answer": "Breezy printed resort shirts, airy cotton dresses, and flowy kaftans.\nExplore vacation styles: /shop",
    },
    {
        "id": "B13",
        "patterns": [r"clothing suitable for winter or monsoon weather", r"winter or monsoon (weather|clothing)", r"winter (wear|clothes)", r"monsoon (wear|clothes)"],
        "keywords": ["winter or monsoon weather", "winter clothing", "monsoon clothing"],
        "answer": "Plush velvet bandhgalas for winter and quick-dry cottons for monsoon.\nShop seasonal weather wear: /shop",
    },
    {
        "id": "B14",
        "patterns": [r"what accessories are available for pets", r"pet accessories", r"accessories for pets", r"accessories for (my )?(dog|cat)"],
        "keywords": ["accessories are available for pets", "pet accessories", "accessories for pets"],
        "answer": "Handcrafted silk bowties, printed bandanas, festive collars, and leashes.\nView pet accessories: /pets",
    },
    {
        "id": "B15",
        "patterns": [r"stylish outfit for my dog for a special occasion", r"outfit for my dog", r"dog (outfit|clothes|wear)", r"dress (my )?dog"],
        "keywords": ["outfit for my dog", "dog for a special occasion", "dog outfit"],
        "answer": "Embroidered pet sherwanis, festive silk bandanas, and tailored tuxedos.\nDiscover dog occasion wear: /pets",
    },

    # C. Twin fashion and styling recommendations
    {
        "id": "C16",
        "patterns": [r"what is twin fashion,? and how does it work", r"what is twin fashion", r"how does twin fashion work", r"explain twin fashion", r"^twin collection$"],
        "keywords": ["what is twin fashion", "twin fashion", "how does it work", "twin collection"],
        "answer": "Coordinated couture pairing human outfits with matching pet apparel.\nExplore our Twin collection: /twin",
    },
    {
        "id": "C17",
        "patterns": [r"matching outfits for me and my dog", r"matching outfit for (me and my dog|dog and me)", r"twin outfits for dog"],
        "keywords": ["matching outfits for me and my dog", "outfits for me and my dog", "me and my dog"],
        "answer": "Identical fabrics, festive prints, and colors tailored for you and your dog.\nView matching dog sets: /twin",
    },
    {
        "id": "C18",
        "patterns": [r"coordinated outfits for people and cats", r"matching outfits for (people and cats|cat and me)", r"cat twin outfits"],
        "keywords": ["coordinated outfits for people and cats", "people and cats", "outfits for people and cats"],
        "answer": "Lightweight skin-safe bandanas and capes paired with human attire.\nView cat coordinated sets: /twin",
    },
    {
        "id": "C19",
        "patterns": [r"matching outfits for a festive photoshoot", r"festive photoshoot (outfits|twin)", r"photoshoot matching outfits"],
        "keywords": ["matching outfits for a festive photoshoot", "festive photoshoot", "photoshoot outfits"],
        "answer": "Heritage brocade and zari motifs created for picture-perfect memories.\nExplore photoshoot twin sets: /twin",
    },
    {
        "id": "C20",
        "patterns": [r"coordinate my outfit with my pet without looking too similar", r"without looking too similar", r"subtle matching with pet"],
        "keywords": ["without looking too similar", "coordinate my outfit with my pet", "coordinate with my pet"],
        "answer": "Match a pocket square or scarf to your pet's collar instead of full prints.\nExplore Twin collection: /twin",
    },
    {
        "id": "C21",
        "patterns": [r"twin collection would be suitable for a wedding or celebration", r"twin collection for a wedding", r"wedding twin collection"],
        "keywords": ["suitable for a wedding or celebration", "twin collection would be suitable", "wedding or celebration"],
        "answer": "Royal silk sherwanis and lehengas paired with matching pet waistcoats.\nView wedding Twin sets: /twin",
    },

    # D. Product details, sizing, and fit
    {
        "id": "D22",
        "patterns": [r"what material is this product made from", r"what (material|fabric) is (this|the) product made from", r"product fabric|product material"],
        "keywords": ["material is this product made from", "what material is this product", "fabric is this product"],
        "answer": "Crafted from mulberry silk, breathable cotton, chanderi, and velvet.\nView fabric details on products: /shop",
    },
    {
        "id": "D23",
        "patterns": [r"what sizes are available for this outfit", r"sizes available for this outfit", r"available sizes"],
        "keywords": ["sizes are available for this outfit", "sizes are available", "what sizes are available"],
        "answer": "People sizing spans XS through XXL; pet sizing spans XS through XXL.\nCheck size options on: /shop",
    },
    {
        "id": "D24",
        "patterns": [r"does this product come in different colou?rs", r"different colou?rs available", r"colou?r options"],
        "keywords": ["different colours", "different colors", "product come in different"],
        "answer": "Yes, available colourways are displayed as color chips on product cards.\nBrowse all shades on: /shop",
    },
    {
        "id": "D25",
        "patterns": [r"how do i choose the correct size for myself", r"choose the correct size for myself", r"size guide for (me|human|people)"],
        "keywords": ["choose the correct size for myself", "correct size for myself", "size for myself"],
        "answer": "Compare your bust, waist, and hip measurements with our Size Guide.\nView sizing charts on: /shop",
    },
    {
        "id": "D26",
        "patterns": [r"how can i measure my pet before ordering clothes", r"measure my pet", r"pet sizing guide", r"measuring (dog|cat|pet)"],
        "keywords": ["measure my pet before ordering", "measure my pet", "measuring my pet"],
        "answer": "Measure neck girth, chest circumference, and collar-to-tail length.\nCheck pet measurement guide: /pets",
    },
    {
        "id": "D27",
        "patterns": [r"will this pet outfit allow my dog to move comfortably", r"allow my dog to move comfortably", r"dog comfort|comfortable pet clothes"],
        "keywords": ["allow my dog to move comfortably", "move comfortably", "comfortable for my dog"],
        "answer": "Yes, our pet garments feature stretch gussets for full mobility and comfort.\nExplore comfortable pet wear: /pets",
    },
    {
        "id": "D28",
        "patterns": [r"can i see more pictures and details of a product before purchasing", r"more pictures and details", r"product pictures|product photos"],
        "keywords": ["more pictures and details of a product", "more pictures and details", "pictures of a product"],
        "answer": "Every product page features multi-angle high-res zoomable photos.\nInspect product details on: /shop",
    },
    {
        "id": "D29",
        "patterns": [r"does the price change depending on the selected size", r"price change depending on (the selected )?size", r"size price difference"],
        "keywords": ["price change depending on the selected size", "price change depending on", "price change by size"],
        "answer": "Standard ready-to-wear sizes XS to XXL are priced identically.\nView product prices: /shop",
    },

    # E. Prices, discounts, and availability
    {
        "id": "E30",
        "patterns": [r"what is the price of this product", r"product price", r"how much does this cost"],
        "keywords": ["price of this product", "what is the price", "cost of this product"],
        "answer": "Prices in INR (inclusive of all taxes) are clearly marked on each card.\nBrowse product pricing: /shop",
    },
    {
        "id": "E31",
        "patterns": [r"are there any discounts available on this outfit", r"discounts available", r"coupons|promo codes"],
        "keywords": ["discounts available on this outfit", "discounts available", "any discounts available"],
        "answer": "Active seasonal promotional codes are displayed on our top banner.\nShop discounted styles: /shop",
    },
    {
        "id": "E32",
        "patterns": [r"can you show me products within my budget of (inr|rs|₹)?\s*2,?000", r"budget of (inr|rs|₹)?\s*2,?000", r"under 2000"],
        "keywords": ["budget of 2,000", "budget of 2000", "under 2000", "under ₹2,000"],
        "answer": "Discover pet bandanas, bowties, cotton dupattas, and accessories under ₹2,000.\nFilter budget products: /shop",
    },
    {
        "id": "E33",
        "patterns": [r"which products are currently in stock", r"currently in stock", r"in stock products"],
        "keywords": ["products are currently in stock", "currently in stock", "in stock"],
        "answer": "All items with an active 'Add to Cart' button are in stock for fast dispatch.\nView in-stock collection: /shop",
    },
    {
        "id": "E34",
        "patterns": [r"can i find similar products at a lower price", r"similar products at a lower price", r"cheaper alternative"],
        "keywords": ["similar products at a lower price", "similar products lower price", "lower price"],
        "answer": "Check 'Similar Styles' on any item, or sort our shop by Price: Low to High.\nBrowse affordable pieces: /shop",
    },
    {
        "id": "E35",
        "patterns": [r"how can i sort products by price or ratings", r"sort products by price or ratings", r"sort by price|sort by rating"],
        "keywords": ["sort products by price or ratings", "sort products by price", "sort by price"],
        "answer": "Use the 'Sort By' dropdown on the top-right of our Shop to order products.\nSort collection here: /shop",
    },

    # F. Cart, wishlist, checkout, and orders
    {
        "id": "F36",
        "patterns": [r"how do i add a product to my shopping cart", r"add (a )?product to (my )?shopping cart", r"add to cart"],
        "keywords": ["add a product to my shopping cart", "add to my shopping cart", "add to shopping cart"],
        "answer": "Select size and color on any product page, then tap 'Add to Cart'.\nView your shopping bag: /cart",
    },
    {
        "id": "F37",
        "patterns": [r"can i save products to my wishlist and purchase them later", r"save products to my wishlist", r"wishlist"],
        "keywords": ["save products to my wishlist", "save to wishlist", "wishlist and purchase"],
        "answer": "Tap the heart icon on any product to save it to your personal wishlist.\nAccess your wishlist: /wishlist",
    },
    {
        "id": "F38",
        "patterns": [r"how can i buy a product after selecting its colou?r and size", r"buy a product after selecting", r"how can i buy"],
        "keywords": ["buy a product after selecting its colour and size", "buy a product after selecting", "buy a product"],
        "answer": "Select color and size, click Add to Cart, then Proceed to Checkout.\nGo to checkout: /cart",
    },
    {
        "id": "F39",
        "patterns": [r"what payment methods are supported at checkout", r"payment methods (are )?supported", r"payment options"],
        "keywords": ["payment methods are supported at checkout", "payment methods are supported", "payment methods supported"],
        "answer": "We accept UPI (GPay, PhonePe), Cards (Visa, Mastercard), and Net Banking.\nProceed to checkout: /cart",
    },
    {
        "id": "F40",
        "patterns": [r"how can i check the status of my order", r"status of my order", r"track (my )?order"],
        "keywords": ["check the status of my order", "status of my order", "track my order"],
        "answer": "Log into your account and open 'My Orders' for live tracking updates.\nTrack your orders here: /account/orders",
    },
    {
        "id": "F41",
        "patterns": [r"where can i view my previous orders", r"view my previous orders", r"past orders|order history"],
        "keywords": ["view my previous orders", "view previous orders", "previous orders"],
        "answer": "Access your complete purchase history and receipts under My Orders.\nView order history: /account/orders",
    },

    # G. Shipping, returns, and website assistance
    {
        "id": "G42",
        "patterns": [r"do you offer free shipping across india", r"free shipping across india", r"free shipping"],
        "keywords": ["free shipping across india", "offer free shipping", "free shipping"],
        "answer": "Yes, complimentary standard shipping is provided across India.\nCheck shipping policy: /shipping",
    },
    {
        "id": "G43",
        "patterns": [r"how long will it take for my order to arrive", r"how long will it take for my order", r"delivery time|shipping time"],
        "keywords": ["long will it take for my order to arrive", "take for my order to arrive", "order to arrive"],
        "answer": "Standard delivery arrives in 3 to 7 days, and fast delivery in 48 to 72 hours.\nView delivery details: /shipping",
    },
    {
        "id": "G44",
        "patterns": [r"can i exchange an outfit if the size does not fit", r"exchange an outfit if the size does not fit", r"exchange|return policy"],
        "keywords": ["exchange an outfit if the size does not fit", "exchange an outfit", "size does not fit"],
        "answer": "Hassle-free 7-day size exchanges are available in original tag condition.\nView exchange policy: /refund",
    },
    {
        "id": "G45",
        "patterns": [r"what should i do if my order arrives damaged or i need help with a purchase", r"order arrives damaged", r"need help with a purchase", r"damaged order"],
        "keywords": ["order arrives damaged or i need help", "order arrives damaged", "damaged or i need help"],
        "answer": "Contact our care team with your Order ID for a prompt priority replacement.\nContact support here: /contact",
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
    "farewell": ["It was a pleasure styling with you. Come back anytime!\nExplore our latest arrivals: /shop"],
    "thanks": ["You are most welcome! Happy to assist you.\nBrowse our collections here: /shop"],
    "how_are_you": ["I am wonderful, thank you! Ready to help you discover beautiful couture.\nExplore our collections: /shop"],
    "identity": ["I am Zenve Atelier's personal styling concierge.\nDiscover our designer collections: /shop"],
    "capabilities": ["I can assist with styling, sizing, fabrics, and finding matching outfits.\nBrowse all products: /shop"],
    "about": ["Zenve Fashion is India's luxury atelier for people and pets together.\nExplore our collections: /collections"],
    "pets": ["Handcrafted designer apparel and comfortable accessories for pets.\nExplore the Pets collection: /pets"],
    "twin": ["Coordinated couture for you and your pet in matching fabrics.\nExplore our Twin collection: /twin"],
    "shipping": ["Complimentary standard delivery across India within 3 to 7 days.\nCheck our shipping details: /shipping"],
    "returns": ["Hassle-free 7-day size exchanges on all unworn items.\nReview our return policy: /refund"],
    "payment": ["We accept all major UPI, Credit/Debit Cards, and Net Banking.\nProceed to checkout: /cart"],
    "contact": ["Our concierge and support team are delighted to help you.\nReach our team here: /contact"],
    "order": ["Track live courier milestones and order history anytime.\nView your orders: /account/orders"],
    "compliment": ["Thank you! It is an absolute pleasure styling for you.\nExplore our newest looks: /shop"],
    "negative": ["Apologies for any inconvenience. Please let us know how we can help.\nContact our support team: /contact"],
    "deny": ["No problem at all! Feel free to ask anytime.\nBrowse our collections: /shop"],
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
        return enforce_line_limit(trained_ans, max_lines=3, min_lines=2)

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
            return enforce_line_limit(reply, max_lines=3, min_lines=2)
        for k, v in ctx.items():
            ent.setdefault(k, v)

    if not scores:
        return enforce_line_limit(random.choice(FALLBACKS), max_lines=3, min_lines=2)

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

    return enforce_line_limit(reply, max_lines=3, min_lines=2)