import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';
import { financeService } from '@/services/finance.service';

import { DepositDetailContent } from './deposit-detail-content';

export const metadata: Metadata = { title: 'Complete Deposit' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DepositDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();

  let deposit;
  try {
    deposit = await financeService.getDepositById(user.id, id);
  } catch {
    notFound();
  }

  return <DepositDetailContent deposit={deposit} />;
}
