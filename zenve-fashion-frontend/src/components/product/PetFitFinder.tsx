import React, { useState, useId } from 'react';
import { Sparkles, Scale, Ruler, Dog, X, Check } from 'lucide-react';

interface PetFitFinderProps {
  currentSize: string;
  onSelectSize: (size: string) => void;
}

type LifeStage = 'puppy' | 'adult' | 'senior';

interface SizeSpec {
  size: string;
  weightRange: string;
  chestRange: string;
  backRange: string;
  notes: string;
  indianBreeds: string;
}

const SIZE_DATABASE: Record<string, SizeSpec> = {
  XS: {
    size: 'XS',
    weightRange: '1–4 kg',
    chestRange: '26–34 cm',
    backRange: '20–26 cm',
    notes: 'toy & miniature breeds, early puppies',
    indianBreeds: 'Chippiparai puppy, Mudhol puppy, Indie puppy, Pomeranian',
  },
  S: {
    size: 'S',
    weightRange: '5–10 kg',
    chestRange: '35–46 cm',
    backRange: '27–35 cm',
    notes: 'small breeds, lean juveniles',
    indianBreeds: 'Indian Spitz, small Indie / Desi pup, Kombai puppy, Dachshund',
  },
  M: {
    size: 'M',
    weightRange: '11–19 kg',
    chestRange: '47–58 cm',
    backRange: '36–46 cm',
    notes: 'medium breeds, standard adult dogs',
    indianBreeds: 'Indian Pariah (Indie), Jonangi, Caravan Hound, Cocker Spaniel',
  },
  L: {
    size: 'L',
    weightRange: '20–29 kg',
    chestRange: '59–71 cm',
    backRange: '47–55 cm',
    notes: 'large athletic breeds, deep-chested hounds',
    indianBreeds: 'Rajapalayam, Kanni, Mudhol Hound, Rampur Greyhound, Labrador',
  },
  XL: {
    size: 'XL',
    weightRange: '30 kg +',
    chestRange: '72–88 cm',
    backRange: '56–68 cm',
    notes: 'age 18 months + (giant breeds fully grown)',
    indianBreeds: 'Bully Kutta, Bakharwal, Alangu Mastiff, Sindh Mastiff, large Bhotia',
  },
};

