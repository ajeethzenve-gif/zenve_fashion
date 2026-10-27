import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ruler, Sparkles, Dog, User, Scissors, CheckCircle, ArrowRight } from 'lucide-react';

export const SizeGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'human' | 'pet'>('human');

  return (
    <div className="w-full bg-[#002B1D] min-h-[85vh] py-16 text-left">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* HEADER */}
        <div className="border-b border-[#E4BD5A]/25 pb-8 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#001810] border border-[#E4BD5A]/30 text-[#E4BD5A] text-xs font-serif uppercase tracking-widest rounded-sm">
            <Ruler className="w-3.5 h-3.5" />
            <span>Atelier Measurement Standard</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0DF]">Size & Fitting Guide</h1>
          <p className="text-sm text-[#B8B9A8] max-w-2xl leading-relaxed">
            Every Zenve garment is handcrafted with bespoke care. Consult our precision measurement charts below to ensure the perfect drape for you and optimal ergonomic comfort for your companion.
          </p>
          
          {/* TAB SWITCHER */}
          <div className="pt-4 flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setActiveTab('human')}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-xs tracking-wider uppercase transition-all ${
                activeTab === 'human'
                  ? 'bg-gradient-to-r from-[#E4BD5A] to-[#D5A943] text-[#001C13] shadow-[0_2px_12px_rgba(228,189,90,0.3)]'
                  : 'bg-[#001F15] text-[#B8B9A8] border border-[#E4BD5A]/20 hover:text-[#E4BD5A]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>People Sizing (XS - XXL)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pet')}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-xs tracking-wider uppercase transition-all ${
                activeTab === 'pet'
                  ? 'bg-gradient-to-r from-[#E4BD5A] to-[#D5A943] text-[#001C13] shadow-[0_2px_12px_rgba(228,189,90,0.3)]'
                  : 'bg-[#001F15] text-[#B8B9A8] border border-[#E4BD5A]/20 hover:text-[#E4BD5A]'
              }`}
            >
              <Dog className="w-4 h-4" />
              <span>Pet Sizing & Breeds (XS - XL)</span>
            </button>
          </div>
        </div>

        {/* HUMAN SIZING TABLE */}
        {activeTab === 'human' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-[#001F15] border border-[#E4BD5A]/25 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-[#E4BD5A]/15 bg-[#002619] flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl text-[#F5F0DF]">Human Apparel Dimensions</h2>
                  <p className="text-xs text-[#B8B9A8]">Standard ready-to-wear sizing in inches and centimeters</p>
                </div>
                <span className="text-[11px] px-3 py-1 bg-[#E4BD5A]/10 border border-[#E4BD5A]/30 text-[#E4BD5A] rounded-full">
                  All items XS - XXL
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#B8B9A8]">
                  <thead className="bg-[#001810] text-[#E4BD5A] font-serif text-[11px] tracking-wider uppercase border-b border-[#E4BD5A]/20">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">Standard Size</th>
                      <th className="py-3.5 px-6 font-semibold">Bust / Chest</th>
                      <th className="py-3.5 px-6 font-semibold">Waist</th>
                      <th className="py-3.5 px-6 font-semibold">Hip</th>
                      <th className="py-3.5 px-6 font-semibold">Fit Style</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4BD5A]/10">
                    {[
                      { size: 'XS', bust: '32" (81 cm)', waist: '26" (66 cm)', hip: '35" (89 cm)', fit: 'Slim Tailored' },
                      { size: 'S', bust: '34" (86 cm)', waist: '28" (71 cm)', hip: '37" (94 cm)', fit: 'Tailored' },
                      { size: 'M', bust: '36" (91 cm)', waist: '30" (76 cm)', hip: '39" (99 cm)', fit: 'Classic Regular' },
                      { size: 'L', bust: '38" (96 cm)', waist: '32" (81 cm)', hip: '41" (104 cm)', fit: 'Classic Regular' },
                      { size: 'XL', bust: '40" (101 cm)', waist: '34" (86 cm)', hip: '43" (109 cm)', fit: 'Relaxed Drape' },
                      { size: 'XXL', bust: '42" (106 cm)', waist: '36" (91 cm)', hip: '45" (114 cm)', fit: 'Relaxed Drape' },
                    ].map((row, idx) => (
                      <tr key={row.size} className={idx % 2 === 0 ? 'bg-[#001F15]' : 'bg-[#001911]'}>
                        <td className="py-3.5 px-6 font-semibold text-[#F5F0DF]">{row.size}</td>
                        <td className="py-3.5 px-6 text-[#F5F0DF]">{row.bust}</td>
                        <td className="py-3.5 px-6">{row.waist}</td>
                        <td className="py-3.5 px-6">{row.hip}</td>
                        <td className="py-3.5 px-6 text-[#E4BD5A]">{row.fit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MEASURING GUIDE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: '1. Bust / Chest', desc: 'Measure around the fullest part of your chest with tape parallel to the floor.' },
                { title: '2. Natural Waist', desc: 'Measure around your natural waistline, where your torso is narrowest.' },
                { title: '3. Fullest Hips', desc: 'Stand with feet together and measure around the fullest curve of your hips.' },
              ].map((step) => (
                <div key={step.title} className="p-5 bg-[#001A12] border border-[#E4BD5A]/20 rounded-xl space-y-2">
                  <h3 className="font-serif text-sm text-[#E4BD5A] font-semibold">{step.title}</h3>
                  <p className="text-xs text-[#B8B9A8] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PET SIZING TABLE */}
        {activeTab === 'pet' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-[#001F15] border border-[#E4BD5A]/25 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-[#E4BD5A]/15 bg-[#002619] flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl text-[#F5F0DF]">Companion Pet Sizing & Breed Chart</h2>
                  <p className="text-xs text-[#B8B9A8]">Calibrated for Indian breeds and international companions</p>
                </div>
                <span className="text-[11px] px-3 py-1 bg-[#E4BD5A]/10 border border-[#E4BD5A]/30 text-[#E4BD5A] rounded-full">
                  Skin-Safe Ergonomic Fit
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#B8B9A8]">
                  <thead className="bg-[#001810] text-[#E4BD5A] font-serif text-[11px] tracking-wider uppercase border-b border-[#E4BD5A]/20">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">Size</th>
                      <th className="py-3.5 px-6 font-semibold">Weight Range</th>
                      <th className="py-3.5 px-6 font-semibold">Chest Girth</th>
                      <th className="py-3.5 px-6 font-semibold">Back Length</th>
                      <th className="py-3.5 px-6 font-semibold">Breed Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4BD5A]/10">
                    {[
                      { size: 'XS', weight: '1 - 4 kg', chest: '26 - 34 cm', back: '20 - 26 cm', breeds: 'Chippiparai puppy, Mudhol puppy, Indie pup, Pomeranian' },
                      { size: 'S', weight: '5 - 10 kg', chest: '35 - 46 cm', back: '27 - 35 cm', breeds: 'Indian Spitz, small Indie / Desi pup, Kombai puppy, Dachshund' },
                      { size: 'M', weight: '11 - 19 kg', chest: '47 - 58 cm', back: '36 - 46 cm', breeds: 'Indian Pariah (Indie), Jonangi, Caravan Hound, Cocker Spaniel' },
                      { size: 'L', weight: '20 - 29 kg', chest: '59 - 71 cm', back: '47 - 55 cm', breeds: 'Rajapalayam, Kanni, Mudhol Hound, Rampur Greyhound, Labrador' },
                      { size: 'XL', weight: '30 kg +', chest: '72 - 88 cm', back: '56 - 68 cm', breeds: 'Bully Kutta, Bakharwal, Alangu Mastiff, large Bhotia, Golden' },
                    ].map((row, idx) => (
                      <tr key={row.size} className={idx % 2 === 0 ? 'bg-[#001F15]' : 'bg-[#001911]'}>
                        <td className="py-3.5 px-6 font-semibold text-[#F5F0DF]">{row.size}</td>
                        <td className="py-3.5 px-6 text-[#E4BD5A] font-medium">{row.weight}</td>
                        <td className="py-3.5 px-6">{row.chest}</td>
                        <td className="py-3.5 px-6">{row.back}</td>
                        <td className="py-3.5 px-6 text-[#F5F0DF]">{row.breeds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PET MEASURING TIPS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: '1. Chest Girth', desc: 'Measure around the widest part of your pet’s ribcage behind the front legs. Keep tape comfortable.' },
                { title: '2. Back Length', desc: 'Measure from the base of their neck (collar line) to the base of the tail.' },
                { title: '3. Neck Circumference', desc: 'Measure where the collar sits naturally. Allow room for two fingers.' },
              ].map((step) => (
                <div key={step.title} className="p-5 bg-[#001A12] border border-[#E4BD5A]/20 rounded-xl space-y-2">
                  <h3 className="font-serif text-sm text-[#E4BD5A] font-semibold">{step.title}</h3>
                  <p className="text-xs text-[#B8B9A8] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BESPOKE CALLOUT */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#002619] to-[#001B12] border border-[#E4BD5A]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-serif text-xl text-[#F5F0DF]">Need Custom Made-to-Measure Fitting?</h3>
            <p className="text-xs text-[#B8B9A8] max-w-xl">
              All Twin collections include complimentary bespoke tailoring. Book an appointment with our atelier team to submit custom measurements.
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E4BD5A] to-[#D5A943] text-[#001C13] font-semibold text-xs tracking-wider uppercase shadow-[0_2px_12px_rgba(228,189,90,0.3)] hover:brightness-110 transition-all"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/twin"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#001810] border border-[#E4BD5A]/30 text-[#E4BD5A] hover:bg-[#E4BD5A]/10 text-xs font-medium tracking-wider uppercase transition-all"
            >
              <span>Explore Twin Sets</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
