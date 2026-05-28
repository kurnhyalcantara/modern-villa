import type { Metadata } from 'next';

import { getCurrentUser, requireRole } from '@/lib/auth';
import { paymentReceiverAccountService } from '@/services/payment-receiver-account.service';

import { ReceiverAccountsContent } from './receiver-accounts-content';

export const metadata: Metadata = { title: 'Payment Receiver Accounts' };

export default async function ReceiverAccountsPage() {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');
  const accounts = await paymentReceiverAccountService.getAll();
  return <ReceiverAccountsContent initialAccounts={accounts} />;
}
