import bcrypt from 'bcryptjs';

import type { SafeUser } from '@/lib/auth';
import { ConflictError, UnauthorizedError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { userRepository } from '@/repositories/user.repository';
import type { LoginInput, RegisterInput } from '@/validations/auth';

const SALT_ROUNDS = 12;

export const authService = {
  async register(input: RegisterInput): Promise<SafeUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const supabase = await createSupabaseServerClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (signUpError) {
      throw new Error(signUpError.message);
    }

    const user = await userRepository.create({
      email: input.email,
      password: hashedPassword,
      fullName: input.fullName,
    });

    const { password: _password, ...safeUser } = user;
    return safeUser;
  },

  async login(input: LoginInput): Promise<SafeUser> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(input.password, user.password);
    if (!validPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const supabase = await createSupabaseServerClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (signInError) {
      throw new UnauthorizedError(signInError.message);
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  },

  async logout(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  },

  async loginWithGoogle(): Promise<{ url: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    });

    if (error || !data.url) {
      throw new Error('Failed to initiate Google login');
    }

    return { url: data.url };
  },

  async handleOAuthCallback(code: string): Promise<SafeUser> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user?.email) {
      throw new UnauthorizedError('OAuth callback failed');
    }

    let user = await userRepository.findByEmail(data.user.email);

    if (!user) {
      user = await userRepository.create({
        email: data.user.email,
        fullName:
          data.user.user_metadata?.full_name ??
          data.user.email.split('@')[0] ??
          'User',
        avatar: data.user.user_metadata?.avatar_url ?? null,
      });
    }

    const { password: _password, ...safeUser } = user;
    return safeUser;
  },
};
