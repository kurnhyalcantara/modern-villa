import { getFeaturedVillas } from './actions';
import {
  CTASection,
  FeaturedVillasSection,
  FeaturesSection,
  HeroSection,
} from './homepage-sections';

export default async function Home() {
  const villas = await getFeaturedVillas();

  return (
    <>
      <HeroSection />
      <FeaturedVillasSection villas={villas} />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
