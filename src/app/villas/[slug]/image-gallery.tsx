'use client';

import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: { id: string; imageUrl: string; order: number }[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      const total = images.length;
      setSelectedIndex(((index % total) + total) % total);
    },
    [images.length],
  );

  if (images.length === 0) {
    return (
      <div className="bg-muted flex aspect-[16/9] items-center justify-center rounded-xl">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  const mainImage = images[selectedIndex];

  return (
    <>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:grid-rows-2">
        <div className="group relative md:col-span-3 md:row-span-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl md:aspect-[3/2]">
            {mainImage && (
              <Image
                src={mainImage.imageUrl}
                alt={`${title} - Image ${selectedIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 75vw"
                className="object-cover"
                priority
              />
            )}
          </div>

          <Button
            variant="secondary"
            size="icon-sm"
            className="absolute right-3 bottom-3 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
            onClick={() => setLightboxOpen(true)}
            aria-label="View full screen"
          >
            <Expand className="size-4" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon-sm"
                className="absolute top-1/2 left-3 -translate-y-1/2 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                onClick={() => goTo(selectedIndex - 1)}
                aria-label="Previous image"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon-sm"
                className="absolute top-1/2 right-3 -translate-y-1/2 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                onClick={() => goTo(selectedIndex + 1)}
                aria-label="Next image"
              >
                <ChevronRight className="size-4" />
              </Button>
            </>
          )}
        </div>

        {images.slice(0, 4).map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setSelectedIndex(i)}
            className={cn(
              'relative hidden aspect-[4/3] overflow-hidden rounded-lg transition-opacity md:block',
              i === selectedIndex
                ? 'ring-ocean ring-2 ring-offset-2'
                : 'opacity-70 hover:opacity-100',
            )}
          >
            <Image
              src={img.imageUrl}
              alt={`${title} - Thumbnail ${i + 1}`}
              fill
              sizes="20vw"
              className="object-cover"
            />
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white">
                +{images.length - 4} more
              </div>
            )}
          </button>
        ))}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl border-none bg-black/95 p-0">
          <DialogTitle className="sr-only">
            {title} - Image {selectedIndex + 1} of {images.length}
          </DialogTitle>
          <div className="relative aspect-[16/10]">
            {mainImage && (
              <Image
                src={mainImage.imageUrl}
                alt={`${title} - Image ${selectedIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
              />
            )}

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => goTo(selectedIndex - 1)}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => goTo(selectedIndex + 1)}
                  aria-label="Next image"
                >
                  <ChevronRight className="size-6" />
                </Button>
              </>
            )}
          </div>

          <div className="px-4 py-2 text-center text-sm text-white/70">
            {selectedIndex + 1} / {images.length}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
