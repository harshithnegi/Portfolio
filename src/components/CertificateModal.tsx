import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Award, ShieldCheck } from 'lucide-react';
import { CertificateItem } from '../data/certificatesData';

interface CertificateModalProps {
  selectedCert: CertificateItem | null;
  certificates: CertificateItem[];
  onClose: () => void;
  onSelect: (cert: CertificateItem) => void;
  accentColor?: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  selectedCert,
  certificates,
  onClose,
  onSelect,
  accentColor = 'text-neon-green'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCert) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        const currentIndex = certificates.findIndex(c => c.id === selectedCert.id);
        const prevIndex = (currentIndex - 1 + certificates.length) % certificates.length;
        onSelect(certificates[prevIndex]);
      }
      if (e.key === 'ArrowRight') {
        const currentIndex = certificates.findIndex(c => c.id === selectedCert.id);
        const nextIndex = (currentIndex + 1) % certificates.length;
        onSelect(certificates[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCert, certificates, onClose, onSelect]);

  if (!selectedCert) return null;

  const currentIndex = certificates.findIndex(c => c.id === selectedCert.id);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + certificates.length) % certificates.length;
    onSelect(certificates[prevIndex]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % certificates.length;
    onSelect(certificates[nextIndex]);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-[#090d0b] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Award className={`w-5 h-5 ${accentColor}`} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base md:text-lg leading-tight">
                  {selectedCert.title}
                </h3>
                <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5 font-mono">
                  <span>{selectedCert.issuer}</span>
                  <span>•</span>
                  <span>{selectedCert.year}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Credential
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                {currentIndex + 1} / {certificates.length}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Image Viewport */}
          <div className="relative flex-1 min-h-[300px] max-h-[68vh] bg-black/90 flex items-center justify-center p-3 md:p-6 overflow-hidden select-none">
            {/* Ambient subtle backglow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 blur-2xl">
              <img
                src={selectedCert.image}
                alt=""
                className="w-full h-full object-cover scale-125"
                draggable={false}
              />
            </div>

            {/* Main High-Res Certificate Image */}
            <img
              src={selectedCert.image}
              alt={selectedCert.title}
              className="relative z-10 max-h-[64vh] w-auto max-w-full object-contain rounded-lg border border-white/10 shadow-2xl pointer-events-none select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{ WebkitTouchCallout: 'none' }}
            />

            {/* Protective Overlay Layer */}
            <div 
              className="absolute inset-0 z-20 bg-transparent select-none"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 hover:border-white/40 flex items-center justify-center text-white backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110"
              aria-label="Previous certificate"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 hover:border-white/40 flex items-center justify-center text-white backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110"
              aria-label="Next certificate"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Footer with Skills / Tags */}
          <div className="px-6 py-3 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-gray-400 font-mono mr-1">Skills Verified:</span>
              {selectedCert.skills.map((skill, sIdx) => (
                <span 
                  key={sIdx}
                  className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300 font-mono text-[11px]"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="text-[11px] font-mono text-gray-400 hidden sm:block">
              Use <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15 text-white">←</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15 text-white">→</kbd> to browse • <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15 text-white">ESC</kbd> to close
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CertificateModal;
