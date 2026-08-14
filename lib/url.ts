
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://example.github.io';
}
export function getBasePath(): string {
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
