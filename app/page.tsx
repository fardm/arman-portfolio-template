import Link from 'next/link';
import { getCategories, getProjects, getSite } from '@/lib/content';
import { ProjectCard } from '@/components/project-card';
import { Icon } from '@/src/icons';

export default function Home() {
  const site = getSite();
  const categories = getCategories();
  const featured = getProjects().slice(0, 6);

  const hero = site.hero as Record<string, string> | undefined;
  const socials = site.socials as Record<string, string> | undefined;

  const name = hero?.name || String(site.name);
  const jobTitle = hero?.jobTitle || String(site.title);
  const about = hero?.about || String(site.bio);
  const profileImage = hero?.profileImage || String(site.profileImage);

  const ghHref = (hero?.github ?? socials?.github) || '';
  const liHref = (hero?.linkedin ?? socials?.linkedin) || '';
  const igHref = hero?.instagram || '';
  const tgHref = hero?.telegram || '';
  const ytHref = (hero?.youtube ?? socials?.youtube) || '';
  const twHref = (hero?.twitter ?? socials?.twitter) || '';

  const socialLinks = [
    ghHref.trim() !== ''
      ? {
          label: 'GitHub',
          href: ghHref,
          icon: (
            <Icon name="github" width="22" height="22" />
          ),
        }
      : null,
    igHref.trim() !== ''
      ? {
          label: 'Instagram',
          href: igHref,
          icon: (
            <Icon name="instagram" width="22" height="22" />
          ),
        }
      : null,
    tgHref.trim() !== ''
      ? {
          label: 'Telegram',
          href: tgHref,
          icon: (
            <Icon name="telegram" width="22" height="22" />
          ),
        }
      : null,
    liHref.trim() !== ''
      ? {
          label: 'LinkedIn',
          href: liHref,
          icon: (
            <Icon name="linkedin" width="22" height="22" />
          ),
        }
      : null,
    ytHref.trim() !== ''
      ? {
          label: 'YouTube',
          href: ytHref,
          icon: (
            <Icon name="youtube" width="22" height="22" />
          ),
        }
      : null,
    twHref.trim() !== ''
      ? {
          label: 'Twitter (X)',
          href: twHref,
          icon: (
            <Icon name="x" width="22" height="22" />
          ),
        }
      : null,
  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode }[];

  return (
    <>
      {/* Hero Section */}
      <section className="section">
        <div className="container">
          <div className="hero-grid">
            {/* Right: Profile Card */}
            <div className="hero-profile">
              <div className="hero-avatar-wrap">
                <img
                  src={profileImage}
                  alt={`تصویر ${name}`}
                  className="hero-avatar"
                />
              </div>
              <h1 className="hero-name">{name}</h1>
              <p className="hero-job-title">{jobTitle}</p>
              {socialLinks.length > 0 && (
                <div className="hero-socials">
                  {socialLinks.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="hero-social-btn"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Left: About Box */}
            <div className="hero-about-box">
              <div className="hero-about-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                درباره من
              </div>
              <p className="hero-about-text">{about}</p>
              <Link className="button" style={{width: 'fit-content', padding: '8px 20px 8px 10px'}} href="/resume">
                رزومه من <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left"> <path d="m15 18-6-6 6-6" /> </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section border-t border-[var(--border)]">
        <div className="container">
          <div className="mb-9 text-center">
            <h2 className="mt-2 text-3xl font-bold">پروژه‌ها</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={project.slug} project={project} categories={categories} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link className="button" style={{padding: '8px 20px 8px 10px'}} href="/projects">
              مشاهده همه <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left"> <path d="m15 18-6-6 6-6" /> </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
