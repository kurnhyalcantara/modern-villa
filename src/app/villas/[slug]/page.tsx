import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getVillaBySlug } from './actions';
import { VillaDetailContent } from './villa-detail-content';

interface VillaDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: VillaDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const villa = await getVillaBySlug(slug);

  if (!villa) {
    return { title: 'Villa Not Found' };
  }

  return {
    title: villa.title,
    description: villa.description.slice(0, 160),
    openGraph: {
      title: villa.title,
      description: villa.description.slice(0, 160),
      images: villa.images[0]?.imageUrl
        ? [{ url: villa.images[0].imageUrl }]
        : undefined,
    },
  };
}

export default async function VillaDetailPage({
  params,
}: VillaDetailPageProps) {
  const { slug } = await params;
  const villa = await getVillaBySlug(slug);

  if (!villa) {
    notFound();
  }

  return <VillaDetailContent villa={villa} />;
}
