import React from 'react';
import { motion } from 'motion/react';
import { Maximize2, CheckCircle2, Award } from 'lucide-react';
import { CertificateItem } from '../data/certificatesData';

interface CertificateCardProps {
  cert: CertificateItem;
  index: number;
  onView: (cert: CertificateItem) => void;
  accentColor?: string;
  badgeBorderColor?: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  cert,
  index,
  onView,
  accentColor = 'text-neon-green',
  badgeBorderColor = 'border-neon-green/30'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onView(cert)}
      className="glass rounded-2xl border border-white/10 hover:border-white/25 overflow-hidden transition-all duration-300 flex flex-col h-full group cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1"
    >
      {/* 
        Uniform Certificate Image Frame
        Fixed 16:10 aspect ratio ensures every single image container has identical height and width across all cards.
      */}
      <div 
        className="relative w-full aspect-[16/10] overflow-hidden bg-[#040806] border-b border-white/10 flex items-center justify-center select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Clean, high-performance framed backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-black/60 pointer-events-none" />

        {/* Foreground certificate - fully contained so no seal, title, or signature is clipped */}
        <img
          src={cert.image}
          alt={cert.title}
          loading="lazy"
          decoding="async"
          className="relative z-10 w-full h-full object-contain p-2.5 transition-transform duration-500 group-hover:scale-[1.03] pointer-events-none select-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
          style={{ WebkitTouchCallout: 'none' }}
        />

        {/* Transparent anti-select protective overlay */}
        <div 
          className="absolute inset-0 z-20 bg-transparent select-none"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />

        {/* Hover Action Badge */}
        <div className="absolute inset-0 z-30 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono font-medium text-white shadow-md">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            Click to Enlarge
          </span>
          <span className="text-[11px] font-mono text-gray-300 bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/15">
            Verified
          </span>
        </div>
      </div>

      {/* Card Content Information */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Header with Issuer & Year */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300 font-medium">
              <Award className={`w-3.5 h-3.5 ${accentColor}`} />
              {cert.issuer}
            </span>
            <span className={`text-xs font-mono font-bold ${accentColor}`}>
              {cert.year}
            </span>
          </div>

          {/* Certificate Title */}
          <h4 className="font-bold text-white text-base md:text-lg leading-snug group-hover:text-cyan-300 transition-colors line-clamp-2 min-h-[2.8rem] flex items-center">
            {cert.title}
          </h4>

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cert.skills.slice(0, 3).map((skill, sIdx) => (
              <span
                key={sIdx}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Button / Action */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Accredited Security Proof
          </span>
          <span className="text-xs font-mono text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">
            View →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateCard;
