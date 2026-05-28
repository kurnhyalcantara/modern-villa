import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser } from '@/lib/auth';
import { validate } from '@/lib/validate';
import { financeService } from '@/services/finance.service';
import { uploadEvidenceSchema } from '@/validations/finance';

export const POST = withErrorHandler(
  async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const user = await getCurrentUser();
    const params = await context.params;
    const depositId = params['id']!;
    const body = await request.json();
    const input = validate(uploadEvidenceSchema, body);
    const deposit = await financeService.uploadEvidence(user.id, depositId, input);
    return successResponse(deposit);
  },
);
