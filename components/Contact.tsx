'use client';

import { motion } from 'framer-motion';
import { useSeriousMode } from '@/contexts/SeriousModeContext';
import content from '@/data/content.json';

export default function Contact() {
  const { isSerious } = useSeriousMode();

  return (
    <section id="contact" className="py-20 relative">
      <motion.h2
        className={`text-3xl md:text-4xl text-center mb-12 text-ink ${isSerious ? 'font-sans font-bold' : 'diary-title'}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {isSerious ? 'Contact Information' : "Let's Talk! 📬"}
      </motion.h2>

      <motion.div
        className={`
          max-w-md mx-auto px-4 text-center
          ${isSerious ? '' : 'wobbly-border bg-paper/80 p-8'}
        `}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
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
              block p-3 transition-all
              ${isSerious 
                ? 'font-sans text-blue-600 hover:underline' 
                : 'post-it hover:scale-105'
              }
            `}
            whileHover={isSerious ? {} : { rotate: 2 }}
          >
            {isSerious ? (
              <span>📧 {content.contact.email}</span>
            ) : (
              <span className="handwritten text-ink">📧 {content.contact.email}</span>
            )}
          </motion.a>

          {/* GitHub */}
          <motion.a
            href={`https://${content.contact.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              block p-3 transition-all
              ${isSerious 
                ? 'font-sans text-blue-600 hover:underline' 
                : 'post-it-blue hover:scale-105'
              }
            `}
            whileHover={isSerious ? {} : { rotate: -2 }}
          >
            {isSerious ? (
              <span>🐙 {content.contact.github}</span>
            ) : (
              <span className="handwritten text-ink">🐙 {content.contact.github}</span>
            )}
          </motion.a>

          {/* LinkedIn */}
          <motion.a
            href={`https://${content.contact.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              block p-3 transition-all
              ${isSerious 
                ? 'font-sans text-blue-600 hover:underline' 
                : 'post-it-green hover:scale-105'
              }
            `}
            whileHover={isSerious ? {} : { rotate: 1 }}
          >
            {isSerious ? (
              <span>💼 {content.contact.linkedin}</span>
            ) : (
              <span className="handwritten text-ink">💼 {content.contact.linkedin}</span>
            )}
          </motion.a>
        </div>
      </motion.div>

      {/* Fun footer in diary mode */}
      {!isSerious && (
        <motion.p
          className="handwritten text-center mt-12 text-ink/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Thanks for reading my diary! 📖✨
        </motion.p>
      )}
    </section>
  );
}
