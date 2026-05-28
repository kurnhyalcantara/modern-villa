import type { Metadata } from 'next';

import { VillaForm } from '../villa-form';

export const metadata: Metadata = { title: 'Create Villa' };

export default function NewVillaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Villa</h1>
        <p className="text-muted-foreground mt-1">
          Add a new villa to the platform
        </p>
      </div>
      <VillaForm mode="create" />
    </div>
  );
}
