import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, ChevronDown, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  isError?: boolean;
}

interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

function formatTimestamp(): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-start">
    <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-[#003524]/80 border border-[#E4BD5A]/20 shadow-[0_2px_10px_rgba(0,0,0,0.2)] flex items-center space-x-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#E4BD5A]/70"
          style={{ animation: `zenve-bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  </div>
);

const QUICK_SUGGESTIONS = [
  'Twin Collection',
  'Size & Fitting',
  'Colour Advice',
  'Occasion Styling',
  'Order & Delivery',
  'Pet Outfits',
];

const OUT_OF_DOMAIN_REPLY =
  'I can only assist with fashion, styling, and Zenve collections.\nPlease ask me about our luxury outfits, collections, or sizing advice.';

const SUPPORT_TEAM_REPLY =
  'Please contact our Support Team for further assistance.\nPhone: +91 98765 43210 | Email: support@zenvefashion.com';

const NON_FASHION_PATTERNS = [
  /\b(python|javascript|typescript|java|c\+\+|c#|golang|rust|php|ruby|swift|kotlin|html|css|sql|nosql|mongodb|react|vue|angular|svelte|nextjs|django|flask|fastapi|spring|node|nodejs|express|docker|kubernetes|linux|ubuntu|windows|bash|shell|powershell|git|github|gitlab)\b/i,
  /\b(code|coding|programmer|programming|software|developer|develop|development|algorithm|data structure|function|variable|debug|debugging|bug|bugs|script|scripting|compile|compiler|database|server|backend|frontend|api|rest api|endpoint|sdk|terminal|ide|npm|pip)\b/i,
  /\b(solve|calculate|calculation|calculator|math|maths|mathematics|equation|formula|arithmetic|algebra|geometry|calculus|trigonometry|derivative|integral|multiplication|percentage of|sum of|square root)\b/i,
  /\d+\s*[\+\-\*\/%^=]\s*\d+/,
  /\b(physics|chemistry|biology|chemical|chemicals|synthesize|synthesized|petroleum|quantum|gravity|atom|molecule|periodic table|photosynthesis|dna|rna|cellular|relativity|thermodynamics|newton|einstein|planet|planets|solar system|galaxy|universe|black hole|astronomy|telescope|mars|moon|nasa|isro)\b/i,
  /\b(symptom|symptoms|disease|illness|infection|virus|bacteria|diagnos|diagnosis|medicine for|cure for|fever|cough|headache|cancer|diabetes|hospital|prescription)\b/i,
  /\b(president|prime minister|chief minister|parliament|congress|bjp|democrat|republican|senate|senator|election|elections|vote|voting|ballot|political|politics|politician|constitution|democracy|treaty|united nations|war|military|army|naval|air force|missile)\b/i,
  /\b(cricket|football|soccer|fifa|ipl|tennis|basketball|nba|badminton|olympics|world cup|messi|ronaldo|virat|kohli|dhoni|sachin|goal|wicket|tournament|match score)\b/i,
  /\b(recipe|recipes|how to cook|ingredients|bake|baking|biryani|curry|pasta|pizza|burger|sandwich|soup|salad|dessert|roast|culinary|chef)\b/i,
  /\b(story|stories|poem|poems|poetry|essay|essays|riddle|riddles|lyrics|article|movie|movies|film|films|cinema|actor|actress|hollywood|bollywood|netflix|series|episode|anime|manga|singer|music track|album|game|gaming|playstation|xbox|minecraft)\b/i,
  /\b(cryptocurrency|crypto|bitcoin|ethereum|btc|eth|stocks|stock market|shares|mutual fund|forex|investing|investment|trading|loan|mortgage|interest rate|fixed deposit|bank account)\b/i,
  /\b(capital of|population of|distance (from|to|between)|speed of light|weather in|temperature in|forecast for|who (invented|discovered|wrote|directed|created|painted|founded))\b/i,
];

const TRAINED_FAQS: { patterns: RegExp[]; keywords: string[]; answer: string }[] = [
  {
    patterns: [/what is zenve/i, /what makes (it|zenve) different/i, /about zenve fashion/i, /why choose zenve/i, /difference between zenve and other/i],
    keywords: ['zenve', 'different', 'brand', 'website', 'what is zenve'],
    answer: "Zenve Fashion is India's luxury couture atelier for people and pets together.\nExplore our brand story and collections: /collections",
  },
  {
    patterns: [/what types of products can i buy/i, /what (products|items) (can i buy|do you sell|are available)/i, /what do you sell/i, /product categories/i],
    keywords: ['types of products', 'can i buy', 'what do you sell', 'products can i buy'],
    answer: 'Shop ethnic & contemporary wear, handcrafted pet apparel, and Twin sets.\nBrowse our full catalog: /shop',
  },
  {
    patterns: [/difference between people,? pets,? and twin/i, /what is (the )?difference between people,? pets/i, /people vs pets vs twin/i, /explain people pets twin/i],
    keywords: ['difference between people', 'pets and twin', 'people pets twin'],
    answer: 'People has human couture, Pets has pet wear, and Twin coordinates both.\nExplore our Twin collection: /twin',
  },
  {
    patterns: [/how (can|do) i explore all (the )?collections/i, /explore all collections/i, /browse (all )?collections/i, /where can i see all collections/i],
    keywords: ['explore all collections', 'explore the collections', 'browse all collections'],
    answer: 'Use our top navigation bar or filter by collection on our Shop page.\nExplore all collections here: /collections',
  },
  {
    patterns: [/does zenve (fashion )?offer designer outfits for both people and pets/i, /designer outfits for both people and pets/i, /designer (wear|clothes|outfits) for (both )?people and pets/i],
    keywords: ['designer outfits for both', 'people and pets', 'outfits for both people'],
    answer: 'Yes, our ateliers craft bespoke luxury couture for humans and their pets.\nDiscover outfits for both: /collections',
  },
  {
    patterns: [/what products are currently available in the people collection/i, /products in (the )?people collection/i, /people collection (items|products|clothes)/i, /show me people collection/i],
    keywords: ['people collection', 'products in people', 'available in people'],
    answer: 'Handcrafted silk sarees, designer lehengas, kurtas, and modern silhouettes.\nBrowse the People collection: /people',
  },
  {
    patterns: [/recommend a stylish outfit for a wedding/i, /wedding (outfit|wear|dress|clothes|lehenga)/i, /what to wear to a wedding/i, /wedding guest outfit/i],
    keywords: ['outfit for a wedding', 'wedding outfit', 'wedding wear', 'wedding clothes'],
    answer: 'Opulent silk lehengas and royal sherwanis in emerald, maroon, and gold.\nExplore wedding couture: /shop?occasion=Wedding',
  },
  {
    patterns: [/what should i wear for an evening party/i, /evening party (outfit|wear|dress)/i, /party wear outfit/i, /party wear/i],
    keywords: ['evening party', 'party wear', 'party outfit', 'wear for an evening party'],
    answer: 'Shimmering georgette sarees, velvet evening gowns, and sleek blazers.\nDiscover party styles: /shop?occasion=Party',
  },
  {
    patterns: [/outfits would you recommend for everyday use/i, /everyday (use|wear|outfits|clothing)/i, /casual (wear|outfits|clothes)/i, /daily wear/i],
    keywords: ['everyday use', 'everyday wear', 'casual wear', 'daily wear'],
    answer: 'Breathable pure cotton kurtas, soft linen shirts, and relaxed co-ords.\nBrowse everyday wear: /shop?occasion=Everyday',
  },
  {
    patterns: [/festive clothing suitable for indian celebrations/i, /festive (clothing|wear|outfits)/i, /indian celebrations/i, /diwali|eid|puja outfits/i],
    keywords: ['festive clothing', 'indian celebrations', 'festive wear', 'festive outfits'],
    answer: 'Hand-embroidered chanderi kurtas, brocade lehengas, and silk kurtas.\nShop festive collection: /shop?occasion=Festive',
  },
  {
    patterns: [/clothing options are suitable for workwear/i, /workwear (options|clothing|outfits)/i, /office wear/i, /formal (wear|clothing)/i],
    keywords: ['suitable for workwear', 'workwear', 'office wear', 'formal wear'],
    answer: 'Crisp linen shirts, tailored cotton kurtis, and minimalist trousers.\nExplore workwear: /shop?occasion=Workwear',
  },
  {
    patterns: [/recommend outfits for a holiday or resort vacation/i, /holiday or resort (vacation|outfits)/i, /resort wear/i, /vacation (outfits|clothes)/i],
    keywords: ['holiday or resort vacation', 'resort wear', 'vacation outfits', 'holiday outfits'],
    answer: 'Breezy printed resort shirts, airy cotton dresses, and flowy kaftans.\nExplore vacation styles: /shop?occasion=Resort',
  },
  {
    patterns: [/clothing suitable for winter or monsoon weather/i, /winter or monsoon (weather|clothing)/i, /winter (wear|clothes)/i, /monsoon (wear|clothes)/i],
    keywords: ['winter or monsoon weather', 'winter clothing', 'monsoon clothing'],
    answer: 'Plush velvet bandhgalas for winter and quick-dry cottons for monsoon.\nShop winter styles: /shop?occasion=Winter',
  },
  {
    patterns: [/what accessories are available for pets/i, /pet accessories/i, /accessories for pets/i, /accessories for (my )?(dog|cat)/i],
    keywords: ['accessories are available for pets', 'pet accessories', 'accessories for pets'],
    answer: 'Handcrafted silk bowties, printed bandanas, festive collars, and leashes.\nView pet accessories: /pets?occasion=Accessories',
  },
  {
    patterns: [/stylish outfit for my dog for a special occasion/i, /outfit for my dog/i, /dog (outfit|clothes|wear)/i, /dress (my )?dog/i],
    keywords: ['outfit for my dog', 'dog for a special occasion', 'dog outfit'],
    answer: 'Embroidered pet sherwanis, festive silk bandanas, and tailored tuxedos.\nDiscover dog wedding wear: /pets?occasion=Wedding',
  },
  {
    patterns: [/what is twin fashion,? and how does it work/i, /what is twin fashion/i, /how does twin fashion work/i, /explain twin fashion/i, /^twin collection$/i, /twin collections?/i],
    keywords: ['what is twin fashion', 'twin fashion', 'how does it work', 'twin collection'],
    answer: 'Coordinated couture pairing human outfits with matching pet apparel.\nExplore our Twin collection: /twin',
  },
  {
    patterns: [/matching outfits for me and my dog/i, /matching outfit for (me and my dog|dog and me)/i, /twin outfits for dog/i],
    keywords: ['matching outfits for me and my dog', 'outfits for me and my dog', 'me and my dog'],
    answer: 'Identical fabrics, festive prints, and colors tailored for you and your dog.\nView matching dog sets: /twin',
  },
  {
    patterns: [/coordinated outfits for people and cats/i, /matching outfits for (people and cats|cat and me)/i, /cat twin outfits/i],
    keywords: ['coordinated outfits for people and cats', 'people and cats', 'outfits for people and cats'],
    answer: 'Lightweight skin-safe bandanas and capes paired with human attire.\nView cat coordinated sets: /twin',
  },
  {
    patterns: [/matching outfits for a festive photoshoot/i, /festive photoshoot (outfits|twin)/i, /photoshoot matching outfits/i],
    keywords: ['matching outfits for a festive photoshoot', 'festive photoshoot', 'photoshoot outfits'],
    answer: 'Heritage brocade and zari motifs created for picture-perfect memories.\nExplore photoshoot twin sets: /twin',
  },
  {
    patterns: [/coordinate my outfit with my pet without looking too similar/i, /without looking too similar/i, /subtle matching with pet/i],
    keywords: ['without looking too similar', 'coordinate my outfit with my pet', 'coordinate with my pet'],
    answer: "Match a pocket square or scarf to your pet's collar instead of full prints.\nExplore Twin collection: /twin",
  },
  {
    patterns: [/twin collection would be suitable for a wedding or celebration/i, /twin collection for a wedding/i, /wedding twin collection/i],
    keywords: ['suitable for a wedding or celebration', 'twin collection would be suitable', 'wedding or celebration'],
    answer: 'Royal silk sherwanis and lehengas paired with matching pet waistcoats.\nView wedding Twin sets: /twin?occasion=Wedding',
  },
  {
    patterns: [/what material is this product made from/i, /what (material|fabric) is (this|the) product made from/i, /product fabric|product material/i],
    keywords: ['material is this product made from', 'what material is this product', 'fabric is this product'],
    answer: 'Crafted from mulberry silk, breathable cotton, chanderi, and velvet.\nView fabric details on products: /shop',
  },
  {
    patterns: [/what sizes are available for this outfit/i, /sizes available for this outfit/i, /available sizes/i],
    keywords: ['sizes are available for this outfit', 'sizes are available', 'what sizes are available'],
    answer: 'People sizing spans XS through XXL; pet sizing spans XS through XXL.\nView our full sizing guide: /size-guide',
  },
  {
    patterns: [/does this product come in different colou?rs/i, /different colou?rs available/i, /colou?r options/i],
    keywords: ['different colours', 'different colors', 'product come in different'],
    answer: 'Yes, available colourways are displayed as color chips on product cards.\nBrowse all shades on: /shop',
  },
  {
    patterns: [/how do i choose the correct size for myself/i, /choose the correct size for myself/i, /size guide for (me|human|people)/i],
    keywords: ['choose the correct size for myself', 'correct size for myself', 'size for myself'],
    answer: 'Compare your bust, waist, and hip measurements with our Size Guide.\nView our complete sizing guide: /size-guide',
  },
  {
    patterns: [/how can i measure my pet before ordering clothes/i, /measure my pet/i, /pet sizing guide/i, /measuring (dog|cat|pet)/i],
    keywords: ['measure my pet before ordering', 'measure my pet', 'measuring my pet'],
    answer: 'Measure neck girth, chest circumference, and collar-to-tail length.\nCheck pet measurement guide: /size-guide',
  },
  {
    patterns: [/will this pet outfit allow my dog to move comfortably/i, /allow my dog to move comfortably/i, /dog comfort|comfortable pet clothes/i],
    keywords: ['allow my dog to move comfortably', 'move comfortably', 'comfortable for my dog'],
    answer: 'Yes, our pet garments feature stretch gussets for full mobility and comfort.\nExplore comfortable pet wear: /pets',
  },
  {
    patterns: [/can i see more pictures and details of a product before purchasing/i, /more pictures and details/i, /product pictures|product photos/i],
    keywords: ['more pictures and details of a product', 'more pictures and details', 'pictures of a product'],
    answer: 'Every product page features multi-angle high-res zoomable photos.\nInspect product details on: /shop',
  },
  {
    patterns: [/does the price change depending on the selected size/i, /price change depending on (the selected )?size/i, /size price difference/i],
    keywords: ['price change depending on the selected size', 'price change depending on', 'price change by size'],
    answer: 'Standard ready-to-wear sizes XS to XXL are priced identically.\nView product prices: /shop',
  },
  {
    patterns: [/what is the price of this product/i, /product price/i, /how much does this cost/i],
    keywords: ['price of this product', 'what is the price', 'cost of this product'],
    answer: 'Prices in INR (inclusive of all taxes) are clearly marked on each card.\nBrowse product pricing: /shop',
  },
  {
    patterns: [/are there any discounts available on this outfit/i, /discounts available/i, /coupons|promo codes/i],
    keywords: ['discounts available on this outfit', 'discounts available', 'any discounts available'],
    answer: 'Active seasonal promotional codes are displayed on our top banner.\nShop discounted styles: /shop',
  },
  {
    patterns: [/can you show me products within my budget of (inr|rs|₹)?\s*2,?000/i, /budget of (inr|rs|₹)?\s*2,?000/i, /under 2000/i],
    keywords: ['budget of 2,000', 'budget of 2000', 'under 2000', 'under ₹2,000'],
    answer: 'Discover pet bandanas, bowties, cotton dupattas, and accessories under ₹2,000.\nFilter budget products: /shop',
  },
  {
    patterns: [/which products are currently in stock/i, /currently in stock/i, /in stock products/i],
    keywords: ['products are currently in stock', 'currently in stock', 'in stock'],
    answer: "All items with an active 'Add to Cart' button are in stock for fast dispatch.\nView in-stock collection: /shop",
  },
  {
    patterns: [/can i find similar products at a lower price/i, /similar products at a lower price/i, /cheaper alternative/i],
    keywords: ['similar products at a lower price', 'similar products lower price', 'lower price'],
    answer: "Check 'Similar Styles' on any item, or sort our shop by Price: Low to High.\nBrowse affordable pieces: /shop",
  },
  {
    patterns: [/how can i sort products by price or ratings/i, /sort products by price or ratings/i, /sort by price|sort by rating/i],
    keywords: ['sort products by price or ratings', 'sort products by price', 'sort by price'],
    answer: "Use the 'Sort By' dropdown on the top-right of our Shop to order products.\nSort collection here: /shop",
  },
  {
    patterns: [/how do i add a product to my shopping cart/i, /add (a )?product to (my )?shopping cart/i, /add to cart/i],
    keywords: ['add a product to my shopping cart', 'add to my shopping cart', 'add to shopping cart'],
    answer: "Select size and color on any product page, then tap 'Add to Cart'.\nView your shopping bag: /cart",
  },
  {
    patterns: [/can i save products to my wishlist and purchase them later/i, /save products to my wishlist/i, /wishlist/i],
    keywords: ['save products to my wishlist', 'save to wishlist', 'wishlist and purchase'],
    answer: 'Tap the heart icon on any product to save it to your personal wishlist.\nAccess your wishlist: /wishlist',
  },
  {
    patterns: [/how can i buy a product after selecting its colou?r and size/i, /buy a product after selecting/i, /how can i buy/i],
    keywords: ['buy a product after selecting its colour and size', 'buy a product after selecting', 'buy a product'],
    answer: 'Select color and size, click Add to Cart, then Proceed to Checkout.\nGo to checkout: /cart',
  },
  {
    patterns: [/what payment methods are supported at checkout/i, /payment methods (are )?supported/i, /payment options/i],
    keywords: ['payment methods are supported at checkout', 'payment methods are supported', 'payment methods supported'],
    answer: 'We accept UPI (GPay, PhonePe), Cards (Visa, Mastercard), and Net Banking.\nProceed to checkout: /cart',
  },
  {
    patterns: [/how can i check the status of my order/i, /status of my order/i, /track (my )?order/i],
    keywords: ['check the status of my order', 'status of my order', 'track my order'],
    answer: "Log into your account and open 'My Orders' for live tracking updates.\nTrack your orders here: /account/orders",
  },
  {
    patterns: [/where can i view my previous orders/i, /view my previous orders/i, /past orders|order history/i],
    keywords: ['view my previous orders', 'view previous orders', 'previous orders'],
    answer: 'Access your complete purchase history and receipts under My Orders.\nView order history: /account/orders',
  },
  {
    patterns: [/do you offer free shipping across india/i, /free shipping across india/i, /free shipping/i],
    keywords: ['free shipping across india', 'offer free shipping', 'free shipping'],
    answer: 'Yes, complimentary standard shipping is provided across India.\nCheck shipping policy: /shipping',
  },
  {
    patterns: [/how long will it take for my order to arrive/i, /how long will it take for my order/i, /delivery time|shipping time/i],
    keywords: ['long will it take for my order to arrive', 'take for my order to arrive', 'order to arrive'],
    answer: 'Standard delivery arrives in 3 to 7 days, and fast delivery in 48 to 72 hours.\nView delivery details: /shipping',
  },
  {
    patterns: [/can i exchange an outfit if the size does not fit/i, /exchange an outfit if the size does not fit/i, /exchange|return policy/i],
    keywords: ['exchange an outfit if the size does not fit', 'exchange an outfit', 'size does not fit'],
    answer: 'Hassle-free 7-day size exchanges are available in original tag condition.\nView exchange policy: /refund',
  },
  {
    patterns: [/what should i do if my order arrives damaged or i need help with a purchase/i, /order arrives damaged/i, /need help with a purchase/i, /damaged order/i],
    keywords: ['order arrives damaged or i need help', 'order arrives damaged', 'damaged or i need help'],
    answer: 'Contact our care team with your Order ID for a prompt priority replacement.\nContact support here: /contact',
  },
];

function getOfflineFallbackReply(message: string, history: HistoryEntry[]): string {
  const priorUserQuestions = history.filter((h) => h.role === 'user').length;
  if (priorUserQuestions >= 2) {
    return SUPPORT_TEAM_REPLY;
  }

  const q = message.toLowerCase().trim();
  const cleanQ = q.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  for (const faq of TRAINED_FAQS) {
    if (faq.patterns.some((p) => p.test(cleanQ))) {
      return faq.answer;
    }
  }

  let bestFaq: { answer: string } | null = null;
  let bestScore = 0;
  for (const faq of TRAINED_FAQS) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (cleanQ.includes(kw)) {
        score += kw.split(' ').length * 3;
      }
    }
    if (score > bestScore && score >= 4) {
      bestScore = score;
      bestFaq = faq;
    }
  }
  if (bestFaq) {
    return bestFaq.answer;
  }

  if (NON_FASHION_PATTERNS.some((pat) => pat.test(q))) {
    return OUT_OF_DOMAIN_REPLY;
  }

  if (/\b(twin|matching|match my pet|coordinated)\b/.test(cleanQ)) {
    if (/\bwedding\b/.test(cleanQ)) {
      return 'Royal silk sherwanis and lehengas paired with matching pet waistcoats.\nView wedding Twin sets: /twin?occasion=Wedding';
    }
    return 'Coordinated couture pairing human outfits with matching pet apparel.\nExplore our Twin collection: /twin';
  }
  if (/\b(pet|pets|dog|cat|puppy|kitten|collar|leash|bandana)\b/.test(cleanQ)) {
    if (/\b(accessor|collar|leash|bandana|bowtie)\b/.test(cleanQ)) {
      return 'Handcrafted silk bowties, printed bandanas, festive collars, and leashes.\nView pet accessories: /pets?occasion=Accessories';
    }
    return 'Handcrafted designer apparel and comfortable accessories for pets.\nExplore the Pets collection: /pets';
  }
  if (/\b(size|sizing|fit|fitting|measurement|measure|chart)\b/.test(cleanQ)) {
    return 'Comprehensive measurement charts for human couture and companion pets.\nView our complete sizing guide: /size-guide';
  }
  if (/\b(colou?r|palette|shade|maroon|emerald|gold|ivory|blue|red|pink|green|yellow|black|white)\b/.test(cleanQ)) {
    return 'Warm tones glow in mustard and rust, while cool tones shine in emerald and sapphire.\nExplore curated color edits: /showroom';
  }
  if (/\b(wedding|marriage|shaadi|reception|haldi|mehendi|sangeet)\b/.test(cleanQ)) {
    return 'Opulent silk lehengas and royal sherwanis in emerald, maroon, and gold.\nExplore wedding couture: /shop?occasion=Wedding';
  }
  if (/\b(party|cocktail|evening)\b/.test(cleanQ)) {
    return 'Shimmering georgette sarees, velvet evening gowns, and sleek blazers.\nDiscover party styles: /shop?occasion=Party';
  }
  if (/\b(festiv|diwali|navratri|eid|puja|pooja)\b/.test(cleanQ)) {
    return 'Hand-embroidered chanderi kurtas, brocade lehengas, and silk kurtas.\nShop festive collection: /shop?occasion=Festive';
  }
  if (/\b(occasion|styling|wear|outfit|dress|showroom)\b/.test(cleanQ)) {
    return 'Discover couture edits for weddings, festive galas, and evening soirées.\nExplore our occasion showroom: /showroom';
  }
  if (/\b(fabric|silk|cotton|linen|chanderi|georgette|velvet|wash|care)\b/.test(cleanQ)) {
    return 'We handcraft our couture in pure silk, breathable cotton, and chanderi.\nBrowse by fabric here: /shop';
  }
  if (/\b(order|delivery|shipping|ship|track|tracking|dispatch|arrive)\b/.test(cleanQ)) {
    return 'Track live package milestones, or review our express delivery timelines.\nTrack orders: /account/orders | Shipping policy: /shipping';
  }
  if (/\b(return|refund|exchange)\b/.test(cleanQ)) {
    return 'Hassle-free 7-day size exchanges are available in original tag condition.\nView exchange policy: /refund';
  }
  if (/\b(people|men|women|saree|lehenga|kurta|sherwani)\b/.test(cleanQ)) {
    return 'Handcrafted silk sarees, designer lehengas, kurtas, and modern silhouettes.\nBrowse the People collection: /people';
  }
  if (/\b(collection|collections|explore|browse|shop|product|products|buy)\b/.test(cleanQ)) {
    return 'Use our top navigation bar or filter by collection on our Shop page.\nExplore all collections here: /collections';
  }
  if (/\b(hi|hello|hey|namaste|good morning|good afternoon|good evening|thanks|thank)\b/.test(cleanQ)) {
    return 'Welcome to Zenve Atelier! I am your personal couture stylist and concierge.\nExplore our luxury collections: /collections';
  }
  if (/\b(contact|support|help|phone|email)\b/.test(cleanQ)) {
    return 'Our concierge and support team are delighted to help you.\nReach our team here: /contact';
  }

  return OUT_OF_DOMAIN_REPLY;
}

function extractPageUrls(text: string): { path: string; label: string }[] {
  const regex = /(\/(?:twin|people|pets|shop|collections|cart|wishlist|account\/orders|contact|shipping|refund|size-guide|showroom)[a-zA-Z0-9_\-\/?=]*)/gi;
  const matches = Array.from(text.matchAll(regex));
  if (!matches.length) return [];
  
  const results: { path: string; label: string }[] = [];
  const seen = new Set<string>();

  for (const m of matches) {
    const path = m[1];
    if (seen.has(path)) continue;
    seen.add(path);

    let label = 'View Products';
    if (path.startsWith('/twin')) {
      label = path.includes('occasion=Wedding') ? 'View Wedding Twin Sets' : 'View Twin Collection';
    } else if (path.startsWith('/people')) {
      label = 'View People Collection';
    } else if (path.startsWith('/pets')) {
      label = path.includes('Accessories') ? 'View Pet Accessories' : 'View Pets Collection';
    } else if (path.startsWith('/size-guide')) {
      label = 'View Size Guide';
    } else if (path.startsWith('/showroom')) {
      label = 'View Styling Showroom';
    } else if (path.startsWith('/shop')) {
      if (path.includes('Wedding')) label = 'View Wedding Outfits';
      else if (path.includes('Party')) label = 'View Party Outfits';
      else if (path.includes('Festive')) label = 'View Festive Outfits';
      else if (path.includes('Everyday')) label = 'View Everyday Wear';
      else if (path.includes('Workwear')) label = 'View Workwear';
      else if (path.includes('Resort')) label = 'View Vacation Looks';
      else if (path.includes('Winter')) label = 'View Winter Styles';
      else label = 'Explore Shop';
    } else if (path.startsWith('/cart')) {
      label = 'View Shopping Bag';
    } else if (path.startsWith('/wishlist')) {
      label = 'View Wishlist';
    } else if (path.startsWith('/account/orders')) {
      label = 'Track My Orders';
    } else if (path.startsWith('/contact')) {
      label = 'Contact Concierge';
    } else if (path.startsWith('/shipping')) {
      label = 'Shipping Details';
    } else if (path.startsWith('/refund')) {
      label = 'Return Policy';
    } else if (path.startsWith('/collections')) {
      label = 'Explore Collections';
    }

    results.push({ path, label });
  }
  return results;
}

export const ChatbotWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Greetings and welcome to Zenve Atelier. I am your personal couture stylist and fashion concierge — here to guide you through our handcrafted collections.',
      timestamp: formatTimestamp(),
    },
    {
      id: 'welcome-2',
      sender: 'bot',
      text: 'Whether you seek styling advice, fabric guidance, sizing help, or wish to explore our signature twin collections — I am at your service.',
      timestamp: formatTimestamp(),
    },
  ]);

  const conversationHistory = useRef<HistoryEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen && !isTyping) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: formatTimestamp(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const historySnapshot = conversationHistory.current.slice(-10);
    conversationHistory.current = [...historySnapshot, { role: 'user', content: trimmed }];

    try {
      const response = await apiClient.post('/chatbot/chat/', {
        message: trimmed,
        history: historySnapshot,
      });

      const replyText: string =
        response.data?.reply ||
        'Thank you for your message. Our styling team will be in touch with personalised guidance shortly.';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: formatTimestamp(),
        },
      ]);

      conversationHistory.current = [
        ...conversationHistory.current,
        { role: 'assistant' as const, content: replyText },
      ].slice(-10);
    } catch {
      const fallbackReply = getOfflineFallbackReply(trimmed, historySnapshot);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: fallbackReply,
          timestamp: formatTimestamp(),
        },
      ]);

      conversationHistory.current = [
        ...conversationHistory.current,
        { role: 'assistant' as const, content: fallbackReply },
      ].slice(-10);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isTyping]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (text: string) => sendMessage(text);

  const handleClearChat = () => {
    conversationHistory.current = [];
    setMessages([{
      id: `welcome-reset-${Date.now()}`,
      sender: 'bot',
      text: 'Our conversation has been refreshed. How may I assist you today?',
      timestamp: formatTimestamp(),
    }]);
  };

  return (
    <>
      <style>{`
        @keyframes zenve-bounce {
          0%,60%,100%{transform:translateY(0);opacity:0.5}
          30%{transform:translateY(-5px);opacity:1}
        }
        @keyframes zenve-slide-up {
          from{opacity:0;transform:translateY(20px) scale(0.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes zenve-fade-in {
          from{opacity:0;transform:translateX(8px)}
          to{opacity:1;transform:translateX(0)}
        }
        .zenve-chat-window{animation:zenve-slide-up 0.3s cubic-bezier(0.16,1,0.3,1) both}
        .zenve-teaser{animation:zenve-fade-in 0.4s ease both}
        .zenve-msg-appear{animation:zenve-fade-in 0.25s ease both}
      `}</style>

      <aside aria-label="Zenve Atelier Concierge" className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
        {isOpen && (
          <section
            id="zenve-chat-window"
            role="region"
            aria-label="Atelier Concierge Chat Window"
            aria-live="polite"
            className="zenve-chat-window mb-4 w-[92vw] max-w-[370px] sm:w-[390px] h-[550px] max-h-[82vh] flex flex-col rounded-2xl bg-gradient-to-b from-[#002B1D] via-[#001F15] to-[#00140D] border border-[#E4BD5A]/35 shadow-[0_15px_45px_rgba(0,0,0,0.7),0_0_30px_rgba(228,189,90,0.15)] backdrop-blur-xl overflow-hidden"
          >
            {/* HEADER */}
            <div className="relative p-4 sm:p-5 border-b border-[#E4BD5A]/25 bg-gradient-to-r from-[#073B2A] to-[#002217] flex items-center justify-between flex-shrink-0">
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#E4BD5A]/50" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#E4BD5A]/50" />

              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E4BD5A] via-[#F1D27A] to-[#C99E3A] p-[1.5px] shadow-[0_0_15px_rgba(228,189,90,0.35)]">
                    <div className="w-full h-full rounded-full bg-[#002B1D] flex items-center justify-center p-1.5 overflow-hidden">
                      <img src="/logo/zenve-logo.png" alt="Zenve Fashion Crest" className="w-full h-full object-contain drop-shadow-[0_1px_4px_rgba(228,189,90,0.4)]" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#002B1D]" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-serif text-sm tracking-[0.2em] text-[#F5F0DF] font-semibold uppercase">ZENVE CONCIERGE</h3>
                    <Sparkles className="w-3.5 h-3.5 text-[#E4BD5A] animate-pulse" />
                  </div>
                  <p className="text-[11px] text-[#B8B9A8] tracking-wide flex items-center space-x-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Personal Couture Stylist • Online</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button type="button" onClick={handleClearChat} className="p-1.5 rounded-full text-[#B8B9A8] hover:text-[#E4BD5A] hover:bg-[#E4BD5A]/10 transition-colors" aria-label="New conversation" title="New conversation">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 rounded-full text-[#B8B9A8] hover:text-[#E4BD5A] hover:bg-[#E4BD5A]/10 transition-colors" aria-label="Close concierge window">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E4BD5A22 transparent' }}>
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                const pages = isBot ? extractPageUrls(msg.text) : [];
                return (
                  <div key={msg.id} className={`zenve-msg-appear flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line ${
                      isBot
                        ? msg.isError
                          ? 'bg-red-950/60 text-[#F5F0DF] border border-red-800/40 rounded-tl-sm'
                          : 'bg-[#003524]/80 text-[#F5F0DF] border border-[#E4BD5A]/20 rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                        : 'bg-gradient-to-r from-[#E4BD5A] to-[#D5A943] text-[#001C13] font-medium rounded-tr-sm shadow-[0_2px_12px_rgba(228,189,90,0.25)]'
                    }`}>
                      <div>{msg.text}</div>
                      {pages.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {pages.map((page) => (
                            <button
                              key={page.path}
                              type="button"
                              onClick={() => handleNavigate(page.path)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#E4BD5A] via-[#F1D27A] to-[#C99E3A] text-[#001C13] font-semibold text-[11px] shadow-[0_2px_8px_rgba(228,189,90,0.3)] hover:brightness-110 active:scale-95 transition-all"
                            >
                              <span>{page.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-[#B8B9A8]/60 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                );
              })}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* SUGGESTIONS */}
            <div className="px-4 py-2 border-t border-[#E4BD5A]/15 bg-[#001C13]/60 flex-shrink-0">
              <p className="text-[10px] text-[#B8B9A8] mb-1.5 tracking-wider uppercase">Quick Suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    disabled={isTyping}
                    onClick={() => handleSuggestionClick(pill)}
                    className="px-2.5 py-1 text-[10px] rounded-full bg-[#002B1D] border border-[#E4BD5A]/30 text-[#E4BD5A] hover:bg-[#E4BD5A]/15 hover:border-[#E4BD5A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* INPUT */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-[#E4BD5A]/20 bg-[#001C13] flex items-center space-x-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                id="zenve-chatbot-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isTyping ? 'Zenve is crafting a response...' : 'Ask for styling advice, sizing...'}
                className="flex-1 bg-[#002B1D] text-[#F5F0DF] text-xs placeholder-[#B8B9A8]/50 px-3.5 py-2.5 rounded-xl border border-[#E4BD5A]/25 focus:outline-none focus:border-[#E4BD5A] focus:ring-1 focus:ring-[#E4BD5A] transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#E4BD5A] to-[#D5A943] text-[#001C13] flex items-center justify-center hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(228,189,90,0.25)]"
                aria-label="Send message to concierge"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </section>
        )}

        {/* TRIGGER BUTTON */}
        <div className="flex items-center space-x-3">
          {!isOpen && (!hasInteracted || isHovered) && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => { setIsOpen(true); setHasInteracted(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setIsOpen(true); setHasInteracted(true); } }}
              className="zenve-teaser cursor-pointer hidden sm:flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#001F15]/95 border border-[#E4BD5A]/40 text-[#F5F0DF] text-xs font-medium shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(228,189,90,0.15)] backdrop-blur-md hover:border-[#E4BD5A] hover:text-[#E4BD5A] transition-all duration-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E4BD5A] animate-pulse" />
              <span className="font-serif tracking-widest text-[11px] uppercase">Atelier Concierge</span>
            </div>
          )}

          <button
            type="button"
            id="zenve-chatbot-trigger"
            onClick={() => { setIsOpen((prev) => !prev); setHasInteracted(true); }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#0A4733] via-[#002B1D] to-[#00150D] border-2 border-[#E4BD5A]/70 hover:border-[#E4BD5A] text-[#E4BD5A] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_25px_rgba(228,189,90,0.35)] hover:shadow-[0_10px_35px_rgba(0,0,0,0.7),0_0_35px_rgba(228,189,90,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#E4BD5A] focus:ring-offset-2 focus:ring-offset-[#002B1D]"
            aria-expanded={isOpen}
            aria-controls="zenve-chat-window"
            aria-label={isOpen ? 'Close Concierge Chat' : 'Open Zenve Atelier Concierge Chatbot'}
          >
            <span className="absolute inset-0 rounded-full border border-[#E4BD5A]/30 animate-ping pointer-events-none opacity-40" />
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#001C13] shadow-[0_0_8px_rgba(52,211,153,0.8)] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
            <div className="relative flex items-center justify-center transition-transform duration-300">
              {isOpen ? (
                <ChevronDown className="w-6 h-6 text-[#E4BD5A] transform transition-transform group-hover:translate-y-0.5" />
              ) : (
                <div className="relative flex items-center justify-center">
                  <img src="/logo/zenve-logo.png" alt="Zenve Fashion" className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_2px_10px_rgba(228,189,90,0.5)] transition-transform duration-300 group-hover:scale-110" />
                  <Sparkles className="w-3.5 h-3.5 text-[#FFF4D0] absolute -top-1.5 -right-1.5 animate-pulse drop-shadow-[0_0_4px_rgba(228,189,90,0.8)]" />
                </div>
              )}
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ChatbotWidget;
