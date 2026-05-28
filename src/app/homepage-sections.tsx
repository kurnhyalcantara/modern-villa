'use client';

import { ArrowRight, MapPin, Shield, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { VillaCard } from '@/components/villa-card';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { VillaCardData } from '@/types/villa';

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <div className="from-ocean/5 via-background to-background absolute inset-0 bg-gradient-to-br" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-2xl text-center">
          <div className="bg-ocean/10 text-ocean mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <Star className="size-4 fill-current" />
            {t('homepage.hero.badge')}
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t('homepage.hero.title')}
          </h1>

          <p className="text-muted-foreground mx-auto mt-6 max-w-lg text-lg leading-relaxed">
            {t('homepage.hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/villas"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'bg-ocean hover:bg-ocean/90 text-ocean-foreground gap-2 px-6',
              )}
            >
              {t('homepage.hero.cta')}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#features"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'px-6',
              )}
            >
              {t('homepage.hero.learn_more')}
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              src: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=600&h=400&fit=crop',
              alt: 'Luxury villa with pool',
            },
            {
              src: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop',
              alt: 'Modern villa exterior',
            },
            {
              src: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=400&fit=crop',
              alt: 'Villa with ocean view',
            },
          ].map((img) => (
            <div
              key={img.alt}
              className="relative aspect-[3/2] overflow-hidden rounded-xl shadow-lg"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedVillasSection({ villas }: { villas: VillaCardData[] }) {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t('homepage.featured.title')}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t('homepage.featured.subtitle')}
          </p>
        </div>
        <Link
          href="/villas"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'hidden gap-1 sm:inline-flex',
          )}
        >
          {t('homepage.featured.view_all')}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {villas.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground py-12 text-center">
          <p>{t('homepage.featured.no_villas')}</p>
        </div>
      )}

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/villas"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'gap-1',
          )}
        >
          {t('homepage.featured.view_all_villas')}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Shield,
      titleKey: 'homepage.features.verified.title',
      descriptionKey: 'homepage.features.verified.description',
    },
    {
      icon: Star,
      titleKey: 'homepage.features.reviews.title',
      descriptionKey: 'homepage.features.reviews.description',
    },
    {
      icon: MapPin,
      titleKey: 'homepage.features.locations.title',
      descriptionKey: 'homepage.features.locations.description',
    },
  ];

  return (
    <section id="features" className="bg-muted/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {t('homepage.features.title')}
          </h2>
          <p className="text-muted-foreground mt-2">
            {t('homepage.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="bg-background rounded-xl border p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="bg-ocean/10 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
                <feature.icon className="text-ocean size-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t(feature.titleKey)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="bg-ocean relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="relative z-10">
          <h2 className="text-ocean-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            {t('homepage.cta.title')}
          </h2>
          <p className="text-ocean-foreground/80 mx-auto mt-4 max-w-lg text-lg">
            {t('homepage.cta.subtitle')}
          </p>
          <Link
            href="/villas"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'mt-8 bg-white px-8 text-black hover:bg-white/90',
            )}
          >
            {t('homepage.cta.button')}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      </div>
    </section>
  );
}
