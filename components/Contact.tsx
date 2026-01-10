'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import content from '@/data/content.json';
import BlobDivider from './BlobDivider';
import FloatingDoodles from './FloatingDoodles';

export default function Contact() {
  const { isSerious } = useSeriousMode();

  return (
    <section id="contact" className={`py-20 relative ${!isSerious ? 'section-yellow' : ''}`}>
      {/* Top Wave Divider */}
      {!isSerious && (
        <BlobDivider position="top" fillColor="var(--paper)" variant={1} />
      )}
      
      {/* Floating Background Doodles */}
      {!isSerious && <FloatingDoodles variant="mixed" density="sparse" />}
      
      <motion.h2
        className={`text-3xl md:text-4xl text-center mb-12 pt-16 ${isSerious ? 'font-sans font-bold text-ink' : 'diary-title text-ink drop-shadow-lg'}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {isSerious ? 'Contact Information' : "📬 Let's Talk!"}
      </motion.h2>

      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* Namaste Avatar - hidden in serious mode */}
        {!isSerious && (
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Image
              src="/avatar/namaste_pose.png"
              alt="Namaste greeting"
              width={200}
              height={260}
              className="object-contain drop-shadow-lg"
            />
          </motion.div>
        )}

        <motion.div
          className={`
            flex-1 text-center md:text-left
            ${isSerious ? '' : 'wobbly-border bg-paper/95 p-8 relative'}
          `}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          {/* Pin decoration */}
          {!isSerious && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-2xl drop-shadow-md">
              📌
            </div>
          )}

          {!isSerious && (
            <motion.p
              className="handwritten text-lg mb-6 text-ink"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Whether you want to talk about code, Pokémon cards, or the meaning of life... I&apos;m all ears! 👂
            </motion.p>
          )}

          <div className={`space-y-4 ${isSerious ? 'text-left' : ''}`}>
            {/* Email */}
            <motion.a
              href={`mailto:${content.contact.email}`}
              className={`
                block p-4 transition-all
                ${isSerious 
                  ? 'font-sans text-blue-600 hover:underline' 
                  : 'rounded-lg hover:scale-105'
                }
              `}
              style={!isSerious ? {
                background: 'linear-gradient(135deg, #FFEB3B 0%, #FDD835 100%)',
                boxShadow: '2px 2px 8px rgba(0,0,0,0.15)'
              } : {}}
              whileHover={isSerious ? {} : { rotate: 1, scale: 1.02 }}
            >
              {isSerious ? (
                <span>📧 {content.contact.email}</span>
              ) : (
                <span className="handwritten text-ink text-lg font-bold">📧 {content.contact.email}</span>
              )}
            </motion.a>

            {/* GitHub */}
            <motion.a
              href={`https://${content.contact.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                block p-4 transition-all
                ${isSerious 
                  ? 'font-sans text-blue-600 hover:underline' 
                  : 'rounded-lg hover:scale-105'
                }
              `}
              style={!isSerious ? {
                background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)',
                boxShadow: '2px 2px 8px rgba(0,0,0,0.15)'
              } : {}}
              whileHover={isSerious ? {} : { rotate: -1, scale: 1.02 }}
            >
              {isSerious ? (
                <span>🐙 {content.contact.github}</span>
              ) : (
                <span className="handwritten text-ink text-lg font-bold">🐙 {content.contact.github}</span>
              )}
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              href={`https://${content.contact.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                block p-4 transition-all
                ${isSerious 
                  ? 'font-sans text-blue-600 hover:underline' 
                  : 'rounded-lg hover:scale-105'
                }
              `}
              style={!isSerious ? {
                background: 'linear-gradient(135deg, #98FB98 0%, #32CD32 100%)',
                boxShadow: '2px 2px 8px rgba(0,0,0,0.15)'
              } : {}}
              whileHover={isSerious ? {} : { rotate: 1, scale: 1.02 }}
            >
              {isSerious ? (
                <span>💼 {content.contact.linkedin}</span>
              ) : (
                <span className="handwritten text-ink text-lg font-bold">💼 {content.contact.linkedin}</span>
              )}
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Fun footer in diary mode */}
      {!isSerious && (
        <motion.p
          className="handwritten text-center mt-12 text-ink/80 text-lg relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Thanks for reading my diary! ✨
        </motion.p>
      )}
    </section>
  );
}

