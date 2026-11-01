export const siteConfig = {
  siteName: 'Pixelo',
  domain: 'https://pixelo.tools',
  contactEmail: 'hello@pixelo.tools',
  authorName: 'Elena Rostova',
  authorRole: 'Imaging & Web Performance Editor',
  accentColor: '#1A1A1A',
  ENABLE_ADS: false,
} as const;

export type SiteConfig = typeof siteConfig;
