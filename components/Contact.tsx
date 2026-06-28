'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import Avatar from './Avatar';
import WindEffect from './WindEffect';
import { DiaryMailIcon, DiaryGitHubIcon, DiaryLinkedInIcon } from './icons/ContactIcons';
import { GitHubIcon, LinkedInIcon, MailIcon } from './icons/SocialIcons';
import { InkEnvelope } from './icons/InkIcons';

/** Tiny drawn postage stamp: Mt. Fuji under a sun, perforated edges. */
function PostageStamp() {
  return (
    <div className="postage-stamp w-14 h-[4.2rem] shrink-0" aria-hidden="true">
      <div
        className="w-full h-full flex flex-col items-center justify-between py-1"
        style={{ border: '1.5px solid rgba(100,81,59,0.5)' }}
      >
        <svg viewBox="0 0 40 30" className="w-9 h-7">
          <circle cx="31" cy="7" r="3.5" fill="none" stroke="#B05F66" strokeWidth="1.5" />
          <path
            d="M4 26 L15 8 L20 14 L24 9 L36 26 Z"
            fill="none"
            stroke="#64513B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M12 13 L15 11 L18 13.5" fill="none" stroke="#64513B" strokeWidth="1.2" />
        </svg>
        <span
          className="handwritten text-[9px] leading-none"
          style={{ color: '#64513B' }}
        >
          ¥84
        </span>
      </div>
    </div>
  );
}

/** Circular postmark, dated, with cancellation squiggles. */
function Postmark({ top, bottom }: { top: string; bottom: string }) {
  const year = new Date().getFullYear();
  return (
    <div className="relative shrink-0 -mr-4 z-10" aria-hidden="true">
      <div className="postmark-ring w-[4.2rem] h-[4.2rem] flex flex-col items-center justify-center rotate-[-8deg]">
        <span className="handwritten text-[8px] tracking-[0.18em] leading-none">{top}</span>
        <span className="handwritten text-[11px] font-bold leading-tight">{year}</span>
        <span className="handwritten text-[8px] tracking-[0.18em] leading-none">{bottom}</span>
      </div>
      {/* cancellation lines running onto the stamp */}
      <svg viewBox="0 0 40 24" className="absolute top-3 -right-6 w-10 h-6 opacity-50">
        {[0, 8, 16].map((y) => (
          <path
            key={y}
            d={`M0 ${4 + y} Q10 ${1 + y} 20 ${4 + y} T40 ${4 + y}`}
            fill="none"
            stroke="#64513B"
            strokeWidth="1.3"
          />
        ))}
      </svg>
    </div>
  );
}

/** Small stamped chip for a contact channel — handle, not raw URL. */
function ContactChip({
  href,
  isExternal,
  icon,
  label,
  rotation,
  delay,
  shouldReduceMotion,
}: {
  href: string;
  isExternal?: boolean;
  icon: React.ReactNode;
  label: string;
  rotation: number;
  delay: number;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <motion.a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="inline-flex items-center gap-2.5 px-4 py-2 wobbly-border-light bg-parchment/95 text-ink shadow-[2px_3px_0_rgba(45,45,45,0.12)]"
      style={{ rotate: `${rotation}deg`, textDecoration: 'none' }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { scale: 1.06, rotate: 0, boxShadow: '4px 5px 0 rgba(45,45,45,0.18)' }
      }
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, delay }}
    >
      <span className="shrink-0 text-sepia">{icon}</span>
      <span
        className="font-mono text-[0.8rem] font-semibold tracking-tight"
        style={{
          textDecoration: 'underline wavy',
          textDecorationColor: 'rgba(100,81,59,0.45)',
          textUnderlineOffset: '3px',
        }}
      >
        {label}
      </span>
    </motion.a>
  );
}

