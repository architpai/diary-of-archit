'use client';

import { useTranslation } from '@/hooks/useTranslation';
import contentJP from '@/data/content.jp.json';

const JP_FONT = { fontFamily: 'var(--font-jp-clean), "Noto Sans JP", sans-serif' };

/** A labelled 【…】 row: value skipped when empty so unused tech fields collapse. */
function SpecRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex text-xs">
      <span className="font-semibold whitespace-nowrap">【{label}】</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

export default function ResumeJP() {
  const { t } = useTranslation();
  const shokumu = contentJP.shokumu;

  return (
    <main
      className="resume-sheet max-w-[8.5in] mx-auto p-4 md:p-8 bg-white text-black print:p-0"
      style={JP_FONT}
    >
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-end justify-between border-b-2 border-black pb-2">
          <h1 className="text-2xl font-bold tracking-[0.3em]">職 務 経 歴 書</h1>
          <span className="text-sm text-gray-700">{shokumu.docDate}</span>
        </div>
        <p className="mt-2 text-right text-sm">氏名　{shokumu.name}</p>
      </header>

      {/* ■職務要約 */}
      <section className="mb-6">
        <div className="font-bold text-base border-b border-black mb-2">■職務要約</div>
        <p className="text-sm leading-relaxed">{shokumu.summary}</p>
      </section>

      {/* ■活かせる経験・知識・技術 */}
      <section className="mb-6">
        <div className="font-bold text-base border-b border-black mb-2">■活かせる経験・知識・技術</div>
        <ul className="list-none text-sm space-y-1 ml-1">
          {shokumu.strengths.map((s, i) => (
            <li key={i} className="before:content-['・'] before:mr-1">{s}</li>
          ))}
        </ul>
      </section>

      {/* ■会社履歴 */}
      <section className="mb-6">
        <div className="font-bold text-base border-b border-black mb-2">■会社履歴</div>
        <div className="text-sm">
          {shokumu.companyHistory.map((c, i) => (
            <div key={i} className="flex gap-3 py-0.5">
              <span className="whitespace-nowrap text-gray-700 min-w-[190px]">{c.period}</span>
              <span>{c.company}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ■職務経歴 */}
      <section className="mb-6">
        <div className="font-bold text-base border-b border-black mb-3">■職務経歴</div>

        {shokumu.employers.map((emp, ei) => (
          <div key={ei} className="mb-6">
            {/* Employer header. Stays whole and drags its first project with it,
                so a new company never opens with a half-cut banner at a page foot. */}
            <div className="bg-gray-50 border border-gray-300 px-3 py-2 mb-3 break-inside-avoid break-after-avoid">
              <p className="font-bold text-sm">▼{emp.period}　{emp.name}</p>
              {emp.meta.map((m, mi) => (
                <p key={mi} className="text-xs text-gray-700 mt-0.5">{m}</p>
              ))}
            </div>

            {/* Projects */}
            {emp.projects.map((proj, pi) => (
              // Boxes run 250-440px against a ~980px printable page, so forcing
              // one to stay whole stranded up to 40% of a page. They split now;
              // the title is only kept with the body that follows it.
              <div key={pi} className="mb-4 print:mb-2 border border-gray-300 p-3 print:p-2">
                <p className="font-semibold text-sm mb-2 print:mb-1 break-after-avoid">
                  {emp.projects.length > 1 ? `【プロジェクト${pi + 1}】` : '【プロジェクト】'}{proj.name}
                </p>

                <div className="mb-2 print:mb-1">
                  <p className="text-xs font-semibold break-after-avoid">【プロジェクト概要】</p>
                  <p className="text-xs text-gray-700">{proj.overview}</p>
                  {'overviewBullets' in proj && proj.overviewBullets && (
                    <ul className="list-none text-xs text-gray-700 mt-1 ml-1 space-y-0.5">
                      {proj.overviewBullets.map((b, bi) => (
                        <li key={bi} className="before:content-['・'] before:mr-1">{b}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mb-2 print:mb-1">
                  <p className="text-xs font-semibold break-after-avoid">【担当業務】</p>
                  <ul className="list-none text-xs text-gray-700 ml-1 space-y-0.5">
                    {proj.responsibilities.map((r, ri) => (
                      <li key={ri} className="before:content-['・'] before:mr-1">{r}</li>
                    ))}
                  </ul>
                </div>

                {'achievements' in proj && proj.achievements && (
                  <div className="mb-2 print:mb-1">
                    <p className="text-xs font-semibold break-after-avoid">【実績】</p>
                    <p className="text-xs text-gray-700">{proj.achievements}</p>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded p-2 print:p-1.5 grid grid-cols-1 print:grid-cols-2 gap-0.5 print:gap-x-3">
                  <SpecRow label="言語" value={'languages' in proj ? proj.languages : undefined} />
                  <SpecRow label="技術" value={'tech' in proj ? proj.tech : undefined} />
                  <SpecRow label="DB" value={'db' in proj ? proj.db : undefined} />
                  <SpecRow label="OS" value={'os' in proj ? proj.os : undefined} />
                  <SpecRow label="クラウド" value={'cloud' in proj ? proj.cloud : undefined} />
                  <SpecRow label="Bundler" value={'bundler' in proj ? proj.bundler : undefined} />
                  <SpecRow label="規模" value={'scale' in proj ? proj.scale : undefined} />
                </div>
              </div>
            ))}

            {/* Footnotes */}
            {'footnotes' in emp && emp.footnotes && (
              <div className="text-xs text-gray-600 space-y-0.5">
                {emp.footnotes.map((f, fi) => (
                  <p key={fi}>{f}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ■テクニカルスキル */}
      <section className="mb-6">
        <div className="font-bold text-base border-b border-black mb-2">■テクニカルスキル</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            {/* Header repeats on every printed page the table spans. Chrome's
                default thead behaviour here is version-dependent, so say it. */}
            <thead className="print:table-header-group">
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-2 py-1 text-left w-[110px]">種類</th>
                <th className="border border-gray-300 px-2 py-1 text-left">技術</th>
                <th className="border border-gray-300 px-2 py-1 text-left w-[90px]">使用期間</th>
                <th className="border border-gray-300 px-2 py-1 text-left">レベル</th>
              </tr>
            </thead>
            {/* One tbody per 種類 group so the table can break between groups
                without a rowSpan'd label straddling the page edge. */}
            {shokumu.technicalSkills.map((group) => (
              <tbody key={group.type} className="break-inside-avoid">
                {group.rows.map((row, ri) => (
                  <tr key={`${group.type}-${ri}`}>
                    {ri === 0 && (
                      <td
                        className="border border-gray-300 px-2 py-1 font-semibold align-top bg-gray-50"
                        rowSpan={group.rows.length}
                      >
                        {group.type}
                      </td>
                    )}
                    <td className="border border-gray-300 px-2 py-1">{row.tech}</td>
                    <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">{row.duration}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.level}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      {/* ■自己PR */}
      <section className="mb-6 break-inside-avoid">
        <div className="font-bold text-base border-b border-black mb-2">■自己PR</div>
        <div className="text-sm leading-relaxed space-y-3">
          {shokumu.selfPR.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Print Button - Hidden when printing */}
      <div className="print:hidden mt-8 text-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {t('resume.download_button')}
        </button>
        <p className="mt-4 text-sm text-gray-600">
          {t('resume.print_hint')}
        </p>
      </div>
    </main>
  );
}
