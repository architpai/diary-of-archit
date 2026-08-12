'use client';

import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import contentJP from '@/data/content.jp.json';

/**
 * OPTION C — sensitive personal fields (photo, DOB/age, full address, phone,
 * email, home-country contact) are shown on the hosted 履歴書.
 * This is a deliberate, reversible decision: flip this single boolean to false
 * to redact every sensitive field (they render as 「非公開」 and the photo box
 * shows a placeholder) while keeping the document layout intact.
 */
const SHOW_PERSONAL_FIELDS = true;

const JP_FONT = { fontFamily: 'var(--font-jp-clean), "Noto Sans JP", sans-serif' };

const REDACTED = '非公開';

export default function Rirekisho() {
  const { t } = useTranslation();
  const r = contentJP.rirekisho;
  const p = r.personal;

  // Gate every sensitive value through one helper so the toggle is exhaustive.
  const show = (value: string) => (SHOW_PERSONAL_FIELDS ? value : REDACTED);
  // The 履歴書 is a dated snapshot (docDate); the age is part of that snapshot,
  // precomputed in data so server and client HTML always agree.
  const ageText = SHOW_PERSONAL_FIELDS ? p.ageText : REDACTED;

  // Fixed label widths compress below md so the JIS form fits 320–390px viewports.
  const labelCell = 'bg-gray-50 border border-black px-2 py-1 text-xs font-semibold';
  const labelW = 'w-20 md:w-24';

  return (
    <main
      className="resume-sheet max-w-[8.5in] mx-auto p-4 md:p-8 bg-white text-black print:p-0"
      style={JP_FONT}
    >
      {/* Title + current date */}
      <div className="flex items-end justify-between mb-3">
        <h1 className="text-2xl font-bold tracking-[0.4em]">履 歴 書</h1>
        <span className="text-sm">{r.docDate}</span>
      </div>

      {/* Identity block + photo */}
      <div className="flex border-2 border-black">
        <div className="flex-1">
          {/* ふりがな / 性別 */}
          <div className="flex border-b border-black">
            <div className={`${labelCell} ${labelW} shrink-0`}>ふりがな</div>
            <div className="flex-1 px-2 py-1 text-xs border-r border-black">{r.furigana}</div>
            <div className={`${labelCell} w-12 md:w-16 shrink-0`}>性別</div>
            <div className="w-10 md:w-16 shrink-0 px-2 py-1 text-sm">{r.gender}</div>
          </div>
          {/* 氏名 */}
          <div className="flex border-b border-black">
            <div className={`${labelCell} ${labelW} shrink-0 flex items-center`}>氏名</div>
            <div className="flex-1 px-3 py-3 text-xl font-bold">{r.name}</div>
          </div>
          {/* 生年月日 */}
          <div className="flex">
            <div className={`${labelCell} ${labelW} shrink-0 flex items-center`}>生年月日</div>
            <div className="flex-1 px-2 py-2 text-sm">
              {show(p.dobText)}（{ageText}）
            </div>
          </div>
        </div>
        {/* 証明写真 */}
        <div className="w-20 md:w-[3cm] border-l-2 border-black flex items-center justify-center p-1 shrink-0">
          {SHOW_PERSONAL_FIELDS ? (
            <Image
              src={p.photo}
              alt="証明写真"
              width={113}
              height={151}
              className="object-cover w-full h-auto"
            />
          ) : (
            <div className="w-full aspect-[3/4] flex items-center justify-center text-[10px] text-gray-400 text-center leading-tight">
              写真
              <br />
              {REDACTED}
            </div>
          )}
        </div>
      </div>

      {/* Address / contact block */}
      <div className="border-2 border-t-0 border-black">
        <div className="flex border-b border-black">
          <div className={`${labelCell} ${labelW} shrink-0 flex items-center`}>現住所</div>
          <div className="flex-1">
            <div className="px-2 py-1 text-xs border-b border-black text-gray-600">
              ふりがな　{show(p.addressFurigana)}
            </div>
            <div className="px-2 py-2 text-sm">
              〒{show(p.postalCode)}　{show(p.address)}
              <span className="block text-xs text-gray-600 mt-0.5">
                （最寄駅：{show(p.nearestStation)}）
              </span>
            </div>
          </div>
          <div className="w-36 md:w-52 shrink-0 border-l border-black text-xs">
            <div className="px-2 py-1 border-b border-black">TEL　{show(p.tel)}</div>
            <div className="px-2 py-1 border-b border-black">携帯電話　{show(p.mobile)}</div>
            <div className="px-2 py-1 border-b border-black">FAX　{show(p.fax)}</div>
            <div className="px-2 py-1 break-all">E-mail　<span className="text-[10px]">{show(p.email)}</span></div>
          </div>
        </div>
        <div className="flex">
          <div className={`${labelCell} ${labelW} shrink-0 flex items-center`}>母国での<br />連絡先</div>
          <div className="flex-1 px-2 py-2 text-sm">{show(p.homeCountryContact)}</div>
        </div>
      </div>

      {/* 学歴・職歴 */}
      <table className="w-full border-collapse mt-4 border-2 border-black text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-black px-2 py-1 w-14 text-center">年</th>
            <th className="border border-black px-2 py-1 w-14 text-center">月</th>
            <th className="border border-black px-2 py-1 text-center">学歴・職歴</th>
          </tr>
        </thead>
        <tbody>
          {r.historyRows.map((row, i) => {
            if (row.kind === 'section') {
              return (
                <tr key={i}>
                  <td className="border border-black" />
                  <td className="border border-black" />
                  <td className="border border-black px-2 py-1 text-center font-bold">{row.label}</td>
                </tr>
              );
            }
            if (row.kind === 'end') {
              return (
                <tr key={i}>
                  <td className="border border-black" />
                  <td className="border border-black" />
                  <td className="border border-black px-2 py-1 text-right pr-4">{row.text}</td>
                </tr>
              );
            }
            if (row.kind === 'note') {
              return (
                <tr key={i}>
                  <td className="border border-black" />
                  <td className="border border-black" />
                  <td className="border border-black px-2 py-1 pl-6 text-xs text-gray-700">{row.text}</td>
                </tr>
              );
            }
            // entry
            return (
              <tr key={i}>
                <td className="border border-black px-2 py-1 text-center">{row.year}</td>
                <td className="border border-black px-2 py-1 text-center">{row.month}</td>
                <td className="border border-black px-2 py-1">{row.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 特筆すべきスキル */}
      <div className="border-2 border-black mt-4">
        <div className="bg-gray-50 border-b border-black px-2 py-1 text-sm font-bold">特筆すべきスキル</div>
        <div className="px-3 py-2 text-sm space-y-1">
          {r.skills.map((s, i) => (
            <div key={i} className="flex gap-1">
              <span className="font-semibold whitespace-nowrap">{s.label}：</span>
              <span className="text-gray-800">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 志望動機・自己PR */}
      <div className="border-2 border-black mt-4">
        <div className="bg-gray-50 border-b border-black px-2 py-1 text-sm font-bold">
          志望動機、自己PRなど
        </div>
        <p className="px-3 py-2 text-sm leading-relaxed">{r.motivation}</p>
      </div>

      {/* 言語能力 / 趣味 */}
      <div className="border-2 border-black mt-4">
        <div className="flex border-b border-black">
          <div className={`${labelCell} ${labelW} shrink-0 flex items-center`}>言語能力</div>
          <div className="flex-1 px-3 py-2 text-sm space-y-0.5">
            {r.languages.map((l) => (
              <div key={l.name}>
                <span className="font-semibold">{l.name}：</span>
                {l.level}
              </div>
            ))}
          </div>
        </div>
        <div className="flex">
          <div className={`${labelCell} ${labelW} shrink-0 flex items-center`}>趣味</div>
          <div className="flex-1 px-3 py-2 text-sm">{r.hobbies.join(' ／ ')}</div>
        </div>
      </div>

      {/* 配偶者 */}
      <div className="flex border-2 border-black border-t-0 text-sm">
        <div className={`${labelCell} flex items-center`}>配偶者の有無</div>
        <div className="px-3 py-2 border-r border-black w-24">{r.spouse}</div>
        <div className={`${labelCell} flex items-center`}>配偶者の扶養義務</div>
        <div className="px-3 py-2 flex-1">{r.spouseSupport}</div>
      </div>

      {/* 本人希望記入欄 */}
      <div className="border-2 border-black mt-4 mb-4">
        <div className="bg-gray-50 border-b border-black px-2 py-1 text-xs font-bold">
          本人希望記入欄（特に給料、職種、勤務時間、勤務地、その他についての希望などがあれば記入）
        </div>
        <div className="px-3 py-2 text-sm space-y-1">
          {r.requests.map((req, i) => (
            <p key={i}>{req}</p>
          ))}
        </div>
      </div>

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
