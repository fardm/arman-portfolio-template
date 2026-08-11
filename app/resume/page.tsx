import { getResume, getSite } from '@/lib/content';

export default function ResumePage() {
  const resume = getResume() as {
    summary: string;
    experience: { id: string; title: string; company: string; period: string; description: string }[];
    education: { id: string; title: string; school: string; period: string }[];
    skills: string[];
    tools: string[];
    languages: string[];
    location?: string;
    maritalStatus?: string;
    militaryService?: string;
    birthDate?: string;
    phone?: string;
    email?: string;
    telegram?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
    twitter?: string;
    instagram?: string;
  };
  const site = getSite();

  const infos = [
    { label: 'موقعیت', value: resume.location, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> },
    { label: 'تولد', value: resume.birthDate, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> },
    { label: 'وضعیت تاهل', value: resume.maritalStatus, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
    { label: 'وضعیت سربازی', value: resume.militaryService, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> },
    { label: 'تماس', value: resume.phone, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> },
    { label: 'ایمیل', value: resume.email, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
  ].filter(i => i.value && i.value.trim() !== '');

  const links = [
    { label: 'تلگرام', value: resume.telegram, link: `https://t.me/${resume.telegram}`, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden> <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/> </svg> },
    { label: 'لینکدین', value: resume.linkedin, link: `https://linkedin.com/in/${resume.linkedin}`, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden> <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/> </svg> },
    { label: 'گیت‌هاب', value: resume.github, link: `https://github.com/${resume.github}`, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden> <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/> </svg> },
    { label: 'یوتیوب', value: resume.youtube, link: `https://youtube.com/@${resume.youtube}`, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden> <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/> </svg> },
    { label: 'توییتر (X)', value: resume.twitter, link: `https://twitter.com/${resume.twitter}`, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg> },
    { label: 'اینستاگرام', value: resume.instagram, link: `https://instagram.com/${resume.instagram}`, icon: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden> <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/> </svg> },
    // @ts-ignore
    { label: 'لینک دلخواه', value: resume.customLink, link: resume.customLink, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> },
  ].filter(i => i.value && i.value.trim() !== '');

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <h1 className="mt-2 text-5xl font-black">رزومه</h1>

        <div className="mt-14 grid gap-12 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="mb-6 text-2xl font-bold">درباره من</h2>
            <p className="mb-12 text-lg text-[var(--muted)]">{resume.summary}</p>

            <h2 className="mb-6 text-2xl font-bold">تجربه کاری</h2>
            {resume.experience.map((item) => (
              <div className="mb-7 border-r-2 border-[var(--primary)] pr-5" key={item.id}>
                <p className="text-sm text-[var(--primary)]">{item.period}</p>
                <h3 className="mt-1 text-xl font-bold">{item.title}</h3>
                <p className="text-[var(--muted)]">{item.company}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p>
              </div>
            ))}

            <h2 className="mb-6 mt-12 text-2xl font-bold">تحصیلات</h2>
            {resume.education.map((item) => (
              <div className="mb-6 border-r-2 border-[var(--secondary)] pr-5" key={item.id}>
                <p className="text-sm text-[var(--secondary)]">{item.period}</p>
                <h3 className="mt-1 font-bold">{item.title}</h3>
                <p className="text-[var(--muted)]">{item.school}</p>
              </div>
            ))}

            <h2 className="mb-5 mt-12 text-2xl font-bold">مهارت‌ها</h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((item) => <span className="tag" key={item}>{item}</span>)}
            </div>

            <h2 className="mb-5 mt-12 text-2xl font-bold">ابزارها</h2>
            <div className="flex flex-wrap gap-2 mb-12">
              {resume.tools.map((item) => <span className="tag" key={item}>{item}</span>)}
            </div>
          </div>

          <div>
            {infos.length > 0 && (
              <>
                <h2 className="mb-2 text-2xl font-bold">اطلاعات</h2>
                <ul className="space-y-1 text-[var(--muted)] mb-12 bg-[var(--card)] rounded-md px-4 py-2">
                  {infos.map((info) => (
                    <li key={info.label} className="flex items-center gap-4 py-2">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-[var(--primary)] border border-[var(--border)]">
                        {info.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--muted)] mb-1 font-medium">{info.label}</span>
                        <strong className="text-[var(--foreground)] text-sm font-bold" style={{direction: 'ltr', textAlign: 'right'}}>{info.value}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {links.length > 0 && (
              <>
                <h2 className="mb-2 text-2xl font-bold">لینک‌ها</h2>
                <div className="flex flex-col gap-3 mb-12 bg-[var(--card)] rounded-md px-4 py-2">
                  {links.map((link) => (
                    <a key={link.label} href={link.link} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-4 py-2 group">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-[var(--primary)] border border-[var(--border)] group-hover:text-[var(--primary)] transition-colors">
                        {link.icon}
                      </div>
                      <div className="flex flex-col">
                        <strong className="text-[var(--foreground)] text-sm font-bold group-hover:text-[var(--primary)] transition-colors" style={{direction: 'ltr', textAlign: 'right'}}>{link.value}</strong>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}

            <h2 className="mb-5 text-2xl font-bold">زبان‌ها</h2>
            <ul className="space-y-2 text-[var(--muted)] bg-[var(--card)] rounded-md px-4 py-2">
              {resume.languages.map((item) => <li key={item} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
