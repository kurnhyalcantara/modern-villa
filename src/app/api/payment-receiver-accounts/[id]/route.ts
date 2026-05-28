import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { adminLogRepository } from '@/repositories/admin-log.repository';
import { paymentReceiverAccountService } from '@/services/payment-receiver-account.service';
import { updateReceiverAccountSchema } from '@/validations/payment-receiver-account';

export const PATCH = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const user = await getCurrentUser();
    requireRole(user, 'ADMIN');
    const params = await context.params;
    const id = params['id']!;
    const body = await request.json();
    const input = validate(updateReceiverAccountSchema, body);
    const account = await paymentReceiverAccountService.update(id, input);

    await adminLogRepository.create({
      admin: { connect: { id: user.id } },
      action: `Updated payment receiver account: ${account.bankName} (${account.accountNumber})`,
    });

    return successResponse(account);
  },
);

export const DELETE = withErrorHandler(
  async (_request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const user = await getCurrentUser();
    requireRole(user, 'ADMIN');
    const params = await context.params;
    const id = params['id']!;
    await paymentReceiverAccountService.delete(id);

    await adminLogRepository.create({
      admin: { connect: { id: user.id } },
      action: `Deleted payment receiver account: ${id}`,
    });

    return successResponse({ success: true });
  },
);
