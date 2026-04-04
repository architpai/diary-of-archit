'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import { useTranslation } from '@/hooks/useTranslation';
import BlobDivider from './BlobDivider';
import FloatingDoodles from './FloatingDoodles';
import Avatar from './Avatar';
import WindEffect from './WindEffect';
import { DiaryMailIcon, DiaryGitHubIcon, DiaryLinkedInIcon } from './icons/ContactIcons';
import { GitHubIcon, LinkedInIcon, MailIcon } from './icons/SocialIcons';

export default function Contact() {
  const { isSerious } = useSeriousMode();
  const { t, content, isJapanese } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="contact" className={`py-20 relative ${!isSerious ? 'section-yellow' : ''}`}>
      {/* Top Wave Divider */}
      {!isSerious && (
        <BlobDivider position="top" fillColor="var(--paper)" variant={1} />
      )}

      {/* Floating Background Doodles */}
      {!isSerious && <FloatingDoodles variant="mixed" density="sparse" />}

      {/* Wind Effect */}
      {!isSerious && <WindEffect />}

      <motion.h2
        className={`text-3xl md:text-4xl text-center mb-12 pt-16 ${isSerious ? 'font-sans font-bold text-ink' : 'diary-title text-ink drop-shadow-lg'}`}
        style={isJapanese && !isSerious ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {isSerious ? t('contact.title_serious') : t('contact.title_diary')}
      </motion.h2>

      {isSerious ? (
        /* Serious mode: clean minimal layout */
        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <div className="space-y-4 text-left">
            {/* Email */}
            <a
              href={`mailto:${content.contact.email}`}
              className="block font-sans text-blue-600 hover:underline"
            >
              <span className="inline-flex items-center gap-2">
                <MailIcon className="h-5 w-5 shrink-0" />
                {content.contact.email}
              </span>
            </a>

            {/* GitHub */}
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

            {/* LinkedIn */}
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
        /* Diary mode: Avatar + Flapping Post-it */
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Namaste Avatar */}
          <motion.div
            className="flex-shrink-0"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
          >
            <Avatar pose="namaste" width={200} height={260} className="drop-shadow-lg" />
          </motion.div>

          {/* Flapping Post-it with thumbtack */}
          <motion.div
            className="flex-1 relative"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          >
            {/* Thumbtack SVG */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
              <svg width="28" height="32" viewBox="0 0 28 32">
                <circle cx="14" cy="10" r="9" fill="#C0392B" stroke="#922B21" strokeWidth="1" />
                <circle cx="11" cy="8" r="3" fill="#E74C3C" opacity="0.6" />
                <line x1="14" y1="19" x2="14" y2="32" stroke="#7F8C8D" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Post-it card */}
            <div
              className={`p-8 relative ${shouldReduceMotion ? '' : 'postit-flap'}`}
              style={{
                background: 'linear-gradient(135deg, #FFEB3B 0%, #FDD835 100%)',
                boxShadow: '4px 6px 16px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {/* Sign-off message */}
              <motion.p
                className="handwritten text-lg mb-6 text-ink"
                style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.4 }}
              >
                {t('contact.message')}
              </motion.p>

              {/* Contact links with diary icons */}
              <div className="space-y-3">
                {/* Email */}
                <a
                  href={`mailto:${content.contact.email}`}
                  className="flex items-center gap-3 group"
                >
                  <DiaryMailIcon
                    className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110"
                    style={{ color: '#B8860B' }}
                  />
                  <span
                    className="handwritten text-base font-bold"
                    style={{
                      color: '#B8860B',
                      textDecoration: 'underline wavy #B8860B',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    {content.contact.email}
                  </span>
                </a>

                {/* GitHub */}
                <a
                  href={content.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <DiaryGitHubIcon
                    className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110"
                    style={{ color: '#2D2D2D' }}
                  />
                  <span
                    className="handwritten text-base font-bold"
                    style={{
                      color: '#2D2D2D',
                      textDecoration: 'underline wavy #2D2D2D',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    {content.contact.github}
                  </span>
                </a>

                {/* LinkedIn */}
                <a
                  href={content.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <DiaryLinkedInIcon
                    className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110"
                    style={{ color: '#1A5276' }}
                  />
                  <span
                    className="handwritten text-base font-bold"
                    style={{
                      color: '#1A5276',
                      textDecoration: 'underline wavy #1A5276',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    {content.contact.linkedin}
                  </span>
                </a>
              </div>

              {/* Sign-off */}
              <motion.p
                className="handwritten text-sm text-ink/50 mt-6 italic"
                style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.6 }}
              >
                {t('contact.signoff')}
              </motion.p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Fun footer in diary mode */}
      {!isSerious && (
        <motion.p
          className="handwritten text-center mt-12 text-ink/80 text-lg relative z-10"
          style={isJapanese ? { fontFamily: 'var(--font-jp-handwritten)' } : {}}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t('contact.thanks')}
        </motion.p>
      )}
    </section>
  );
}
