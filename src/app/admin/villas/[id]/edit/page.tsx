import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getCurrentUser, requireRole } from '@/lib/auth';
import { villaRepository } from '@/repositories/villa.repository';

import { VillaForm } from '../../villa-form';

export const metadata: Metadata = { title: 'Edit Villa' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditVillaPage({ params }: Props) {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const { id } = await params;
  const villa = await villaRepository.findById(id);

  if (!villa) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Villa</h1>
        <p className="text-muted-foreground mt-1">{villa.title}</p>
      </div>
      <VillaForm
        mode="edit"
        villaId={villa.id}
        defaultValues={{
          title: villa.title,
          slug: villa.slug,
          description: villa.description,
          location: villa.location,
          pricePerNight: Number(villa.pricePerNight).toString(),
          maxGuests: villa.maxGuests.toString(),
        }}
      />
    </div>
  );
}
