'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Upload,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/currency';
import { Separator } from '@/components/ui/separator';

interface ReceiverAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentType: string;
  qrImageUrl: string | null;
  instructions: string | null;
}

interface DepositDetailProps {
  deposit: {
    id: string;
    amount: unknown;
    status: string;
    evidenceUrl: string | null;
    adminNote: string | null;
    createdAt: Date;
    receiverAccount: ReceiverAccount | null;
  };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PENDING: {
    label: 'Awaiting Payment',
    icon: <Clock className="size-4" />,
    color: 'text-yellow-600',
    variant: 'outline',
  },
  PENDING_VERIFICATION: {
    label: 'Pending Verification',
    icon: <Clock className="size-4" />,
    color: 'text-blue-600',
    variant: 'secondary',
  },
  APPROVED: {
    label: 'Approved',
    icon: <CheckCircle2 className="size-4" />,
    color: 'text-green-600',
    variant: 'default',
  },
  REJECTED: {
    label: 'Rejected',
    icon: <XCircle className="size-4" />,
    color: 'text-red-600',
    variant: 'destructive',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <XCircle className="size-4" />,
    color: 'text-gray-500',
    variant: 'secondary',
  },
};

export function DepositDetailContent({ deposit }: DepositDetailProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const amount = Number(deposit.amount);
  const status = STATUS_CONFIG[deposit.status] ?? STATUS_CONFIG['PENDING']!;

  const copyToClipboard = useCallback((text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }, []);

  const handleFile = useCallback((f: File) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) {
      toast.error('Invalid file type. Use jpg, jpeg, png, or webp.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(30);
      const uploadRes = await fetch('/api/upload/evidence', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(60);
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        toast.error(uploadData.message ?? 'Upload failed');
        return;
      }

      const evidenceRes = await fetch(`/api/finance/deposit/${deposit.id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evidenceUrl: uploadData.data.url }),
      });

      setUploadProgress(90);
      const evidenceData = await evidenceRes.json();

      if (!evidenceRes.ok) {
        toast.error(evidenceData.message ?? 'Failed to submit evidence');
        return;
      }

      setUploadProgress(100);
      toast.success('Evidence submitted! Your deposit is now pending verification.');
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [file, deposit.id, router]);

  const canUpload = deposit.status === 'PENDING' && !deposit.evidenceUrl;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Complete Deposit</h1>
          <p className="text-muted-foreground text-sm">
            Transaction ID: <span className="font-mono text-xs">{deposit.id}</span>
          </p>
        </div>
        <Badge variant={status.variant} className="gap-1.5 px-3 py-1">
          {status.icon}
          {status.label}
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Deposit Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-ocean text-3xl font-bold">{formatRupiah(amount)}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {new Date(deposit.createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {deposit.receiverAccount && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transfer To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Bank / Wallet</span>
                <span className="font-medium">{deposit.receiverAccount.bankName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Account Name</span>
                <span className="font-medium">{deposit.receiverAccount.accountName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Account Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">
                    {deposit.receiverAccount.accountNumber}
                  </span>
                  <button
                    onClick={() => copyToClipboard(deposit.receiverAccount!.accountNumber)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Copy account number"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {deposit.receiverAccount.qrImageUrl && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <p className="text-muted-foreground text-xs">Scan QR to pay</p>
                <div className="relative size-40 overflow-hidden rounded-lg border">
                  <Image
                    src={deposit.receiverAccount.qrImageUrl}
                    alt="Payment QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {deposit.receiverAccount.instructions && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Instructions
                </p>
                <p className="mt-1 text-sm">{deposit.receiverAccount.instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {deposit.status === 'REJECTED' && deposit.adminNote && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800">Rejection reason</p>
            <p className="mt-0.5 text-sm text-red-700">{deposit.adminNote}</p>
          </div>
        </div>
      )}

      {deposit.status === 'PENDING_VERIFICATION' && (
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Clock className="mt-0.5 size-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Under review</p>
            <p className="mt-0.5 text-sm text-blue-700">
              Your payment evidence is being reviewed by our team. This usually takes 1–2 business hours.
            </p>
          </div>
        </div>
      )}

      {deposit.status === 'APPROVED' && (
        <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Deposit approved</p>
            <p className="mt-0.5 text-sm text-green-700">
              {formatRupiah(amount)} has been credited to your wallet.
            </p>
          </div>
        </div>
      )}

      {canUpload && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upload Transfer Evidence</CardTitle>
            <p className="text-muted-foreground text-sm">
              Upload a screenshot or photo of your transfer confirmation.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragOver
                  ? 'border-ocean bg-ocean/5'
                  : 'border-muted-foreground/30 hover:border-muted-foreground/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="relative h-48 w-full overflow-hidden rounded-md">
                  <Image src={preview} alt="Evidence preview" fill className="object-contain" />
                </div>
              ) : (
                <>
                  <Upload className="text-muted-foreground mb-2 size-8" />
                  <p className="text-sm font-medium">Drop file here or click to browse</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    JPG, PNG, WEBP — max 5MB
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleInputChange}
            />

            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Uploading…</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-ocean h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!file || uploading}
              className="bg-ocean hover:bg-ocean/90 w-full text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Submit Evidence
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {deposit.evidenceUrl && deposit.status !== 'PENDING' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Submitted Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-56 w-full overflow-hidden rounded-md border">
              <Image
                src={deposit.evidenceUrl}
                alt="Payment evidence"
                fill
                className="object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
