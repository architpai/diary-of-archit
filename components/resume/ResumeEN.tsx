'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons/SocialIcons';

interface Experience {
  id: string;
  date: string;
  professionalTitle: string;
  company: string;
  location: string;
  resumeBulletPoints: string[];
  isResumeWorthy: boolean;
}

const stripProtocol = (url: string) => url.replace(/^https?:\/\//, '');

export default function ResumeEN() {
  const { content, t } = useTranslation();
  const experiences = (content.experiences as Experience[]).filter(exp => exp.isResumeWorthy);
  const resume = content.resumeEn;

  return (
    <main className="resume-sheet max-w-[8.5in] mx-auto p-4 md:p-8 bg-white text-black font-sans print:p-0">
      {/* Header */}
      <header className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold">{content.personal.name}</h1>
        <p className="text-xl text-gray-700">{resume.headline}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span>{resume.location}</span>
          <span className="text-gray-400">|</span>
          <a href={`mailto:${content.contact.email}`} className="text-blue-700 hover:underline">
            <span className="inline-flex items-center gap-1.5">
              <MailIcon className="h-4 w-4 shrink-0" />
              {content.contact.email}
            </span>
          </a>
          <span className="text-gray-400">|</span>
          <a href={content.contact.github} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
            <span className="inline-flex items-center gap-1.5">
              <GitHubIcon className="h-4 w-4 shrink-0" />
              {stripProtocol(content.contact.github)}
            </span>
          </a>
          <span className="text-gray-400">|</span>
          <a href={content.contact.linkedin} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
            <span className="inline-flex items-center gap-1.5">
              <LinkedInIcon className="h-4 w-4 shrink-0" />
              {stripProtocol(content.contact.linkedin)}
            </span>
          </a>
          {resume.portfolio && (
            <>
              <span className="text-gray-400">|</span>
              <a href={resume.portfolio} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
                {stripProtocol(resume.portfolio)}
              </a>
            </>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-700">{resume.subline}</p>
      </header>

      {/* Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-black mb-3">{t('resume.summary_title')}</h2>
        <p className="text-sm leading-relaxed">{resume.summary}</p>
      </section>

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-black mb-3">{t('resume.experience_title')}</h2>

        {experiences.map((exp) => (
          <div key={exp.id} className="mb-4 break-inside-avoid">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold">{exp.professionalTitle}</h3>
              <span className="text-sm text-gray-600">{exp.date}</span>
            </div>
            <p className="text-sm italic text-gray-700 mb-2">{exp.company} · {exp.location}</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {exp.resumeBulletPoints.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-black mb-3">{t('resume.skills_title')}</h2>

        <div className="grid grid-cols-1 gap-y-2 text-sm">
          {resume.skillGroups.map((group) => (
            <div key={group.label} className="flex gap-2">
              <span className="font-semibold min-w-[150px] shrink-0">{group.label}:</span>
              <span className="text-gray-700 min-w-0 break-words">{group.items}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold border-b border-black mb-3">{t('resume.education_title')}</h2>
        {resume.education.map((edu, i) => (
          <div key={i} className="text-sm">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">{edu.degree}</span>
              <span className="text-gray-600">{edu.period}</span>
            </div>
            <p className="text-gray-700">{edu.school}</p>
          </div>
        ))}
      </section>

      {/* Languages & Certifications */}
      <section className="mb-6 break-inside-avoid">
        <h2 className="text-lg font-bold border-b border-black mb-3">{t('resume.languages_title')}</h2>
        <div className="grid grid-cols-1 gap-y-1 text-sm">
          {resume.languages.map((lang) => (
            <div key={lang.name} className="flex gap-2">
              <span className="font-semibold min-w-[110px] shrink-0">{lang.name}:</span>
              <span className="text-gray-700 min-w-0 break-words">{lang.level}</span>
            </div>
          ))}
          <div className="flex gap-2">
            <span className="font-semibold min-w-[110px] shrink-0">{t('resume.certifications_title')}:</span>
            <span className="text-gray-700 min-w-0 break-words">
              {resume.certifications.map((c) => `${c.name} (${c.date})`).join(' · ')}
              {resume.certificationsNote ? ` · ${resume.certificationsNote}` : ''}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold min-w-[110px] shrink-0">{t('resume.work_auth_title')}:</span>
            <span className="text-gray-700 min-w-0 break-words">{resume.workAuthorization}</span>
          </div>
        </div>
      </section>

      {/* Print Button - Hidden when printing */}
      <div className="print:hidden mt-8 text-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {t('resume.print_button')}
        </button>
        <p className="mt-4 text-sm text-gray-600">
          {t('resume.print_hint')}
        </p>
      </div>
    </main>
  );
}
