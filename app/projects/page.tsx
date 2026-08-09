import { getCategories, getProjects } from '@/lib/content';
import { ProjectBrowser } from '@/components/project-browser';
export default function ProjectsPage() { return <section className="section"><div className="container"><p className="eyebrow">آرشیو کارها</p><h1 className="mt-2 text-5xl font-black">پروژه‌ها</h1><p className="mt-5 max-w-xl text-[var(--muted)]">منتخبی از پروژه‌هایی که با دقت، کنجکاوی و همکاری ساخته‌ام.</p><div className="mt-12"><ProjectBrowser projects={getProjects()} categories={getCategories()}/></div></div></section>; }
