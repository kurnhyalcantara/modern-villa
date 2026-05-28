import { NextResponse } from 'next/server';

import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  PaginatedResponse,
} from '@/types/api';

export function successResponse<T>(data: T, status = 200) {
  const body: ApiSuccessResponse<T> = { success: true, data };
  return NextResponse.json(body, { status });
}

export function errorResponse(
  message: string,
  status = 500,
  errors?: Record<string, string[]>,
) {
  const body: ApiErrorResponse = { success: false, message };
  if (errors) {
    body.errors = errors;
  }
  return NextResponse.json(body, { status });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  const body: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  return NextResponse.json(body, { status: 200 });
}