export default function Contact() {
  const { isSerious } = useSeriousMode();
  const { t, content, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const jpFont = isJapanese
    ? ({ fontFamily: 'var(--font-jp-handwritten)' } as React.CSSProperties)
    : ({} as React.CSSProperties);

  const githubHandle = `@${content.contact.github.split('/').filter(Boolean).pop()}`;
  const linkedinHandle = `in/${content.contact.linkedin.split('/').filter(Boolean).pop()}`;

  return (
    <section id="contact" className="py-20 relative">
      {/* Wind Effect */}
      {!isSerious && <WindEffect />}

      {!isSerious ? (
        <motion.div
          className="text-center mb-12 px-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="map-cartouche inline-block px-8 py-4 pointer-events-auto">
            <h2
              className="diary-title text-3xl md:text-4xl text-ink inline-flex items-center gap-3"
              style={jpFont}
            >
              <InkEnvelope className="w-9 h-9 shrink-0 text-ink/80" />
              {t('contact.title_diary')}
            </h2>
          </div>
        </motion.div>
      ) : (
        <motion.h2
          className="text-3xl md:text-4xl text-center mb-12 pt-16 font-sans font-bold text-ink"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('contact.title_serious')}
        </motion.h2>
      )}

      {isSerious ? (
        /* ── Serious mode: clean minimal layout (unchanged) ── */
        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <div className="space-y-4 text-left">
            <a
              href={`mailto:${content.contact.email}`}
              className="block font-sans text-blue-600 hover:underline"
            >
              <span className="inline-flex items-center gap-2">
                <MailIcon className="h-5 w-5 shrink-0" />
                {content.contact.email}
              </span>
            </a>

            <a
              href={content.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-sans text-blue-600 hover:underline"
            >
              <span className="inline-flex items-center gap-2">
                <GitHubIcon className="h-5 w-5 shrink-0" />
                {content.contact.github}
              </span>
            </a>

            <a
              href={content.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-sans text-blue-600 hover:underline"
            >
              <span className="inline-flex items-center gap-2">
                <LinkedInIcon className="h-5 w-5 shrink-0" />
                {content.contact.linkedin}
              </span>
            </a>
          </div>
        </div>
      ) : (
        /* ── Diary mode: a postcard mailed from the edge of the map ── */
        <div className="max-w-4xl mx-auto px-4 relative z-10 pointer-events-auto">
          {/* Contact channels up front — the actual actions surface
              immediately, before the warm-but-slower postcard below. */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <ContactChip
              href={`mailto:${content.contact.email}`}
              icon={<DiaryMailIcon className="h-6 w-6" />}
              label={content.contact.email}
              rotation={-1.5}
              delay={0.15}
              shouldReduceMotion={shouldReduceMotion}
            />
            <ContactChip
              href={content.contact.github}
              isExternal
              icon={<DiaryGitHubIcon className="h-6 w-6" />}
              label={githubHandle}
              rotation={1}
              delay={0.3}
              shouldReduceMotion={shouldReduceMotion}
            />
            <ContactChip
              href={content.contact.linkedin}
              isExternal
              icon={<DiaryLinkedInIcon className="h-6 w-6" />}
              label={linkedinHandle}
              rotation={-0.5}
              delay={0.45}
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>

          {/* The letter of introduction, under seal */}
          <motion.div
            className="mt-6 flex justify-center"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.35 }}
          >
            <Link href="/resume" className="group inline-flex items-center gap-4 bg-parchment/90 px-4 py-2.5 wobbly-border-light shadow-[2px_3px_0_rgba(45,45,45,0.12)]" style={{ textDecoration: 'none' }}>
              <span className="wax-seal shrink-0">AP</span>
              <span>
                <span
                  className="handwritten text-lg font-bold text-ink block"
                  style={{
                    textDecoration: 'underline wavy',
                    textDecorationColor: 'rgba(176,95,102,0.55)',
                    textUnderlineOffset: '4px',
                    ...jpFont,
                  }}
                >
                  {t('contact.resume_cta')} →
                </span>
                <span className="handwritten text-sm text-ink/55" style={jpFont}>
                  {t('contact.resume_sub')}
                </span>
              </span>
            </Link>
          </motion.div>

          {/* The postcard — the warm personal note, below the actions */}
          <div className="mt-14 flex flex-col md:flex-row items-center md:items-end justify-center gap-6 md:gap-8">
            {/* Namaste Avatar */}
            <motion.div
              className="flex-shrink-0"
              initial={shouldReduceMotion ? false : { opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
            >
              <Avatar pose="namaste" width={130} className="drop-shadow-lg" />
            </motion.div>

            {/* The postcard */}
            <motion.div
              className="postcard w-full max-w-2xl p-5 md:p-7 rotate-[-1deg]"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 40, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.15 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1.15fr_auto_1fr] gap-5 md:gap-6">
                {/* — Message side — */}
                <div className="flex flex-col">
                  <p
                    className="handwritten text-lg md:text-xl text-ink leading-relaxed italic"
                    style={jpFont}
                  >
                    {t('contact.message')}
                  </p>
                  <p
                    className="handwritten text-ink/70 mt-4"
                    style={jpFont}
                  >
                    — Archit
                  </p>
                  <p
                    className="handwritten text-sm text-ink/45 mt-auto pt-6 italic"
                    style={jpFont}
                  >
                    {t('contact.signoff')}
                  </p>
                </div>

                {/* — Divider — */}
                <div className="postcard-divider hidden md:block" aria-hidden="true" />

                {/* — Address side — */}
                <div className="flex flex-col min-h-[180px]">
                  <div className="flex items-start justify-end">
                    <Postmark
                      top={t('contact.pc_postmark_top')}
                      bottom={t('contact.pc_postmark_bottom')}
                    />
                    <PostageStamp />
                  </div>
                  <div className="mt-auto space-y-1 pt-5">
                    <p className="handwritten text-[11px] uppercase tracking-[0.2em] text-sepia/80" style={jpFont}>
                      {t('contact.pc_to')}
                    </p>
                    <div className="address-line">
                      <span className="handwritten text-ink" style={jpFont}>
                        {t('contact.pc_to_value')}
                      </span>
                    </div>
                    <div className="address-line" />
                    <p className="handwritten text-[11px] uppercase tracking-[0.2em] text-sepia/80 pt-3" style={jpFont}>
                      {t('contact.pc_from')}
                    </p>
                    <div className="address-line">
                      <span className="handwritten text-ink" style={jpFont}>
                        {t('contact.pc_from_value')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* End-of-map marker above the bottom neatline */}
          <motion.div
            className="mt-20 text-center"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.7 }}
          >
            <div
              className="mx-auto max-w-md mb-4"
              style={{
                borderTop: '2px solid rgba(100,81,59,0.35)',
                boxShadow: '0 3px 0 -1px rgba(100,81,59,0.2)',
              }}
              aria-hidden="true"
            />
            <p
              className="handwritten text-ink/40 tracking-[0.3em] text-sm uppercase"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)', letterSpacing: '0.2em' } : {}}
            >
              ✦ — {t('contact.end_of_map')} — ✦
            </p>
          </motion.div>
        </div>
      )}
    </section>
  );
}
