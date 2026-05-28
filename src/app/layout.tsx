import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Geist, Geist_Mono } from 'next/font/google';

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { getCurrentUserOrNull } from '@/lib/auth';
import { FeatureFlagProvider } from '@/providers/feature-flag-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { featureFlagService } from '@/services/feature-flag.service';
import { i18nService } from '@/services/i18n.service';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Modern Villa — Premium Villa Booking',
    template: '%s | Modern Villa',
  },
  description:
    'Discover and book premium villas for your perfect getaway. Handpicked properties with verified reviews.',
  openGraph: {
    type: 'website',
    siteName: 'Modern Villa',
    title: 'Modern Villa — Premium Villa Booking',
    description:
      'Discover and book premium villas for your perfect getaway. Handpicked properties with verified reviews.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentUser, cookieStore] = await Promise.all([
    getCurrentUserOrNull(),
    cookies(),
  ]);

  const localeCookie = cookieStore.get('locale')?.value;
  const locale = localeCookie ?? (await i18nService.getDefaultLocale());

  const [languages, translations, featureFlags] = await Promise.all([
    i18nService.getActiveLanguages(),
    i18nService.getDictionary(locale),
    featureFlagService.getActiveFlags(),
  ]);

  const navUser = currentUser
    ? {
        fullName: currentUser.fullName,
        email: currentUser.email,
        avatar: currentUser.avatar,
        role: currentUser.role as 'USER' | 'ADMIN',
      }
    : null;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-background text-foreground flex min-h-screen flex-col antialiased"
        suppressHydrationWarning
      >
        <FeatureFlagProvider flags={featureFlags}>
          <I18nProvider
            locale={locale}
            languages={languages}
            translations={translations}
          >
            <Navbar user={navUser} />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="bottom-right" richColors closeButton />
          </I18nProvider>
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
