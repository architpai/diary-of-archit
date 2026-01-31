'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface TechStack {
  os: string[];
  languages: string[];
  databases: string[];
  cloud: string[];
  frameworks: string[];
  tools: string[];
}

interface Experience {
  id: string;
  date: string;
  professionalTitle: string;
  company: string;
  resumeBulletPoints: string[];
  techStack?: TechStack;
  isResumeWorthy: boolean;
}

interface Skill {
  name: string;
  level: number;
  category: string;
}

export default function ResumeJP() {
  const { content, t } = useTranslation();
  const experiences = (content.experiences as Experience[]).filter(exp => exp.isResumeWorthy);
  const skills = content.skills as Skill[];

  // Japanese category labels
  const categoryLabels: Record<string, string> = {
    domain: 'ドメイン',
    mapping: 'マッピング',
    database: 'データベース',
    frontend: 'フロントエンド',
    backend: 'バックエンド',
    cloud: 'クラウド',
    devops: 'DevOps',
    graphics: 'グラフィックス',
    architecture: 'アーキテクチャ'
  };

  return (
    <main 
      className="max-w-[8.5in] mx-auto p-8 bg-white text-black print:p-0" 
      style={{ fontFamily: 'var(--font-jp-clean), "Noto Sans JP", sans-serif' }}
    >
      {/* Header */}
      <header className="border-b-2 border-black pb-4 mb-6">
        <h1 className="text-3xl font-bold">{content.personal.name}</h1>
        <p className="text-xl text-gray-700">{content.personal.title}</p>
        
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <a href={`mailto:${content.contact.email}`} className="text-blue-700 hover:underline">
            📧 {content.contact.email}
          </a>
          <span>|</span>
          <a href={`https://${content.contact.github}`} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
            🐙 {content.contact.github}
          </a>
          <span>|</span>
          <a href={`https://${content.contact.linkedin}`} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">
            💼 {content.contact.linkedin}
          </a>
        </div>
      </header>

      {/* Professional Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b-2 border-black mb-3">{t('resume.summary_title')}</h2>
        <p className="text-sm leading-relaxed">
          {t('resume.summary_text')}
        </p>
      </section>

      {/* Experience - Japanese 職務経歴書 style */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b-2 border-black mb-3">{t('resume.experience_title')}</h2>
        
        {experiences.map((exp, index) => (
          <div key={exp.id} className="mb-6 border border-gray-300 p-4 break-inside-avoid">
            {/* Project Header */}
            <div className="mb-3">
              <h3 className="font-bold text-base mb-1">
                ■ プロジェクト {index + 1}: {exp.professionalTitle}
              </h3>
              <div className="text-sm text-gray-600 flex gap-4">
                <span>【期間】{exp.date}</span>
                <span>【会社】{exp.company}</span>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="mb-3">
              <p className="font-semibold text-sm mb-2">【担当業務】</p>
              <ul className="list-none text-sm space-y-1 ml-4">
                {exp.resumeBulletPoints.map((point: string, i: number) => (
                  <li key={i} className="before:content-['・'] before:mr-1">{point}</li>
                ))}
              </ul>
            </div>

            {/* Tech Stack Table - Only if techStack exists */}
            {exp.techStack && (
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="font-semibold text-sm mb-2">【使用技術】</p>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  {exp.techStack.os && exp.techStack.os.length > 0 && (
                    <div className="flex">
                      <span className="font-semibold min-w-[120px]">OS:</span>
                      <span className="text-gray-700">{exp.techStack.os.join(', ')}</span>
                    </div>
                  )}
                  {exp.techStack.languages && exp.techStack.languages.length > 0 && (
                    <div className="flex">
                      <span className="font-semibold min-w-[120px]">言語:</span>
                      <span className="text-gray-700">{exp.techStack.languages.join(', ')}</span>
                    </div>
                  )}
                  {exp.techStack.databases && exp.techStack.databases.length > 0 && (
                    <div className="flex">
                      <span className="font-semibold min-w-[120px]">データベース:</span>
                      <span className="text-gray-700">{exp.techStack.databases.join(', ')}</span>
                    </div>
                  )}
                  {exp.techStack.cloud && exp.techStack.cloud.length > 0 && (
                    <div className="flex">
                      <span className="font-semibold min-w-[120px]">クラウド:</span>
                      <span className="text-gray-700">{exp.techStack.cloud.join(', ')}</span>
                    </div>
                  )}
                  {exp.techStack.frameworks && exp.techStack.frameworks.length > 0 && (
                    <div className="flex">
                      <span className="font-semibold min-w-[120px]">フレームワーク:</span>
                      <span className="text-gray-700">{exp.techStack.frameworks.join(', ')}</span>
                    </div>
                  )}
                  {exp.techStack.tools && exp.techStack.tools.length > 0 && (
                    <div className="flex">
                      <span className="font-semibold min-w-[120px]">ツール:</span>
                      <span className="text-gray-700">{exp.techStack.tools.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Skills - Grouped by category with Japanese labels */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b-2 border-black mb-3">{t('resume.skills_title')}</h2>
        
        <div className="grid grid-cols-1 gap-2 text-sm">
          {['domain', 'mapping', 'database', 'frontend', 'backend', 'cloud', 'devops', 'graphics', 'architecture'].map(category => {
            const categorySkills = skills.filter(s => s.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category} className="flex gap-2">
                <span className="font-semibold min-w-[140px] shrink-0">
                  【{categoryLabels[category] || category}】
                </span>
                <span className="text-gray-700">{categorySkills.map(s => s.name).join('、')}</span>
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
