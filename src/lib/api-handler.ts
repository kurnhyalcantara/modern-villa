import { NextRequest, NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-response';
import { AppError, ValidationError } from '@/lib/errors';

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ValidationError) {
        return errorResponse(error.message, error.statusCode, error.errors);
      }

      if (error instanceof AppError) {
        return errorResponse(error.message, error.statusCode);
      }

      console.error('Unhandled error:', error);
      return errorResponse('Internal server error', 500);
    }
  };
}
