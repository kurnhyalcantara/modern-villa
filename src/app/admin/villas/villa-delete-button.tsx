'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface VillaDeleteButtonProps {
  villaId: string;
  title: string;
}

export function VillaDeleteButton({ villaId, title }: VillaDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/villas/${villaId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message ?? 'Delete failed');
        return;
      }
      toast.success('Villa deleted');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [villaId, title, router]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive"
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
    </Button>
  );
}
