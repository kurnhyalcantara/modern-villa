'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserRoleSelectProps {
  userId: string;
  currentRole: string;
}

export function UserRoleSelect({ userId, currentRole }: UserRoleSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    async (value: string | null) => {
      if (!value || value === currentRole) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: value }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.message ?? 'Update failed');
          return;
        }
        toast.success('Role updated');
        router.refresh();
      } catch {
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [userId, currentRole, router],
  );

  return (
    <Select value={currentRole} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="h-8 w-24 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USER">User</SelectItem>
        <SelectItem value="ADMIN">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
