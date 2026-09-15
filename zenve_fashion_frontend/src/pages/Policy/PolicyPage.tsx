import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, FileText, Truck, RefreshCw } from 'lucide-react';

export const PolicyPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Atelier Policies';
  let icon = <FileText className="w-8 h-8 text-[#E4BD5A]" />;
  let content = null;

  if (path === '/privacy') {
    title = 'Privacy Policy';
    icon = <Shield className="w-8 h-8 text-[#E4BD5A]" />;
    content = (
      <div className="space-y-6 text-xs text-[#B8B9A8] leading-relaxed">
        <p>
          At ZENVE (Zenve Pets Healthcare Private Limited), we hold the privacy and confidence of our clientele in the highest regard. This policy details how our atelier collects, encrypts, and handles personal data.
        </p>
        <h3 className="font-serif text-lg text-[#F5F0DF]">1. Data Collection & Security</h3>
        <p>
          We collect personal identifying information exclusively to fulfill bespoke orders, execute white-glove logistics, and send private salon invitations. All payment card details and transaction signatures are processed via PCI-DSS Level 1 certified gateways.
        </p>
        <h3 className="font-serif text-lg text-[#F5F0DF]">2. Zero Third-Party Monetization</h3>
        <p>
          We do not sell, rent, or lease our client register to any external marketing entities. Your measurement archives and companion pet health notes remain strictly confidential within our Bangalore atelier.
        </p>
      </div>
    );
  } else if (path === '/terms') {
    title = 'Terms & Conditions';
    icon = <FileText className="w-8 h-8 text-[#E4BD5A]" />;
    content = (
      <div className="space-y-6 text-xs text-[#B8B9A8] leading-relaxed">
        <p>
          Welcome to the digital atelier of ZENVE. By accessing our platform or placing commissions, you agree to adhere to the luxury standards set forth herein.
        </p>
        <h3 className="font-serif text-lg text-[#F5F0DF]">1. Intellectual Property & Originality</h3>
        <p>
          All silhouette patterns, Twin design methodologies, embroidery layouts, photography, and brand marks are the exclusive intellectual property of Zenve Pets Healthcare Private Limited.
        </p>
        <h3 className="font-serif text-lg text-[#F5F0DF]">2. Bespoke Made-to-Measure Clauses</h3>
        <p>
          Made-to-measure commissions enter production immediately upon client measurement authorization. Minor textile nuances are natural hallmarks of authentic handloom silk weaving.
        </p>
      </div>
    );
  } else if (path === '/shipping') {
    title = 'Complimentary Shipping Policy';
    icon = <Truck className="w-8 h-8 text-[#E4BD5A]" />;
    content = (
      <div className="space-y-6 text-xs text-[#B8B9A8] leading-relaxed">
        <p>
          ZENVE offers complimentary express shipping on all orders across India with zero minimum spend thresholds.
        </p>
        <h3 className="font-serif text-lg text-[#F5F0DF]">1. Packaging & Presentation</h3>
        <p>
          Every garment is steamed, hand-packed in breathable cotton garment covers, and nestled inside our custom emerald presentation box sealed with 24K gold foil tape.
        </p>
        <h3 className="font-serif text-lg text-[#F5F0DF]">2. Dispatch Timelines</h3>
        <p>
          Ready-to-wear pieces ship within 24 to 48 hours. Bespoke and bridal twin ensembles require 10 to 14 atelier crafting days prior to insured air transit.
        </p>
      </div>
    );
  } else {
    title = 'Exchange & Refund Policy';
    icon = <RefreshCw className="w-8 h-8 text-[#E4BD5A]" />;
    content = (
      <div className="space-y-6 text-xs text-[#B8B9A8] leading-relaxed">
        <p>
          Our priority is your complete satisfaction with the fit, drape, and comfort of your garments.
        </p>
        <h3 className="font-serif text-lg text-[#F5F0DF]">1. Standard Pieces</h3>
        <p>
          Standard sizes can be exchanged for size or store credit within 7 calendar days of delivery, provided tags remain intact and garments show zero wear or pet fur transfer.
        </p>
        <h3 className="font-serif text-lg text-[#F5F0DF]">2. Bespoke Alteration Guarantee</h3>
        <p>
          Custom made-to-measure Twin commissions are tailored to your provided dimensions and include one complimentary atelier alteration session at our Jayanagar salon.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#002B1D] min-h-[80vh] py-16 text-left">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-[#E4BD5A]/20 pb-6 space-y-3">
          <div className="p-3 w-max border border-[#E4BD5A]/30 bg-[#001C13]">
            {icon}
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0DF]">{title}</h1>
          <p className="text-xs text-[#E4BD5A] tracking-widest uppercase">
            ZENVE PETS HEALTHCARE PRIVATE LIMITED · LEGAL DISCLOSURES
          </p>
        </div>

        <div className="bg-[#001F15] border border-[#E4BD5A]/20 p-8 sm:p-12">
          {content}
        </div>
      </div>
    </div>
  );
};
