'use client';

import {
  Check,
  Edit2,
  Loader2,
  Plus,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface Account {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentType: string;
  qrImageUrl: string | null;
  instructions: string | null;
  isActive: boolean;
  isDefault: boolean;
  displayOrder: number;
}

interface Props {
  initialAccounts: Account[];
}

const EMPTY_FORM = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  paymentType: 'BANK_TRANSFER' as 'BANK_TRANSFER' | 'E_WALLET',
  qrImageUrl: '',
  instructions: '',
  isActive: true,
  isDefault: false,
  displayOrder: 0,
};

export function ReceiverAccountsContent({ initialAccounts }: Props) {
  const router = useRouter();
  const qrInputRef = useRef<HTMLInputElement>(null);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

  const handleQrUpload = useCallback(async (file: File) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Invalid file type'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('File too large (max 2MB)'); return; }

    setUploadingQr(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/qr', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message ?? 'Upload failed'); return; }
      setForm((f) => ({ ...f, qrImageUrl: data.data.url }));
      setQrPreview(URL.createObjectURL(file));
      toast.success('QR image uploaded');
    } finally {
      setUploadingQr(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.bankName || !form.accountName || !form.accountNumber) {
      toast.error('Bank name, account name and account number are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        qrImageUrl: form.qrImageUrl || null,
        instructions: form.instructions || null,
      };

      if (editingId) {
        const res = await fetch(`/api/payment-receiver-accounts/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.message ?? 'Update failed'); return; }
        setAccounts((prev) => prev.map((a) => (a.id === editingId ? (data.data as Account) : a)));
        toast.success('Account updated');
      } else {
        const res = await fetch('/api/payment-receiver-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.message ?? 'Create failed'); return; }
        setAccounts((prev) => [...prev, data.data as Account]);
        toast.success('Account created');
      }

      setShowCreate(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setQrPreview(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }, [form, editingId, router]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this receiver account?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/payment-receiver-accounts/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Delete failed'); return; }
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success('Account deleted');
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }, [router]);

  const handleToggleActive = useCallback(async (account: Account) => {
    setToggling(account.id);
    try {
      const res = await fetch(`/api/payment-receiver-accounts/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !account.isActive }),
      });
      if (!res.ok) { toast.error('Update failed'); return; }
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, isActive: !a.isActive } : a)),
      );
      toast.success(`Account ${account.isActive ? 'deactivated' : 'activated'}`);
      router.refresh();
    } finally {
      setToggling(null);
    }
  }, [router]);

  const handleSetDefault = useCallback(async (account: Account) => {
    setToggling(account.id);
    try {
      const res = await fetch(`/api/payment-receiver-accounts/${account.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) { toast.error('Update failed'); return; }
      setAccounts((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === account.id })),
      );
      toast.success('Default account set');
      router.refresh();
    } finally {
      setToggling(null);
    }
  }, [router]);

  const startEdit = useCallback((account: Account) => {
    setEditingId(account.id);
    setForm({
      bankName: account.bankName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      paymentType: account.paymentType as 'BANK_TRANSFER' | 'E_WALLET',
      qrImageUrl: account.qrImageUrl ?? '',
      instructions: account.instructions ?? '',
      isActive: account.isActive,
      isDefault: account.isDefault,
      displayOrder: account.displayOrder,
    });
    setQrPreview(account.qrImageUrl);
    setShowCreate(true);
  }, []);

  const cancelForm = useCallback(() => {
    setShowCreate(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setQrPreview(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Receiver Accounts</h1>
          <p className="text-muted-foreground text-sm">
            Manage bank/e-wallet accounts shown during manual deposit
          </p>
        </div>
        <Button size="sm" onClick={() => { setShowCreate(true); setEditingId(null); setForm(EMPTY_FORM); setQrPreview(null); }}>
          <Plus className="size-4" />
          Add Account
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">{editingId ? 'Edit Account' : 'New Account'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Bank / Wallet Name *</label>
                <Input value={form.bankName} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} placeholder="BCA, GoPay, OVO…" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Account Name *</label>
                <Input value={form.accountName} onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))} placeholder="Name on account" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Account Number *</label>
                <Input value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))} placeholder="Account number" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Payment Type</label>
                <select
                  className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                  value={form.paymentType}
                  onChange={(e) => setForm((f) => ({ ...f, paymentType: e.target.value as 'BANK_TRANSFER' | 'E_WALLET' }))}
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="E_WALLET">E-Wallet</option>
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium">Transfer Instructions</label>
                <Input value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} placeholder="Optional transfer instructions" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Display Order</label>
                <Input type="number" min={0} value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} />
              </div>
              <div className="flex items-end gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                  Active
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
                  Default
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">QR Image</label>
              <div className="flex items-center gap-3">
                {qrPreview ? (
                  <div className="relative size-20 overflow-hidden rounded border">
                    <Image src={qrPreview} alt="QR Preview" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="bg-muted flex size-20 items-center justify-center rounded border">
                    <Upload className="text-muted-foreground size-5" />
                  </div>
                )}
                <div>
                  <input
                    ref={qrInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleQrUpload(f); }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={uploadingQr}
                    onClick={() => qrInputRef.current?.click()}
                  >
                    {uploadingQr ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    Upload QR
                  </Button>
                  <p className="text-muted-foreground mt-1 text-xs">PNG/JPG — max 2MB</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Account'}
              </Button>
              <Button size="sm" variant="outline" onClick={cancelForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {accounts.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground text-sm">No receiver accounts yet.</p>
            </CardContent>
          </Card>
        )}
        {accounts.map((account) => (
          <Card key={account.id} className={account.isActive ? '' : 'opacity-60'}>
            <CardContent className="flex items-start gap-4 pt-4">
              {account.qrImageUrl ? (
                <div className="relative size-14 shrink-0 overflow-hidden rounded border">
                  <Image src={account.qrImageUrl} alt="QR" fill className="object-contain" />
                </div>
              ) : (
                <div className="bg-muted flex size-14 shrink-0 items-center justify-center rounded border text-xs text-center leading-tight p-1">
                  No QR
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{account.bankName}</span>
                  <Badge variant="outline" className="text-xs">
                    {account.paymentType === 'BANK_TRANSFER' ? 'Bank' : 'E-Wallet'}
                  </Badge>
                  {account.isDefault && (
                    <Badge className="gap-1 text-xs">
                      <Star className="size-3" /> Default
                    </Badge>
                  )}
                  {!account.isActive && (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{account.accountName}</p>
                <p className="font-mono text-sm font-medium">{account.accountNumber}</p>
                {account.instructions && (
                  <p className="text-muted-foreground mt-1 text-xs">{account.instructions}</p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => startEdit(account)}
                >
                  <Edit2 className="size-3" /> Edit
                </Button>
                {!account.isDefault && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={toggling === account.id}
                    onClick={() => handleSetDefault(account)}
                  >
                    <Star className="size-3" /> Default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={account.isActive ? 'outline' : 'default'}
                  className="h-7 text-xs"
                  disabled={toggling === account.id}
                  onClick={() => handleToggleActive(account)}
                >
                  {toggling === account.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : account.isActive ? (
                    'Deactivate'
                  ) : (
                    <><Check className="size-3" /> Activate</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-7 text-xs"
                  disabled={deleting === account.id}
                  onClick={() => handleDelete(account.id)}
                >
                  {deleting === account.id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                </Button>
              </div>
            </CardContent>
            {accounts.indexOf(account) < accounts.length - 1 && <Separator />}
          </Card>
        ))}
      </div>
    </div>
  );
}
