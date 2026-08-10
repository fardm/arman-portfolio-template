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
    { label: 'موقعیت', value: resume.location },
    { label: 'تولد', value: resume.birthDate },
    { label: 'وضعیت تاهل', value: resume.maritalStatus },
    { label: 'وضعیت سربازی', value: resume.militaryService },
    { label: 'تماس', value: resume.phone },
    { label: 'ایمیل', value: resume.email },
    { label: 'تلگرام', value: resume.telegram },
    { label: 'لینکدین', value: resume.linkedin },
    { label: 'گیت‌هاب', value: resume.github },
    { label: 'یوتیوب', value: resume.youtube },
    { label: 'توییتر (X)', value: resume.twitter },
  ].filter(i => i.value && i.value.trim() !== '');

  return (
    <section className="section">
      <div className="container max-w-4xl">
        <p className="eyebrow">مسیر حرفه‌ای</p>
        <h1 className="mt-2 text-5xl font-black">رزومه</h1>
        <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">{resume.summary}</p>

        <div className="mt-14 grid gap-12 md:grid-cols-2">
          <div>
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
          </div>
          <div>
            <h2 className="mb-5 text-2xl font-bold">مهارت‌ها</h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((item) => <span className="tag" key={item}>{item}</span>)}
            </div>
            <h2 className="mb-5 mt-12 text-2xl font-bold">ابزارها</h2>
            <div className="flex flex-wrap gap-2">
              {resume.tools.map((item) => <span className="tag" key={item}>{item}</span>)}
            </div>
            <h2 className="mb-5 mt-12 text-2xl font-bold">زبان‌ها</h2>
            <ul className="space-y-2 text-[var(--muted)]">
              {resume.languages.map((item) => <li key={item}>{item}</li>)}
            </ul>

            {infos.length > 0 && (
              <>
                <h2 className="mb-5 mt-12 text-2xl font-bold">اطلاعات</h2>
                <ul className="space-y-3 text-[var(--muted)]">
                  {infos.map((info) => (
                    <li key={info.label} className="flex gap-2">
                      <strong className="text-[var(--foreground)] min-w-24">{info.label}:</strong>
                      <span className="text-left" style={{direction: 'ltr'}}>{info.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
