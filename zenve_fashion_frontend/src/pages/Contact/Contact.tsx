import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  CheckCircle,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Heart,
  Sparkles,
} from 'lucide-react';

export const Contact: React.FC = () => {
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    enquiry: 'Styling appointment',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      enquiry: 'Styling appointment',
      message: '',
    });
  };

  return (
    <div className="relative w-full bg-[#001911] min-h-screen text-[#F7F4EB] overflow-hidden text-left">
      {/* Dynamic Molten Gold Ribbons Background Accents */}
      {/* Top-Left Arched Gold Wave */}
      <div className="absolute top-0 left-0 w-[320px] sm:w-[480px] lg:w-[620px] h-[220px] sm:h-[300px] lg:h-[380px] pointer-events-none overflow-hidden select-none z-0">
        <svg
          viewBox="0 0 620 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="goldRibbonTLContact" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF4D0" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#E4BD5A" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#B38938" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E4BD5A" stopOpacity="0" />
            </linearGradient>
            <filter id="glowTLContact" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M -30 200 C 60 160, 160 80, 290 -10"
            stroke="url(#goldRibbonTLContact)"
            strokeWidth="3"
            filter="url(#glowTLContact)"
          />
          <path
            d="M -30 200 C 60 160, 160 80, 290 -10 L 0 -10 L -30 -10 Z"
            fill="url(#goldRibbonTLContact)"
            opacity="0.07"
          />
        </svg>
      </div>

      {/* Bottom-Right Arched Gold Wave */}
      <div className="absolute bottom-0 right-0 w-[320px] sm:w-[480px] lg:w-[620px] h-[220px] sm:h-[300px] lg:h-[380px] pointer-events-none overflow-hidden select-none z-0">
        <svg
          viewBox="0 0 620 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="goldRibbonBRContact" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FFF4D0" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#E4BD5A" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#B38938" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E4BD5A" stopOpacity="0" />
            </linearGradient>
            <filter id="glowBRContact" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M 320 390 C 430 300, 520 200, 650 110"
            stroke="url(#goldRibbonBRContact)"
            strokeWidth="3"
            filter="url(#glowBRContact)"
          />
          <path
            d="M 320 390 C 430 300, 520 200, 650 110 L 650 390 Z"
            fill="url(#goldRibbonBRContact)"
            opacity="0.07"
          />
        </svg>
      </div>

      {/* Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[950px] h-[520px] bg-radial from-[#043E2C]/25 via-transparent to-transparent pointer-events-none z-0" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-24 space-y-16 sm:space-y-24">
        
        {/* 1. Top Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-4 sm:pb-8 border-b border-[#E4BD5A]/15">
          {/* Left Title & Summary */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#E4BD5A] uppercase">
                GET IN TOUCH
              </span>
              <div className="w-10 h-[1.5px] bg-[#E4BD5A]/70" />
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] text-[#F7F4EB] font-normal tracking-tight leading-[1.08]">
              Contact the <span className="text-[#E4BD5A]">atelier</span>
            </h1>

            <p className="text-sm sm:text-base text-[#B8C7BC] font-light leading-relaxed pt-1">
              Private styling appointments, custom Twin commissions, bespoke order support or press inquiries — our salon concierge replies within one working day.
            </p>
          </div>

          {/* Right Bespoke Editorial Tag */}
          <div className="hidden md:flex items-start space-x-4 pt-2 flex-shrink-0">
            <div className="w-[1.5px] h-18 bg-[#E4BD5A]/60" />
            <div className="flex flex-col text-left space-y-1">
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                CRAFTED
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                FOR A MORE
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                BEAUTIFUL
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                EVERYDAY
              </span>
              <div className="w-6 h-[1.5px] bg-[#E4BD5A]/60 mt-2" />
            </div>
          </div>
        </div>

        {/* 2. Two-Column Layout: Left Concierge Plaque | Right Haute-Couture Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Showroom Concierge Salon Plaque (5 cols) */}
          <div className="lg:col-span-5 bg-[#002116]/40 p-6 sm:p-8 rounded-[32px] border border-[#E4BD5A]/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm space-y-7">
            
            <div className="space-y-1.5 border-b border-[#E4BD5A]/15 pb-5">
              <span className="text-[10px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
                FLAGSHIP SALON
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#F7F4EB] font-normal tracking-tight">
                Jayanagar 9th Block
              </h2>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-[#001710] border border-[#E4BD5A]/35 flex items-center justify-center text-[#E4BD5A] flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base text-[#F7F4EB] font-normal">
                  Atelier Address
                </h3>
                <div className="text-xs sm:text-[13px] text-[#B8C7BC] font-light leading-relaxed">
                  <p className="font-medium text-[#F7F4EB]/90">Zenve Pets Healthcare Private Limited</p>
                  <p>1446, 4th Floor, Puttayyanpalya, Kottapalya</p>
                  <p>Jayanagara 9th Block, Jayanagar</p>
                  <p>Bengaluru, Karnataka 560041</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-[#001710] border border-[#E4BD5A]/35 flex items-center justify-center text-[#E4BD5A] flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Clock className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base text-[#F7F4EB] font-normal">
                  Visiting Hours
                </h3>
                <p className="text-xs sm:text-[13px] text-[#B8C7BC] font-light leading-relaxed">
                  Monday – Sunday, 11:00 – 20:30 IST.
                </p>
                <p className="text-xs text-[#E4BD5A] font-medium pt-0.5">
                  ✦ Four-legged family members always welcome.
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-[#001710] border border-[#E4BD5A]/35 flex items-center justify-center text-[#E4BD5A] flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base text-[#F7F4EB] font-normal">
                  Direct Inquiries
                </h3>
                <a
                  href="mailto:care@zenve.fashion"
                  className="block text-xs sm:text-[13px] text-[#B8C7BC] font-light hover:text-[#E4BD5A] transition-colors"
                >
                  care@zenve.fashion
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4 group">
              <div className="w-10 h-10 rounded-xl bg-[#001710] border border-[#E4BD5A]/35 flex items-center justify-center text-[#E4BD5A] flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base text-[#F7F4EB] font-normal">
                  Private Concierge
                </h3>
                <a
                  href="tel:+918047182200"
                  className="block text-xs sm:text-[13px] text-[#B8C7BC] font-light hover:text-[#E4BD5A] transition-colors"
                >
                  +91 80 4718 2200
                </a>
              </div>
            </div>

            {/* Flagship Showroom Preview Frame */}
            <div className="pt-2">
              <div className="relative rounded-2xl overflow-hidden border border-[#E4BD5A]/35 shadow-md aspect-[16/10] bg-[#00140D] group">
                <img
                  src="/images/journal/inside-jayanagar-showroom.jpg"
                  alt="Zenve Jayanagar Showroom"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#F5F0DF]">
                  <span className="bg-[#001C13]/85 backdrop-blur-sm border border-[#E4BD5A]/40 px-3 py-0.5 rounded-full text-[9px] tracking-widest uppercase text-[#E4BD5A] font-semibold">
                    Atelier Salon
                  </span>
                  <span className="text-[10px] text-[#B8C7BC] font-light">
                    Bengaluru Flagship
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Haute-Couture Enquiry Suite (7 cols) */}
          <div className="lg:col-span-7 bg-[#002116]/60 backdrop-blur-md rounded-[32px] border border-[#E4BD5A]/25 p-8 sm:p-11 shadow-[0_25px_70px_rgba(0,0,0,0.6)] space-y-6">
            
            <div className="space-y-2 border-b border-[#E4BD5A]/15 pb-6">
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
                BESPOKE CORRESPONDENCE
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#F7F4EB] font-normal tracking-tight">
                Send an Atelier Message
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C7BC] font-light leading-relaxed">
                Whether you seek private fittings for twin garments, bespoke sizing for companion breeds, or order liaison — we are at your service.
              </p>
            </div>

            {isSent ? (
              <div className="py-12 text-center space-y-5 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#E4BD5A]/10 border border-[#E4BD5A]/40 flex items-center justify-center mx-auto text-[#E4BD5A] shadow-[0_0_25px_rgba(228,189,90,0.3)]">
                  <CheckCircle className="w-8 h-8" strokeWidth={1.75} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#F7F4EB]">
                    Message Received
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B8C7BC] font-light max-w-md mx-auto leading-relaxed">
                    Thank you for contacting the atelier. A senior client liaison will review your specifications and reply to you within one working day.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setIsSent(false)}
                    className="inline-flex items-center space-x-2 rounded-full px-7 py-3 border border-[#E4BD5A]/80 text-[#E4BD5A] font-semibold text-xs tracking-[0.2em] uppercase bg-[#001D14]/80 hover:bg-[#E4BD5A] hover:text-[#001C13] transition-all duration-300 shadow-md cursor-pointer"
                  >
                    <span>SEND ANOTHER MESSAGE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-[#E4BD5A]">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Lady / Lord / Guardian Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#00140D] border border-[#E4BD5A]/30 focus:border-[#E4BD5A] px-4 py-3.5 text-xs sm:text-sm text-[#F7F4EB] placeholder-[#B8B9A8]/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E4BD5A]/50 transition-all"
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-[#E4BD5A]">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 focus:border-[#E4BD5A] px-4 py-3.5 text-xs sm:text-sm text-[#F7F4EB] placeholder-[#B8B9A8]/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E4BD5A]/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-[#E4BD5A]">
                      CONTACT TELEPHONE
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 focus:border-[#E4BD5A] px-4 py-3.5 text-xs sm:text-sm text-[#F7F4EB] placeholder-[#B8B9A8]/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E4BD5A]/50 transition-all"
                    />
                  </div>
                </div>

                {/* Enquiry Type */}
                <div className="space-y-2">
                  <label className="block text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-[#E4BD5A]">
                    NATURE OF ENQUIRY *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.enquiry}
                      onChange={(e) => setFormData({ ...formData, enquiry: e.target.value })}
                      className="w-full appearance-none bg-[#00140D] border border-[#E4BD5A]/30 focus:border-[#E4BD5A] px-4 py-3.5 pr-10 text-xs sm:text-sm text-[#F7F4EB] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E4BD5A]/50 transition-all cursor-pointer"
                    >
                      <option value="Styling appointment" className="bg-[#00140D] text-[#F7F4EB]">
                        In-Person Styling &amp; Fitting Appointment (Jayanagar)
                      </option>
                      <option value="Twin commission" className="bg-[#00140D] text-[#F7F4EB]">
                        Bespoke Twin Commission (Human &amp; Companion Duo)
                      </option>
                      <option value="Order support" className="bg-[#00140D] text-[#F7F4EB]">
                        Client Order Inquiries &amp; White-Glove Support
                      </option>
                      <option value="Press & partnerships" className="bg-[#00140D] text-[#F7F4EB]">
                        Press, Editorial Loans &amp; House Partnerships
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#E4BD5A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-[#E4BD5A]">
                    SPECIFICATIONS OR MESSAGE *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Please include companion breed, sizing requirements, or preferred dates..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#00140D] border border-[#E4BD5A]/30 focus:border-[#E4BD5A] px-4 py-3.5 text-xs sm:text-sm text-[#F7F4EB] placeholder-[#B8B9A8]/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E4BD5A]/50 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#E4BD5A] text-[#001C13] font-semibold py-4 text-xs sm:text-sm tracking-[0.25em] uppercase hover:bg-[#F1D27A] transition-all duration-300 rounded-xl shadow-[0_0_20px_rgba(228,189,90,0.3)] hover:shadow-[0_0_30px_rgba(228,189,90,0.5)] cursor-pointer flex items-center justify-center space-x-2.5"
                  >
                    <span>TRANSMIT ENQUIRY</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

        {/* 3. Concierge Guarantees & Pillars */}
        <section className="pt-8 border-t border-[#E4BD5A]/15">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-[#002218]/40 border border-[#E4BD5A]/20">
              <ShieldCheck className="w-6 h-6 text-[#E4BD5A] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-[#F7F4EB]">24-Hour Liaison</h4>
                <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                  Every enquiry is attended to by a senior atelier advisor within one business day.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-[#002218]/40 border border-[#E4BD5A]/20">
              <Heart className="w-6 h-6 text-[#E4BD5A] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-[#F7F4EB]">Four-Paw Suiting</h4>
                <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                  Private suites engineered with chilled stone, silk resting beds, and calm sensory acoustic panels.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-[#002218]/40 border border-[#E4BD5A]/20">
              <Sparkles className="w-6 h-6 text-[#E4BD5A] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-[#F7F4EB]">Master Measurements</h4>
                <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                  Coordinated drafting by dual human and pet tailors to ensure harmonious drape and freedom.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

