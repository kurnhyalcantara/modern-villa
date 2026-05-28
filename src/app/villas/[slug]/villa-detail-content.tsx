import { MapPin, Star, Users } from 'lucide-react';
import Link from 'next/link';

import { Separator } from '@/components/ui/separator';
import { getServerTranslation } from '@/lib/server-translation';
import { formatRupiah } from '@/lib/currency';
import type { VillaDetailData } from '@/types/villa';

import { AvailabilityCalendar } from './availability-calendar';
import { BookingForm } from './booking-form';
import { ImageGallery } from './image-gallery';
import { ReviewList } from './review-list';

interface VillaDetailContentProps {
  villa: VillaDetailData;
}

export async function VillaDetailContent({ villa }: VillaDetailContentProps) {
  const { t } = await getServerTranslation();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        className="text-muted-foreground mb-6 text-sm"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              {t('villa.breadcrumb.home')}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href="/villas"
              className="hover:text-foreground transition-colors"
            >
              {t('villa.breadcrumb.villas')}
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium">{villa.title}</li>
        </ol>
      </nav>

      <ImageGallery images={villa.images} title={villa.title} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{villa.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <MapPin className="size-4" />
                {villa.location}
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{villa.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({villa.reviewCount}{' '}
                  {villa.reviewCount === 1 ? t('villa.review_singular') : t('villa.reviews_plural')})
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Users className="size-4" />
                {t('villa.up_to_guests', { count: villa.maxGuests })}
              </div>
            </div>
          </div>

          <Separator />

          <div className="prose prose-sm max-w-none">
            <h2 className="text-xl font-semibold">{t('villa.about')}</h2>
            <div className="text-muted-foreground mt-3 leading-relaxed whitespace-pre-line">
              {villa.description}
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="mb-4 text-xl font-semibold">{t('villa.availability')}</h2>
            <AvailabilityCalendar />
          </div>

          <Separator />

          <ReviewList
            reviews={villa.reviews}
            rating={villa.rating}
            count={villa.reviewCount}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border p-6 shadow-sm">
            <div className="mb-4">
              <span className="text-ocean text-3xl font-bold">
                {formatRupiah(villa.pricePerNight)}
              </span>
              <span className="text-muted-foreground text-sm"> {t('villa.night_label')}</span>
            </div>

            <BookingForm
              villaId={villa.id}
              pricePerNight={villa.pricePerNight}
              maxGuests={villa.maxGuests}
            />

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('villa.location_label')}</span>
                <span className="font-medium">{villa.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('villa.max_guests_label')}</span>
                <span className="font-medium">{villa.maxGuests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('villa.rating_label')}</span>
                <span className="flex items-center gap-1 font-medium">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {villa.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
