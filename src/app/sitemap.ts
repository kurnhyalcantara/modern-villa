import type { MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/villas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const villas = await prisma.villa.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });

    const villaPages: MetadataRoute.Sitemap = villas.map((villa) => ({
      url: `${baseUrl}/villas/${villa.slug}`,
      lastModified: villa.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...villaPages];
  } catch {
    return staticPages;
  }
}
