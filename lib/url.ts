
import siteConfig from '@/content/site.json';

export function getBaseUrl(): string {
  if (siteConfig && siteConfig.siteUrl) {
    return siteConfig.siteUrl.replace(/\/$/, '');
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://example.github.io';
}

export function getBasePath(): string {
  if (process.env.NODE_ENV === 'development') return '';
  if (siteConfig && siteConfig.siteUrl) {
    try {
      const urlObj = new URL(siteConfig.siteUrl);
      const pathname = urlObj.pathname;
      if (pathname !== '/') {
        return pathname.replace(/\/$/, '');
      }
      return '';
    } catch (e) {}
  }
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}
export function assetUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (process.env.NODE_ENV === 'development') return path;
  const base = getBasePath();
  if (base && path.startsWith('/')) {
    return `${base}${path}`;
  }
  return path;
}
