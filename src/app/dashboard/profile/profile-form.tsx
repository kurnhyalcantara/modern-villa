'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ProfileFormProps {
  defaultValues: { fullName: string };
  email: string;
}

export function ProfileForm({ defaultValues, email }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(defaultValues.fullName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (fullName.trim().length < 2) {
        toast.error('Name must be at least 2 characters');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName: fullName.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message ?? 'Update failed');
          return;
        }

        toast.success('Profile updated');
        router.refresh();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [fullName, router],
  );

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" value={email} disabled className="bg-muted" />
            <p className="text-muted-foreground text-xs">
              Email cannot be changed
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || fullName === defaultValues.fullName}
            className="bg-ocean hover:bg-ocean/90 text-white"
          >
            {loading && <Loader2 className="size-3.5 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
