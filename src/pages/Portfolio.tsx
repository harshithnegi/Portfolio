import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, ShieldCheck, Shield, FileText, Play, Terminal, Globe, Network, Cpu } from 'lucide-react';
import Navbar from '../components/Navbar';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import CertificateCard from '../components/CertificateCard';
import CertificateModal from '../components/CertificateModal';
import { useOffensiveMode } from '../context/ModeContext';
import { modeDataMap } from '../data/modeData';
import { certificatesList, CertificateItem } from '../data/certificatesData';
import { allProjects } from '../data/projectsData';

const Portfolio = () => {
  const { mode } = useOffensiveMode();
  const currentMode = modeDataMap[mode];
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'web' | 'network' | 'host'>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // All 6 Security Tools
  const filteredProjects = selectedFilter === 'all' 
    ? allProjects 
    : allProjects.filter((p) => p.mode === selectedFilter);

  // Subtle ambient glows - light, clean
  const ambientGlowTop = mode === 'web'
    ? 'bg-blue-500/10'
    : mode === 'network'
    ? 'bg-[#ff003c]/15'
    : 'bg-neon-green/10';

  const ambientGlowBottom = mode === 'web'
    ? 'bg-blue-600/10'
    : mode === 'network'
    ? 'bg-[#ff1744]/15'
    : 'bg-neon-cyan/10';

  const headingAccent = mode === 'web'
    ? 'text-blue-400'
    : mode === 'network'
    ? 'text-[#ff2a55] drop-shadow-[0_0_10px_rgba(255,0,60,0.7)]'
    : 'text-neon-green';

  return (
    <div className={`min-h-screen relative overflow-hidden bg-[#070c0a] ${currentMode.themeClass}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none transition-all duration-500 will-change-transform" style={{ transform: 'translateZ(0)' }} />
      <div className={`fixed top-[-10%] right-[-10%] w-[500px] h-[500px] ${ambientGlowTop} blur-[100px] rounded-full pointer-events-none transition-all duration-500`} style={{ transform: 'translate3d(0,0,0)' }} />
      <div className={`fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] ${ambientGlowBottom} blur-[100px] rounded-full pointer-events-none transition-all duration-500`} style={{ transform: 'translate3d(0,0,0)' }} />

      <Navbar />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <SectionHeading 
              title="Operations & Credentials" 
              subtitle="Full Archive" 
              accent={mode === 'web' ? 'blue' : mode === 'network' ? 'red' : 'green'} 
            />
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base mb-6">
              A comprehensive gallery of my cybersecurity projects, security assessments, and professional certifications.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a 
                href="/Harshit_Negi_Cybersecurity_Resume.pdf"
                download="Harshit_Negi_Cybersecurity_Resume.pdf"
                className="inline-flex items-center gap-2 px-5 py-2.5 glass border border-white/20 hover:border-white/40 text-white font-mono text-xs rounded-xl hover:bg-white/5 transition-all shadow-md cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                Download Official Resume (PDF)
              </a>
            </div>
          </div>

          {/* Projects Gallery */}
          <div className="mb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className={`text-xl md:text-2xl font-display font-bold uppercase tracking-widest ${headingAccent}`}>
                  Security Projects & Live Tools ({allProjects.length})
                </h3>
                <p className="text-xs md:text-sm text-gray-400 mt-1 font-mono">
                  Click any project to open its dedicated live interactive analysis interface.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  category={project.category}
                  image={project.image}
                  tags={project.tags}
                />
              ))}
            </div>
          </div>

          {/* Certifications Gallery */}
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
              <div>
                <h3 className={`text-xl md:text-2xl font-display font-bold uppercase tracking-widest ${headingAccent}`}>
                  Certifications & Credentials
                </h3>
                <p className="text-xs md:text-sm text-gray-400 mt-1 font-mono">
                  Accredited security badges, industry credentials & professional certifications ({certificatesList.length} Total)
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl w-fit">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>All Badges Verified • Uniform Aspect Ratio</span>
              </div>
            </div>

            {/* 
              Uniform Certificate Grid:
              Every card has the exact same dimensions and fixed 16:10 aspect ratio for crisp, consistent display.
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {certificatesList.map((cert, index) => (
                <CertificateCard
                  key={cert.id}
                  cert={cert}
                  index={index}
                  onView={(c) => setSelectedCert(c)}
                  accentColor={headingAccent}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Lightbox / Modal for inspecting full certificate image */}
      <CertificateModal
        selectedCert={selectedCert}
        certificates={certificatesList}
        onClose={() => setSelectedCert(null)}
        onSelect={(c) => setSelectedCert(c)}
        accentColor={headingAccent}
      />

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/40">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className={`w-6 h-6 ${headingAccent}`} />
            <span className="text-xl font-display font-bold tracking-tighter">
              HARSHIT <span className={headingAccent}>NEGI</span>
            </span>
          </div>
          <p className="text-gray-500 text-xs font-mono">
            © 2026 Harshit Negi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;
