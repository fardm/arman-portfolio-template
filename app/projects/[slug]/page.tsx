import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategories, getProject, getProjects } from '@/lib/content';

function renderMarkdown(markdown: string) {
  return markdown.split('\n').map((line, index) => {
    if (line.startsWith('## ')) return <h2 key={index}>{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={index}>{line.slice(4)}</h3>;
    if (line.startsWith('- ')) return <li key={index}>{line.slice(2)}</li>;
    if (!line.trim()) return <div key={index} className="h-2" />;
    return <p key={index}>{line}</p>;
  });
}

function youtubeEmbedId(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.slice(8);
      if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.slice(8);
      if (parsed.searchParams.get('v')) return parsed.searchParams.get('v') || '';
    }
  } catch {}
  const direct = url.match(/^[a-zA-Z0-9_-]{11}$/);
  return direct ? url : '';
}

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);
  if (!project) notFound();
  const categories = getCategories();
  const projects = getProjects();
  const index = projects.findIndex((item) => item.slug === project.slug);
  const related = projects.filter((item) => item.slug !== project.slug && item.categories?.some((cat) => project.categories?.includes(cat))).slice(0, 2);
  const youtubeId = project.videoMode === 'youtube' ? youtubeEmbedId(project.videoUrl || '') : '';
  return (
    <article className="section">
      <div className="container">
        <Link href="/projects" className="text-sm text-[var(--primary)]">← بازگشت به پروژه‌ها</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-7 flex flex-wrap gap-2">
              {(project.categories || []).map((slug) => <span className="tag" key={slug}>{categories.find((cat) => cat.slug === slug)?.name || slug}</span>)}
            </div>
            <h1 className="text-5xl font-black leading-tight">{project.title}</h1>
            <p className="mt-5 text-xl text-[var(--muted)]">{project.description}</p>
            {project.cover && <img src={project.cover} alt={`تصویر پروژه ${project.title}`} className="mt-10 w-full rounded-2xl border border-[var(--border)]" />}
            {youtubeId && <iframe title={`ویدیوی ${project.title}`} src={`https://www.youtube.com/embed/${youtubeId}`} className="mt-8 aspect-video w-full rounded-2xl border border-[var(--border)]" allowFullScreen />}
            {project.videoMode === 'embed' && project.videoUrl && <iframe title={`ویدیوی ${project.title}`} src={project.videoUrl} className="mt-8 aspect-video w-full rounded-2xl border border-[var(--border)]" allowFullScreen />}
            <div className="prose mt-10">{renderMarkdown(project.content)}</div>
          </div>
          <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <dl className="space-y-5 text-sm">
              <div><dt className="text-[var(--muted)]">سال</dt><dd>{project.year || '—'}</dd></div>
              <div><dt className="text-[var(--muted)]">مشتری</dt><dd>{project.client || '—'}</dd></div>
              <div><dt className="text-[var(--muted)]">نقش</dt><dd>{project.role || '—'}</dd></div>
              <div><dt className="text-[var(--muted)]">فناوری‌ها</dt><dd>{project.technologies?.join('، ') || '—'}</dd></div>
            </dl>
          </aside>
        </div>
        {related.length > 0 && (
          <section className="mt-20 border-t border-[var(--border)] pt-10">
            <h2 className="text-2xl font-bold">پروژه‌های مرتبط</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {related.map((item) => <Link key={item.slug} href={`/projects/${item.slug}`} className="card p-5"><span className="text-[var(--primary)]">{item.title}</span><p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p></Link>)}
            </div>
          </section>
        )}
        <div className="mt-12 flex justify-between border-t border-[var(--border)] pt-6 text-sm">
          {projects[index - 1] ? <Link className="text-[var(--primary)]" href={`/projects/${projects[index - 1].slug}`}>← پروژه قبلی</Link> : <span />}
          {projects[index + 1] ? <Link className="text-[var(--primary)]" href={`/projects/${projects[index + 1].slug}`}>پروژه بعدی →</Link> : <span />}
        </div>
      </div>
    </article>
  );
}
