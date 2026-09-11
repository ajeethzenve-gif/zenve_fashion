import React from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { FeatureStrip } from '../../components/home/FeatureStrip';
import { CollectionSection } from '../../components/home/CollectionSection';
import { FeaturedProducts } from '../../components/home/FeaturedProducts';
import { ShowroomBanner } from '../../components/home/ShowroomBanner';
import { JournalSection } from '../../components/home/JournalSection';
import { FlagshipSection } from '../../components/home/FlagshipSection';

export const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeatureStrip />
      <CollectionSection />
      <FeaturedProducts />
      <ShowroomBanner />
      <JournalSection />
      <FlagshipSection />
    </>
  );
};