export const PetFitFinder: React.FC<PetFitFinderProps> = ({ currentSize, onSelectSize }) => {
  const [lifeStage, setLifeStage] = useState<LifeStage>('adult');
  const [weight, setWeight] = useState<number>(31);
  const [chestGirth, setChestGirth] = useState<string>('');
  const [activeModal, setActiveModal] = useState<'chart' | 'measure' | 'breeds' | null>(null);
  const [appliedNotice, setAppliedNotice] = useState(false);
  const chestInputId = useId();

  // Determine recommended size based on chest girth (primary) or weight (fallback)
  const getRecommendation = (): SizeSpec => {
    const chestNum = parseFloat(chestGirth);
    if (!isNaN(chestNum) && chestNum > 0) {
      if (chestNum < 35) return SIZE_DATABASE.XS;
      if (chestNum <= 46) return SIZE_DATABASE.S;
      if (chestNum <= 58) return SIZE_DATABASE.M;
      if (chestNum <= 71) return SIZE_DATABASE.L;
      return SIZE_DATABASE.XL;
    }

    // Weight based
    if (weight <= 4) return SIZE_DATABASE.XS;
    if (weight <= 10) return SIZE_DATABASE.S;
    if (weight <= 19) return SIZE_DATABASE.M;
    if (weight <= 29) return SIZE_DATABASE.L;
    return SIZE_DATABASE.XL;
  };

  const rec = getRecommendation();

  const handleApplySize = () => {
    onSelectSize(rec.size);
    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 2200);
  };

  return (
    <div className="border border-[#E4BD5A]/30 bg-[#001710] p-5 sm:p-6 space-y-5 my-6 text-left relative">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
          <Dog className="w-4 h-4 text-[#E4BD5A]" strokeWidth={1.5} />
          <span>PET FIT FINDER</span>
        </div>
        <p className="text-xs text-[#D1D5DB]/80 font-light leading-relaxed">
          Tell us about your companion and we will match the tailoring — every Zenve pet piece is cut to chest girth, not guesswork. Indie and Indian breeds included.
        </p>
      </div>

      {/* Life Stage */}
      <div className="space-y-2">
        <span className="block text-[10px] tracking-[0.2em] uppercase font-semibold text-[#D1D5DB]/90">
          LIFE STAGE
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setLifeStage('puppy')}
            className={`py-2 px-3 text-xs tracking-wider transition-all border ${
              lifeStage === 'puppy'
                ? 'bg-[#E4BD5A] text-[#001C13] font-semibold border-[#E4BD5A]'
                : 'border-[#002B1D] text-[#D1D5DB]/80 hover:border-[#E4BD5A]/40 bg-[#00140D]'
            }`}
          >
            Puppy / Kitten (0–1 yr)
          </button>
          <button
            type="button"
            onClick={() => setLifeStage('adult')}
            className={`py-2 px-3 text-xs tracking-wider transition-all border ${
              lifeStage === 'adult'
                ? 'bg-[#E4BD5A] text-[#001C13] font-semibold border-[#E4BD5A]'
                : 'border-[#002B1D] text-[#D1D5DB]/80 hover:border-[#E4BD5A]/40 bg-[#00140D]'
            }`}
          >
            Adult (1–7 yrs)
          </button>
          <button
            type="button"
            onClick={() => setLifeStage('senior')}
            className={`py-2 px-3 text-xs tracking-wider transition-all border ${
              lifeStage === 'senior'
                ? 'bg-[#E4BD5A] text-[#001C13] font-semibold border-[#E4BD5A]'
                : 'border-[#002B1D] text-[#D1D5DB]/80 hover:border-[#E4BD5A]/40 bg-[#00140D]'
            }`}
          >
            Senior (7 yrs +)
          </button>
        </div>
        <p className="text-[11px] text-[#B8B9A8] font-light">
          {lifeStage === 'puppy' && 'Allowance for natural growth spurts with tension-relief elastic.'}
          {lifeStage === 'adult' && 'Tailored fit with full range of movement.'}
          {lifeStage === 'senior' && 'Extra underbelly clearance for effortless step-in dressing.'}
        </p>
      </div>

      {/* Weight Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase font-semibold text-[#D1D5DB]/90">
          <span>WEIGHT</span>
          <span className="font-serif text-sm text-[#F5F0DF] tracking-normal font-normal">
            {weight} kg
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="60"
          step="1"
          value={weight}
          onChange={(e) => setWeight(parseInt(e.target.value, 10))}
          className="w-full accent-[#E4BD5A] h-1.5 bg-[#002B1D] rounded-lg cursor-pointer appearance-none"
        />
      </div>

      {/* Chest Girth (Optional) */}
      <div className="space-y-1.5">
        <div className="flex items-center space-x-3">
          <label
            htmlFor={chestInputId}
            className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#D1D5DB]/90 cursor-pointer"
          >
            CHEST GIRTH (OPTIONAL, CM)
          </label>
          <input
            id={chestInputId}
            type="number"
            placeholder="e.g. 52"
            value={chestGirth}
            onChange={(e) => setChestGirth(e.target.value)}
            className="w-28 bg-[#00140D] border border-[#002B1D] px-3 py-1.5 text-xs text-[#F5F0DF] placeholder-[#B8B9A8]/40 focus:outline-none focus:border-[#E4BD5A]/60"
          />
        </div>
        <p className="text-[11px] text-[#B8B9A8] font-light">
          Measure the widest part behind the front legs — it overrides weight for the most accurate fit.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E4BD5A]/15 pt-4 space-y-2.5">
        {/* Recommended Size Display */}
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-[#E4BD5A]" />
          <span className="text-xs text-[#F5F0DF] font-medium">Recommended size</span>
          <span className="border border-[#E4BD5A] bg-[#00140D] text-[#E4BD5A] font-bold px-2.5 py-0.5 text-xs tracking-wider">
            {rec.size}
          </span>
          {currentSize === rec.size && (
            <span className="text-[10px] text-[#E4BD5A] flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Selected</span>
            </span>
          )}
        </div>

        {/* Specs Details */}
        <p className="text-xs text-[#D1D5DB]/85 font-light leading-relaxed">
          {rec.weightRange} · chest {rec.chestRange} · back {rec.backRange} · {rec.notes}
        </p>
        <p className="text-xs text-[#B8B9A8] font-light">
          {rec.indianBreeds}
        </p>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-3">
          <button
            type="button"
            onClick={handleApplySize}
            className="border border-[#E4BD5A] bg-transparent text-[#E4BD5A] hover:bg-[#E4BD5A] hover:text-[#001C13] font-semibold px-5 py-2 text-xs tracking-[0.2em] uppercase transition-all shadow-sm"
          >
            {appliedNotice ? 'APPLIED TO BAG' : 'USE THIS SIZE'}
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('chart')}
            className="flex items-center space-x-1 text-xs text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors"
          >
            <Ruler className="w-3.5 h-3.5 text-[#E4BD5A]" />
            <span>View full size chart</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('measure')}
            className="flex items-center space-x-1 text-xs text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-[#E4BD5A]" />
            <span>How to measure</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('breeds')}
            className="flex items-center space-x-1 text-xs text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors"
          >
            <Dog className="w-3.5 h-3.5 text-[#E4BD5A]" />
            <span>Indian breed guide</span>
          </button>
        </div>
      </div>

      {/* Modal Overlays */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#001710] border border-[#E4BD5A]/40 p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative space-y-4 text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-[#B8B9A8] hover:text-[#F5F0DF] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal: Full Size Chart */}
            {activeModal === 'chart' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#F5F0DF]">Zenve Pet Atelier Size Chart</h3>
                <p className="text-xs text-[#B8B9A8] leading-relaxed">
                  Tailored with tension-relief elastane at belly girth to ensure zero restriction during movement.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E4BD5A]/30 text-[#E4BD5A] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Weight</th>
                        <th className="py-2.5 px-3">Chest Girth</th>
                        <th className="py-2.5 px-3">Back Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4BD5A]/10 text-[#D1D5DB]">
                      {Object.values(SIZE_DATABASE).map((s) => (
                        <tr key={s.size} className={rec.size === s.size ? 'bg-[#E4BD5A]/10' : ''}>
                          <td className="py-2.5 px-3 font-semibold text-[#E4BD5A]">{s.size}</td>
                          <td className="py-2.5 px-3">{s.weightRange}</td>
                          <td className="py-2.5 px-3">{s.chestRange}</td>
                          <td className="py-2.5 px-3">{s.backRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal: How to Measure */}
            {activeModal === 'measure' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#F5F0DF]">How to Measure Your Pet</h3>
                <div className="space-y-3 text-xs text-[#D1D5DB]/90 leading-relaxed">
                  <div className="p-3 bg-[#001F15] border border-[#E4BD5A]/20">
                    <span className="font-semibold text-[#E4BD5A] block mb-1">1. Chest Girth (Most Critical)</span>
                    Measure the widest circumference of the ribcage right behind the front legs. Keep one finger between the tape and coat.
                  </div>
                  <div className="p-3 bg-[#001F15] border border-[#E4BD5A]/20">
                    <span className="font-semibold text-[#E4BD5A] block mb-1">2. Neck Circumference</span>
                    Measure where the collar naturally rests at the base of the neck.
                  </div>
                  <div className="p-3 bg-[#001F15] border border-[#E4BD5A]/20">
                    <span className="font-semibold text-[#E4BD5A] block mb-1">3. Spine Length</span>
                    Measure along the spine from collar base to 2 inches before the tail root.
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Indian Breed Guide */}
            {activeModal === 'breeds' && (
              <div className="space-y-4">
                <h3 className="font-serif text-2xl text-[#F5F0DF]">Indian Breed Sizing Index</h3>
                <p className="text-xs text-[#B8B9A8]">
                  Native Indian breeds have distinct sighthound, mastiff, or spitz proportions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#001F15] border border-[#E4BD5A]/15">
                    <span className="font-semibold text-[#E4BD5A]">Indian Pariah / Indie</span>
                    <p className="text-[#B8B9A8] mt-1">Size M (12–18 kg) · Chest 50–58 cm</p>
                  </div>
                  <div className="p-3 bg-[#001F15] border border-[#E4BD5A]/15">
                    <span className="font-semibold text-[#E4BD5A]">Rajapalayam & Kanni</span>
                    <p className="text-[#B8B9A8] mt-1">Size L (22–28 kg) · Deep chest 64–72 cm</p>
                  </div>
                  <div className="p-3 bg-[#001F15] border border-[#E4BD5A]/15">
                    <span className="font-semibold text-[#E4BD5A]">Mudhol Hound & Chippiparai</span>
                    <p className="text-[#B8B9A8] mt-1">Size M or L (18–24 kg) · Lean sighthound cut</p>
                  </div>
                  <div className="p-3 bg-[#001F15] border border-[#E4BD5A]/15">
                    <span className="font-semibold text-[#E4BD5A]">Bully Kutta & Bakharwal</span>
                    <p className="text-[#B8B9A8] mt-1">Size XL (32–45 kg) · Heavy bone mastiff fit</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
