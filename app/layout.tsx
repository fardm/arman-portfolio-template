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
    openGraph: { title: String(site.seoTitle), description: String(site.seoDescription), images: [String(site.ogImage)] },
  };
}

type FontConfig = {
  source: 'builtin' | 'google' | 'custom';
  name: string;
  googleFamily?: string;
  customFont?: { path: string; format: string; isVariable: boolean; weights?: number[] };
};

function buildFontStyles(site: Record<string, unknown>): { headTags: React.ReactNode; bodyFont: string } {
  const font = (site.font || site.fontFamily || 'Vazirmatn') as string;
  let config: FontConfig;
  try {
    config = typeof font === 'string' && font.startsWith('{') ? JSON.parse(font) : { source: 'builtin', name: font || 'Vazirmatn' };
  } catch {
    config = { source: 'builtin', name: font || 'Vazirmatn' };
  }

  if (config.source === 'google' && config.googleFamily) {
    const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(config.googleFamily)}&display=swap`;
    return {
      headTags: <link rel="preconnect" href="https://fonts.googleapis.com" />,
      bodyFont: config.name,
    };
  }

  if (config.source === 'custom' && config.customFont) {
    const cf = config.customFont;
    const range = cf.isVariable && cf.weights && cf.weights.length ? `font-weight: ${Math.min(...cf.weights)} ${Math.max(...cf.weights)};` : 'font-weight: 400;';
    const face = `@font-face{font-family:'${config.name}';src:url('${cf.path}') format('${cf.format}');font-display:swap;${range}}`;
    return {
      headTags: <style dangerouslySetInnerHTML={{ __html: face }} />,
      bodyFont: `'${config.name}', sans-serif`,
    };
  }

  return { headTags: null, bodyFont: font || 'Tahoma' };
}

const noFlash = `(function(){try{var t=localStorage.getItem('theme');var m=${JSON.stringify((getSite().theme as Record<string, string>)?.mode || 'dark')};if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}else{document.documentElement.setAttribute('data-theme',m==='light'?'light':'dark');}}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = getSite() as Record<string, unknown>;
  const theme = site.theme as Record<string, string>;
  const { headTags, bodyFont } = buildFontStyles(site);

  return (
    <html lang="fa" dir="rtl">
      <head>
        <style>{`:root{--primary:${theme.primary};--background:${theme.background};--foreground:${theme.foreground};--muted:${theme.muted};--border:${theme.border};--accent:${theme.accent};}`}</style>
        {headTags}
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body style={{ fontFamily: bodyFont }}>
        <Header site={site} />
        <main>{children}</main>
        <Footer site={site} />
      </body>
    </html>
  );
}
