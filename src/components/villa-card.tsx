'use client';

import { MapPin, Star, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { formatRupiah } from '@/lib/currency';
import type { VillaCardData } from '@/types/villa';

interface VillaCardProps {
  villa: VillaCardData;
}

export function VillaCard({ villa }: VillaCardProps) {
  const { t } = useTranslation();

  return (
    <Link href={`/villas/${villa.slug}`} className="group block">
      <Card className="overflow-hidden border transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          {villa.imageUrl ? (
            <Image
              src={villa.imageUrl}
              alt={villa.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="bg-muted flex h-full items-center justify-center">
              <span className="text-muted-foreground text-sm">
                {t('villa.no_image')}
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {villa.rating.toFixed(1)}
          </div>
        </div>

        <CardContent className="space-y-2 p-4">
          <h3 className="line-clamp-1 font-semibold">{villa.title}</h3>

          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{villa.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-muted-foreground flex items-center gap-1 text-sm">
              <Users className="size-3.5" />
              <span>{t('villa.up_to', { count: villa.maxGuests })}</span>
            </div>
            <div className="text-right">
              <span className="text-ocean text-lg font-bold">
                {formatRupiah(villa.pricePerNight)}
              </span>
              <span className="text-muted-foreground text-xs">
                {' '}
                {t('villa.per_night')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
