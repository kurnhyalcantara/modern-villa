import { NextRequest } from 'next/server';

import { withErrorHandler } from '@/lib/api-handler';
import { successResponse } from '@/lib/api-response';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { BadRequestError } from '@/lib/errors';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await getCurrentUser();
  requireRole(user, 'ADMIN');

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    throw new BadRequestError('No file provided');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new BadRequestError('Invalid file type. Allowed: jpg, jpeg, png, webp');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new BadRequestError('File size exceeds 2MB limit');
  }

  const supabase = await createSupabaseAdminClient();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  const path = `qr/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage
    .from('payment-qr')
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) {
    throw new BadRequestError(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('payment-qr')
    .getPublicUrl(path);

  return successResponse({ url: urlData.publicUrl }, 201);
});
