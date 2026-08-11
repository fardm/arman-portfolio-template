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
    { label: 'تلگرام', value: resume.telegram, link: `https://t.me/${resume.telegram}`, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> },
    { label: 'لینکدین', value: resume.linkedin, link: `https://linkedin.com/in/${resume.linkedin}`, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> },
    { label: 'گیت‌هاب', value: resume.github, link: `https://github.com/${resume.github}`, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> },
    { label: 'یوتیوب', value: resume.youtube, link: `https://youtube.com/@${resume.youtube}`, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg> },
    { label: 'توییتر (X)', value: resume.twitter, link: `https://twitter.com/${resume.twitter}`, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg> },
    // @ts-ignore
    { label: 'لینک دلخواه', value: resume.customLink, link: resume.customLink, icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> },
  ].filter(i => i.value && i.value.trim() !== '');

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <p className="eyebrow">مسیر حرفه‌ای</p>
        <h1 className="mt-2 text-5xl font-black">رزومه</h1>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
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
              <div className="mb-6 border-r-2 border-[var(--accent)] pr-5" key={item.id}>
                <p className="text-sm text-[var(--accent)]">{item.period}</p>
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
                <h2 className="mb-6 text-2xl font-bold">اطلاعات</h2>
                <ul className="space-y-4 text-[var(--muted)] mb-12">
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
                <h2 className="mb-6 text-2xl font-bold">لینک‌ها</h2>
                <div className="flex flex-col gap-3 mb-12">
                  {links.map((link) => (
                    <a key={link.label} href={link.link} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-4 py-2 group">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] group-hover:text-[var(--primary)] transition-colors">
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
            <ul className="space-y-2 text-[var(--muted)]">
              {resume.languages.map((item) => <li key={item} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
