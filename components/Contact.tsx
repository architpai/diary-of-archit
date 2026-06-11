'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import Avatar from './Avatar';
import WindEffect from './WindEffect';
import { DiaryMailIcon, DiaryGitHubIcon, DiaryLinkedInIcon } from './icons/ContactIcons';
import { GitHubIcon, LinkedInIcon, MailIcon } from './icons/SocialIcons';

// Thumbtack SVG used on each card
function Thumbtack() {
  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
      <svg width="26" height="30" viewBox="0 0 28 32" aria-hidden="true">
        <circle cx="14" cy="10" r="9" fill="#C0392B" stroke="#922B21" strokeWidth="1" />
        <circle cx="11" cy="8" r="3" fill="#E74C3C" opacity="0.6" />
        <line x1="14" y1="19" x2="14" y2="32" stroke="#7F8C8D" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

interface ContactCardProps {
  href: string;
  isExternal?: boolean;
  gradient: [string, string];
  rotation: number;
  delay: number;
  icon: React.ReactNode;
  label: string;
  labelColor: string;
  shouldReduceMotion: boolean | null;
}

function ContactCard({
  href,
  isExternal,
  gradient,
  rotation,
  delay,
  icon,
  label,
  labelColor,
  shouldReduceMotion,
}: ContactCardProps) {
  return (
    <motion.div
      className="relative"
      style={{ rotate: `${rotation}deg` }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay }}
    >
      <motion.a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="p-6 flex flex-col items-center relative tape-corner"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
          boxShadow: '4px 4px 12px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.1)',
          textDecoration: 'none',
        }}
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
                scale: 1.08,
                rotate: 0,
                boxShadow: '8px 8px 20px rgba(0,0,0,0.35)',
                zIndex: 20,
              }
        }
        transition={shouldReduceMotion ? undefined : { type: 'spring', stiffness: 300 }}
      >
        <Thumbtack />

        {/* Icon */}
        <div className="mt-4 mb-3 flex items-center justify-center" style={{ color: labelColor }}>
          {icon}
        </div>

        {/* Label */}
        <span
          className="handwritten text-sm font-bold text-center break-all leading-snug"
          style={{
            color: labelColor,
            textDecoration: 'underline wavy',
            textDecorationColor: labelColor,
            textUnderlineOffset: '3px',
          }}
        >
          {label}
        </span>
      </motion.a>
    </motion.div>
  );
}

export default function Contact() {
  const { isSerious } = useSeriousMode();
  const { t, content, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

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
              className="diary-title text-3xl md:text-4xl text-ink"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            >
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
        /* ── Diary mode: Avatar + 3 colorful post-it cards ── */
        <div className="max-w-5xl mx-auto px-4 relative z-10 pointer-events-auto">
          {/* Sign-off message above cards */}
          <motion.p
            className="handwritten text-lg text-center mb-10 text-ink"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
          >
            {t('contact.message')}
          </motion.p>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-10">
            {/* Namaste Avatar */}
            <motion.div
              className="flex-shrink-0"
              initial={shouldReduceMotion ? false : { opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
            >
              <Avatar pose="namaste" width={160} height={208} className="drop-shadow-lg" />
            </motion.div>

            {/* 3 Contact Cards — stacked vertically */}
            <div className="w-full max-w-sm flex flex-col gap-4">
              {/* Email — yellow */}
              <ContactCard
                href={`mailto:${content.contact.email}`}
                gradient={['#FFD54F', '#F9A825']}
                rotation={-2}
                delay={0.15}
                icon={<DiaryMailIcon className="h-10 w-10" />}
                label={content.contact.email}
                labelColor="#B8860B"
                shouldReduceMotion={shouldReduceMotion}
              />

              {/* GitHub — light blue */}
              <ContactCard
                href={content.contact.github}
                isExternal
                gradient={['#87CEEB', '#4682B4']}
                rotation={1}
                delay={0.30}
                icon={<DiaryGitHubIcon className="h-10 w-10" />}
                label={content.contact.github}
                labelColor="#1A3A5C"
                shouldReduceMotion={shouldReduceMotion}
              />

              {/* LinkedIn — green */}
              <ContactCard
                href={content.contact.linkedin}
                isExternal
                gradient={['#81C784', '#2E7D32']}
                rotation={-1}
                delay={0.45}
                icon={<DiaryLinkedInIcon className="h-10 w-10" />}
                label={content.contact.linkedin}
                labelColor="#155724"
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>
          </div>

          {/* Sign-off below cards */}
          <motion.p
            className="handwritten text-sm text-ink/50 mt-10 text-center italic"
            style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.6 }}
          >
            {t('contact.signoff')}
          </motion.p>

          {/* End-of-map marker */}
          <motion.div
            className="mt-12 text-center"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.8 }}
          >
            <p
              className="handwritten text-ink/40 tracking-[0.3em] text-sm uppercase"
              style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)', letterSpacing: '0.2em' } : {}}
            >
              ✦ — — {t('contact.end_of_map')} — — ✦
            </p>
          </motion.div>
        </div>
      )}

      {/* Sign-off moved to DiaryFooter */}
    </section>
  );
}
