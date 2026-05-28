'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface VillaFormData {
  title: string;
  slug: string;
  description: string;
  location: string;
  pricePerNight: string;
  maxGuests: string;
}

interface VillaFormProps {
  mode: 'create' | 'edit';
  villaId?: string;
  defaultValues?: VillaFormData;
}

const emptyForm: VillaFormData = {
  title: '',
  slug: '',
  description: '',
  location: '',
  pricePerNight: '',
  maxGuests: '',
};

export function VillaForm({
  mode,
  villaId,
  defaultValues = emptyForm,
}: VillaFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<VillaFormData>(defaultValues);
  const [loading, setLoading] = useState(false);

  const update = useCallback((field: keyof VillaFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const payload = {
          title: form.title,
          slug: form.slug,
          description: form.description,
          location: form.location,
          pricePerNight: Number(form.pricePerNight),
          maxGuests: Number(form.maxGuests),
        };

        const url =
          mode === 'create'
            ? '/api/admin/villas'
            : `/api/admin/villas/${villaId}`;
        const method = mode === 'create' ? 'POST' : 'PATCH';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message ?? 'Operation failed');
          return;
        }

        toast.success(mode === 'create' ? 'Villa created' : 'Villa updated');
        router.push('/admin/villas');
        router.refresh();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [form, mode, villaId, router],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create Villa' : 'Edit Villa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug
              </label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                required
                disabled={loading}
                placeholder="e.g. ocean-view-villa"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              className="border-input bg-background placeholder:text-muted-foreground min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="price" className="text-sm font-medium">
                Price per Night ($)
              </label>
              <Input
                id="price"
                type="number"
                min="1"
                step="0.01"
                value={form.pricePerNight}
                onChange={(e) => update('pricePerNight', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="maxGuests" className="text-sm font-medium">
                Max Guests
              </label>
              <Input
                id="maxGuests"
                type="number"
                min="1"
                value={form.maxGuests}
                onChange={(e) => update('maxGuests', e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="bg-ocean hover:bg-ocean/90 text-white"
            >
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              {mode === 'create' ? 'Create Villa' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
