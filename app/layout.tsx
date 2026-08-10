import type { Metadata } from 'next';
import './globals.css';
import { getSite } from '@/lib/content';
import { Header, Footer } from '@/components/layout';

export const dynamic = 'force-static';
export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    title: String(site.seoTitle),
    description: String(site.seoDescription),
    metadataBase: new URL('https://example.github.io'),
    icons: site.favicon ? { icon: String(site.favicon) } : undefined,
    openGraph: { title: String(site.seoTitle), description: String(site.seoDescription), images: [String(site.ogImage)] },
  };
}

type FontConfig = {
  source: 'builtin' | 'google' | 'custom';
  name: string;
  googleFamily?: string;
  customFont?: { path: string; format: string; isVariable: boolean; weights?: number[] };
};

function buildFontStyles(site: Record<string, unknown>): { headTags: React.ReactNode; bodyFont: string; headingFont: string } {
  const fonts = (site.fonts as FontConfig[]) || [];
  const typo = (site.typography as Record<string, string>) || {};

  const bodyFontName = typo.bodyFont || 'Tahoma';
  const headingFontName = typo.headingFont || bodyFontName;

  const headTags: React.ReactNode[] = [];

  // Find configurations for selected fonts
  const bodyConfig = fonts.find(f => f.name === bodyFontName);
  const headingConfig = fonts.find(f => f.name === headingFontName);

  const processConfig = (config: FontConfig | undefined) => {
    if (!config) return;
    if (config.source === 'google' && config.googleFamily) {
      headTags.push(<link key={config.name} rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(config.googleFamily)}&display=swap`} />);
    } else if (config.source === 'custom' && config.customFont) {
      const cf = config.customFont;
      const range = cf.isVariable && cf.weights && cf.weights.length ? `font-weight: ${Math.min(...cf.weights)} ${Math.max(...cf.weights)};` : 'font-weight: 400;';
      const face = `@font-face{font-family:'${config.name}';src:url('${cf.path}') format('${cf.format}');font-display:swap;${range}}`;
      headTags.push(<style key={config.name} dangerouslySetInnerHTML={{ __html: face }} />);
    }
  };

  processConfig(bodyConfig);
  if (headingConfig !== bodyConfig) processConfig(headingConfig);

  return {
    headTags: <>{headTags}</>,
    bodyFont: bodyConfig && bodyConfig.source !== 'builtin' ? `'${bodyFontName}', Tahoma, sans-serif` : bodyFontName,
    headingFont: headingConfig && headingConfig.source !== 'builtin' ? `'${headingFontName}', Tahoma, sans-serif` : headingFontName
  };
}

const noFlash = `(function(){try{var t=localStorage.getItem('theme');var m=(typeof window !== 'undefined') ? ${JSON.stringify((getSite().theme as Record<string, string>)?.mode || 'dark')} : 'dark';if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}else{document.documentElement.setAttribute('data-theme',m==='light'?'light':'dark');}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = getSite() as Record<string, unknown>;
  const theme = site.theme as Record<string, string>;
  const { headTags, bodyFont, headingFont } = buildFontStyles(site);

  return (
    <html lang="fa" dir="rtl" data-theme="dark" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
        :root{--primary:${theme.primary || '#b8f542'};--background:${(theme.dark as any)?.background || '#0b111b'};--foreground:${(theme.dark as any)?.foreground || '#f5f7fa'};--muted:${(theme.dark as any)?.muted || '#9ba6b5'};--border:${(theme.dark as any)?.border || '#263243'};--accent:${(theme.dark as any)?.accent || '#8adcf0'};--font-heading:${headingFont};}
        :root[data-theme="light"]{--primary:${theme.primary || '#1e4431'};--background:${(theme.light as any)?.background || '#f4f6f5'};--foreground:${(theme.light as any)?.foreground || '#1a2530'};--muted:${(theme.light as any)?.muted || '#5b6b78'};--border:${(theme.light as any)?.border || '#d4dde0'};--accent:${(theme.light as any)?.accent || '#2a7a9b'};}
        ` }} />
        {headTags}
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body style={{ fontFamily: bodyFont }} suppressHydrationWarning>
        <Header site={site} />
        <main>{children}</main>
        <Footer site={site} />
      </body>
    </html>
  );
}
