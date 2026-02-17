'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons/SocialIcons';

interface Experience {
  id: string;
  date: string;
  professionalTitle: string;
  company: string;
  resumeBulletPoints: string[];
  isResumeWorthy: boolean;
}

interface Skill {
  name: string;
  level: number;
  category: string;
}

export default function ResumeEN() {
  const { content, t } = useTranslation();
  const experiences = (content.experiences as Experience[]).filter(exp => exp.isResumeWorthy);
  const skills = content.skills as Skill[];

  return (
    <main className="max-w-[8.5in] mx-auto p-8 bg-white text-black font-sans print:p-0">
      {/* Header */}
      <header className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold">{content.personal.name}</h1>
        <p className="text-xl text-gray-700">{content.personal.title}</p>
        
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <a href={`mailto:${content.contact.email}`} className="text-blue-700 hover:underline">
            <span className="inline-flex items-center gap-1.5">
              <MailIcon className="h-4 w-4 shrink-0" />
              {content.contact.email}
            </span>
          </a>
          <span>|</span>
          <a href={`https://${content.contact.github}`} className="text-blue-700 hover:underline">
            <span className="inline-flex items-center gap-1.5">
              <GitHubIcon className="h-4 w-4 shrink-0" />
              {content.contact.github}
            </span>
          </a>
          <span>|</span>
          <a href={`https://${content.contact.linkedin}`} className="text-blue-700 hover:underline">
            <span className="inline-flex items-center gap-1.5">
              <LinkedInIcon className="h-4 w-4 shrink-0" />
              {content.contact.linkedin}
            </span>
          </a>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-black mb-3">{t('resume.summary_title')}</h2>
        <p className="text-sm leading-relaxed">
          {t('resume.summary_text')}
        </p>
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
            <p className="text-sm italic text-gray-700 mb-2">{exp.company}</p>
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
        
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          {/* Group by category */}
          {['domain', 'mapping', 'database', 'frontend', 'backend', 'cloud', 'devops', 'graphics', 'architecture'].map(category => {
            const categorySkills = skills.filter(s => s.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category} className="flex gap-2">
                <span className="font-semibold capitalize min-w-[100px] shrink-0">{category}:</span>
                <span className="text-gray-700">{categorySkills.map(s => s.name).join(', ')}</span>
              </div>
            );
          })}
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
        <p className="mt-4 text-sm text-gray-500">
          {t('resume.print_hint')}
        </p>
      </div>
    </main>
  );
}
