import type { User } from '@/generated/prisma/client';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { userRepository } from '@/repositories/user.repository';

export type SafeUser = Omit<User, 'password'>;

export async function getCurrentUser(): Promise<SafeUser> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser?.email) {
    throw new UnauthorizedError();
  }

  const user = await userRepository.findByEmail(supabaseUser.email);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function getCurrentUserOrNull(): Promise<SafeUser | null> {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export function requireRole(user: SafeUser, role: User['role']): void {
  if (user.role !== role) {
    throw new ForbiddenError('Insufficient permissions');
  }
}
