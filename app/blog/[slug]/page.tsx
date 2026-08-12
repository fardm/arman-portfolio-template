import Link from 'next/link';
import { notFound } from 'next/navigation';
import {  getPost, getPosts, getPostCategories } from '@/lib/content';


function renderMarkdown(markdown: string) {
  return markdown.split('\n').map((line, index) => {
    if (line.startsWith('## ')) return <h2 key={index}>{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={index}>{line.slice(4)}</h3>;
    if (line.startsWith('- ')) return <li key={index}>{line.slice(2)}</li>;
    if (!line.trim()) return <div key={index} className="h-2" />;
    if (line.startsWith('<')) return <div key={index} dangerouslySetInnerHTML={{ __html: line }} />;
    return <p key={index}>{line}</p>;
  });
}



export async function generateStaticParams() {
  const posts = getPosts();
  if (posts.length === 0) return [{ slug: 'empty' }];
  return posts.map((post) => ({ slug: post.slug }));
}


export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const categories = getPostCategories();
  const posts = getPosts();
  const index = posts.findIndex((item) => item.slug === post.slug);
  const related = posts.filter((item) => item.slug !== post.slug && item.categories?.some((cat) => post.categories?.includes(cat))).slice(0, 2);
  return (
    <article className="section pt-10 md:pt-20">
      <div className="container">
        <h1 className="mb-10 text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-right">{post.title}</h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] items-start">
          <div>
            {post.cover && <img src={post.cover} alt={`تصویر پست ${post.title}`} className="w-full rounded-2xl border border-[var(--border)] shadow-sm" />}
            <div className="prose mt-10 max-w-none">{renderMarkdown(post.content)}</div>
          </div>

          <aside className="sticky top-24 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
             <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 border-b border-[var(--border)] pb-2">فهرست مطالب</h3>
                <div className="text-sm space-y-2 text-[var(--muted)]">
                  {post.content.split('\n').filter(line => line.startsWith('## ') || line.startsWith('### ')).length > 0 ? (
                    <ul className="space-y-1">
                      {post.content.split('\n').filter(line => line.startsWith('## ') || line.startsWith('### ')).map((line, i) => {
                        const isH3 = line.startsWith('### ');
                        const text = isH3 ? line.slice(4) : line.slice(3);
                        return <li key={i} className={isH3 ? "mr-3" : ""}>{text}</li>;
                      })}
                    </ul>
                  ) : (
                    <p>فهرستی یافت نشد.</p>
                  )}
                </div>
             </div>

             {post.categories && post.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3 border-b border-[var(--border)] pb-2">دسته‌ها</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((slug) => (
                      <span className="tag text-xs" key={slug}>
                        {categories.find((cat) => cat.slug === slug)?.name || slug}
                      </span>
                    ))}
                  </div>
                </div>
             )}
          </aside>
        </div>
        {related.length > 0 && (
          <section className="mt-20 border-t border-[var(--border)] pt-10">
            <h2 className="text-2xl font-bold">پست‌های مرتبط</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {related.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`} className="card p-5"><span className="text-[var(--primary)]">{item.title}</span><p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p></Link>)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
