import React from 'react';

export const AnnouncementBar: React.FC = () => {
  const announcements = [
    'SHOWROOM · JAYANAGAR, BENGALURU',
    'PEOPLE | PETS | TOGETHER',
    'STYLE WITHOUT LIMITS',
    'COMPLIMENTARY SHIPPING ACROSS INDIA',
    'EXCLUSIVE DESIGNER SHOWROOM',
    'HAND-FINISHED ATELIER COUTURE',
  ];

  return (
    <div className="relative w-full bg-[#001C13] border-b border-[#E4BD5A]/15 text-[#E4BD5A] text-[10px] sm:text-[11px] font-medium tracking-[0.22em] py-2 overflow-hidden z-50 select-none">
      <div className="flex w-max animate-marquee-slow">
        {/* Repeating sequence for seamless infinite marquee loop */}
        {[...announcements, ...announcements].map((text, idx) => (
          <div key={idx} className="flex items-center space-x-6 sm:space-x-10 px-4 sm:px-6 uppercase">
            <span>{text}</span>
            <span className="text-[#E4BD5A]/40 text-xs">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
};
