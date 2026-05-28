'use client';

import { Home, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

import { useTranslation } from '@/hooks/use-translation';

const exploreLinks = [
  { href: '/villas', labelKey: 'footer.explore.all_villas' },
  { href: '/villas?location=Bali', labelKey: 'footer.explore.bali_villas' },
  { href: '/villas?location=Ubud', labelKey: 'footer.explore.ubud_retreats' },
  {
    href: '/villas?location=Seminyak',
    labelKey: 'footer.explore.seminyak_stays',
  },
];

const companyLinks = [
  { href: '#', labelKey: 'footer.company.about' },
  { href: '#', labelKey: 'footer.company.careers' },
  { href: '#', labelKey: 'footer.company.privacy' },
  { href: '#', labelKey: 'footer.company.terms' },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-muted/50 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-ocean flex size-8 items-center justify-center rounded-lg">
                <Home className="text-ocean-foreground size-4" />
              </div>
              <span className="text-lg font-semibold">Modern Villa</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              {t('footer.explore')}
            </h3>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              {t('footer.company')}
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground flex items-center gap-2 text-sm">
                <Mail className="size-4 shrink-0" />
                hello@modernvilla.com
              </li>
              <li className="text-muted-foreground flex items-center gap-2 text-sm">
                <Phone className="size-4 shrink-0" />
                +62 812 3456 7890
              </li>
              <li className="text-muted-foreground flex items-center gap-2 text-sm">
                <MapPin className="size-4 shrink-0" />
                Bali, Indonesia
              </li>
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
          {t('footer.copyright', { year: String(new Date().getFullYear()) })}
        </div>
      </div>
    </footer>
  );
}
