import Link from 'next/link';
import { getCategories, getProjects, getSite } from '@/lib/content';
import { ProjectCard } from '@/components/project-card';

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

  const socialLinks = [
    ghHref.trim() !== ''
      ? {
          label: 'GitHub',
          href: ghHref,
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          ),
        }
      : null,
    igHref.trim() !== ''
      ? {
          label: 'Instagram',
          href: igHref,
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
          ),
        }
      : null,
    tgHref.trim() !== ''
      ? {
          label: 'Telegram',
          href: tgHref,
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden>
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          ),
        }
      : null,
    liHref.trim() !== ''
      ? {
          label: 'LinkedIn',
          href: liHref,
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          ),
        }
      : null,
    ytHref.trim() !== ''
      ? {
          label: 'YouTube',
          href: ytHref,
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden>
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
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
                رزومه من <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
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
              مشاهده همه <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
