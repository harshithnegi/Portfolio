import React from 'react';
import { motion } from 'motion/react';

interface SectionHeadingProps {
  title: string;
  subtitle: string;
  accent?: "green" | "cyan" | "blue" | "red";
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ title, subtitle, accent = "green" }) => {
  let accentClass = "text-neon-green";
  if (accent === "blue" || accent === "cyan") {
    accentClass = "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]";
  } else if (accent === "red") {
    accentClass = "text-[#ff2a55] drop-shadow-[0_0_12px_rgba(255,0,60,0.85)]";
  }

  return (
    <div className="mb-12">
      <motion.span 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`text-xs font-bold uppercase tracking-[0.3em] ${accentClass}`}
      >
        {subtitle}
      </motion.span>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-display font-bold mt-2"
      >
        {title}
      </motion.h2>
    </div>
  );
};

export default SectionHeading;
