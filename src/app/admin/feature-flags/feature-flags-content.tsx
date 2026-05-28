'use client';

import { Edit2, Loader2, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFeatureFlagStore } from '@/store/feature-flag-store';

interface FlagRow {
  id: string;
  key: string;
  description: string | null;
  value: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Props {
  initialFlags: FlagRow[];
}

const PAYMENT_FLAG_KEYS = [
  'deposit.manual_verification',
  'deposit.gateway_enabled',
  'withdraw.manual_review',
  'withdraw.gateway_enabled',
  'maintenance_mode',
];

export function FeatureFlagsContent({ initialFlags }: Props) {
  const router = useRouter();
  const setStoreFlag = useFeatureFlagStore((s) => s.setFlag);
  const [flags, setFlags] = useState<FlagRow[]>(initialFlags);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('true');
  const [newType, setNewType] = useState<'BOOLEAN' | 'STRING' | 'NUMBER'>('BOOLEAN');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const handleToggle = useCallback(
    async (flag: FlagRow) => {
      setToggling(flag.id);
      try {
        const newActive = !flag.isActive;
        const res = await fetch(`/api/feature-flags/${flag.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: newActive }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.message ?? 'Failed'); return; }
        setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, isActive: newActive } : f)));
        if (flag.type === 'BOOLEAN') {
          setStoreFlag(flag.key, newActive ? flag.value === 'true' : false);
        }
        toast.success(`Flag '${flag.key}' ${newActive ? 'enabled' : 'disabled'}`);
        router.refresh();
      } finally {
        setToggling(null);
      }
    },
    [router, setStoreFlag],
  );

  const handleSaveValue = useCallback(
    async (flag: FlagRow) => {
      setToggling(flag.id);
      try {
        const res = await fetch(`/api/feature-flags/${flag.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: editValue }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.message ?? 'Failed'); return; }
        setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, value: editValue } : f)));
        toast.success('Flag value updated');
        setEditingId(null);
        router.refresh();
      } finally {
        setToggling(null);
      }
    },
    [editValue, router],
  );

  const handleDelete = useCallback(
    async (flag: FlagRow) => {
      if (!confirm(`Delete flag '${flag.key}'?`)) return;
      setDeleting(flag.id);
      try {
        const res = await fetch(`/api/feature-flags/${flag.id}`, { method: 'DELETE' });
        if (!res.ok) { toast.error('Delete failed'); return; }
        setFlags((prev) => prev.filter((f) => f.id !== flag.id));
        toast.success(`Flag '${flag.key}' deleted`);
        router.refresh();
      } finally {
        setDeleting(null);
      }
    },
    [router],
  );

  const handleCreate = useCallback(async () => {
    if (!newKey.trim()) { toast.error('Key is required'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey.trim(), value: newValue, type: newType, description: newDesc || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message ?? 'Create failed'); return; }
      setFlags((prev) => [...prev, data.data as FlagRow]);
      setShowCreate(false);
      setNewKey(''); setNewValue('true'); setNewType('BOOLEAN'); setNewDesc('');
      toast.success(`Flag '${newKey}' created`);
      router.refresh();
    } finally {
      setCreating(false);
    }
  }, [newKey, newValue, newType, newDesc, router]);

  const coreFlags = flags.filter((f) => PAYMENT_FLAG_KEYS.includes(f.key));
  const otherFlags = flags.filter((f) => !PAYMENT_FLAG_KEYS.includes(f.key));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground text-sm">Control payment system behaviour dynamically</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="size-4" />
          New Flag
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Create Feature Flag</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Key</label>
              <Input placeholder="deposit.manual_verification" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Value</label>
              <Input placeholder="true" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Type</label>
              <select
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'BOOLEAN' | 'STRING' | 'NUMBER')}
              >
                <option value="BOOLEAN">Boolean</option>
                <option value="STRING">String</option>
                <option value="NUMBER">Number</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Description</label>
              <Input placeholder="Optional description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button size="sm" onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 className="size-3.5 animate-spin" />}
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Payment System Flags</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {coreFlags.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">No payment flags found. Create them above.</p>
          )}
          {coreFlags.map((flag) => (
            <FlagRow
              key={flag.id}
              flag={flag}
              editingId={editingId}
              editValue={editValue}
              toggling={toggling}
              deleting={deleting}
              onToggle={handleToggle}
              onEdit={(f) => { setEditingId(f.id); setEditValue(f.value); }}
              onSaveValue={handleSaveValue}
              onCancelEdit={() => setEditingId(null)}
              onDelete={handleDelete}
            />
          ))}
        </CardContent>
      </Card>

      {otherFlags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Other Flags</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {otherFlags.map((flag) => (
              <FlagRow
                key={flag.id}
                flag={flag}
                editingId={editingId}
                editValue={editValue}
                toggling={toggling}
                deleting={deleting}
                onToggle={handleToggle}
                onEdit={(f) => { setEditingId(f.id); setEditValue(f.value); }}
                onSaveValue={handleSaveValue}
                onCancelEdit={() => setEditingId(null)}
                onDelete={handleDelete}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FlagRowProps {
  flag: FlagRow;
  editingId: string | null;
  editValue: string;
  toggling: string | null;
  deleting: string | null;
  onToggle: (f: FlagRow) => void;
  onEdit: (f: FlagRow) => void;
  onSaveValue: (f: FlagRow) => void;
  onCancelEdit: () => void;
  onDelete: (f: FlagRow) => void;
}

function FlagRow({
  flag,
  editingId,
  editValue,
  toggling,
  deleting,
  onToggle,
  onEdit,
  onSaveValue,
  onCancelEdit,
  onDelete,
}: FlagRowProps) {
  const isEditing = editingId === flag.id;
  const isToggling = toggling === flag.id;
  const isDeleting = deleting === flag.id;

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{flag.key}</span>
          <Badge variant="outline" className="text-xs">{flag.type}</Badge>
          {!flag.isActive && <Badge variant="secondary" className="text-xs">inactive</Badge>}
        </div>
        {flag.description && (
          <p className="text-muted-foreground mt-0.5 text-xs">{flag.description}</p>
        )}
        {isEditing ? (
          <div className="mt-2 flex gap-2">
            <Input
              className="h-7 text-xs"
              value={editValue}
              onChange={(e) => {
                const val = e.target.value;
                useFeatureFlagStore.setState((s) => ({ flags: { ...s.flags, [flag.key]: val } }));
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') onSaveValue(flag); if (e.key === 'Escape') onCancelEdit(); }}
              autoFocus
            />
            <Button size="sm" className="h-7 text-xs" onClick={() => onSaveValue(flag)} disabled={isToggling}>Save</Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onCancelEdit}>Cancel</Button>
          </div>
        ) : (
          <p className="text-muted-foreground mt-0.5 font-mono text-xs">
            value: <span className="text-foreground font-medium">{flag.value}</span>
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => onToggle(flag)}
          disabled={isToggling}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={flag.isActive ? 'Disable flag' : 'Enable flag'}
        >
          {isToggling ? (
            <Loader2 className="size-5 animate-spin" />
          ) : flag.isActive ? (
            <ToggleRight className="size-5 text-green-600" />
          ) : (
            <ToggleLeft className="size-5" />
          )}
        </button>
        {!isEditing && (
          <button
            onClick={() => onEdit(flag)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit value"
          >
            <Edit2 className="size-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(flag)}
          disabled={isDeleting}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Delete flag"
        >
          {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
