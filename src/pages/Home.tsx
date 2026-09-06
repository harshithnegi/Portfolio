import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ChevronRight, 
  ExternalLink, 
  Zap, 
  Sparkles,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import CertificateCard from '../components/CertificateCard';
import CertificateModal from '../components/CertificateModal';
import { useOffensiveMode } from '../context/ModeContext';
import { modeDataMap } from '../data/modeData';
import { certificatesList, CertificateItem } from '../data/certificatesData';
import { allProjects } from '../data/projectsData';

interface ServiceCardProps {
  icon: any;
  title: string;
  description: string;
  badge?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon: Icon, title, description, badge }) => {
  const { mode } = useOffensiveMode();

  const iconBg = mode === 'web' 
    ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20' 
    : mode === 'network' 
    ? 'bg-[#ff003c]/15 text-[#ff2a55] group-hover:bg-[#ff003c]/25 shadow-[0_0_12px_rgba(255,0,60,0.25)]' 
    : 'bg-neon-green/10 text-neon-green group-hover:bg-neon-green/20';

  const badgeBorder = mode === 'web'
    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    : mode === 'network'
    ? 'bg-[#ff003c]/15 text-[#ff2a55] border-[#ff003c]/40'
    : 'bg-neon-green/10 text-neon-green border-neon-green/30';

  const hoverBorder = mode === 'web'
    ? 'hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
    : mode === 'network'
    ? 'hover:border-[#ff003c]/60 hover:shadow-[0_0_22px_rgba(255,0,60,0.35)]'
    : 'hover:border-neon-green/40 hover:shadow-[0_0_15px_rgba(0,255,159,0.15)]';

  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className={`glass p-8 rounded-2xl border border-white/10 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between ${hoverBorder}`}
    >
      {badge && (
        <span className={`absolute top-4 right-4 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeBorder}`}>
          {badge}
        </span>
      )}
      <div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${iconBg}`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold mb-3 transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
      </div>
    </motion.div>
  );
};

interface SkillTagProps {
  name: string;
}

const SkillTag: React.FC<SkillTagProps> = ({ name }) => {
  const { mode } = useOffensiveMode();

  const hoverClass = mode === 'web'
    ? 'hover:border-blue-500/50 hover:text-blue-400'
    : mode === 'network'
    ? 'hover:border-[#ff003c]/60 hover:text-[#ff2a55] hover:shadow-[0_0_10px_rgba(255,0,60,0.3)]'
    : 'hover:border-neon-green/50 hover:text-neon-green';

  return (
    <span className={`px-4 py-2 glass rounded-full text-xs font-mono font-medium border border-white/10 ${hoverClass} transition-all cursor-default`}>
      {name}
    </span>
  );
};

const Home = () => {
  const { mode } = useOffensiveMode();
  const currentMode = modeDataMap[mode];
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  const handleDownloadCV = () => {
    const link = document.createElement('a');
    link.href = '/Harshit_Negi_Cybersecurity_Resume.pdf';
    link.download = 'Harshit_Negi_Cybersecurity_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  // Subtle ambient lighting - light, clean, not overwhelming
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

  const profileRing1 = mode === 'web' ? 'border-blue-500/30' : mode === 'network' ? 'border-[#ff003c]/40' : 'border-neon-green/30';
  const profileRing2 = mode === 'web' ? 'border-blue-400/20' : mode === 'network' ? 'border-[#ff2a55]/30' : 'border-neon-cyan/20';
  const profileBorder = mode === 'web' 
    ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.35)]' 
    : mode === 'network' 
    ? 'border-[#ff003c] shadow-[0_0_25px_rgba(255,0,60,0.6)]' 
    : 'border-neon-green neon-glow-green';

  return (
    <div className={`min-h-screen relative overflow-hidden bg-[#070c0a] ${currentMode.themeClass}`}>
      {/* Background Subtle Cyber Canvas */}
      <div className="fixed inset-0 cyber-grid opacity-25 pointer-events-none transition-all duration-500 will-change-transform" style={{ transform: 'translateZ(0)' }} />
      <div className={`fixed top-[-10%] right-[-10%] w-[500px] h-[500px] ${ambientGlowTop} blur-[100px] rounded-full pointer-events-none transition-all duration-500`} style={{ transform: 'translate3d(0,0,0)' }} />
      <div className={`fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] ${ambientGlowBottom} blur-[100px] rounded-full pointer-events-none transition-all duration-500`} style={{ transform: 'translate3d(0,0,0)' }} />

      <Navbar />

      <main>
        {/* Hero Section */}
        <section id="home" className="pt-32 pb-16 md:pt-44 md:pb-24 relative">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Active Specialization Pill Badge without Reset Button */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 glass rounded-full border mb-6 transition-all duration-500 ${currentMode.badge.pillClass}`}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentMode.badge.dotColor}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentMode.badge.dotColor}`}></span>
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider">{currentMode.badge.text}</span>
              </div>

              {/* Dynamic Headline */}
              <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
                {currentMode.headline.prefix} <br />
                <span className={`transition-all duration-500 ${currentMode.headline.accentColor}`}>
                  {currentMode.headline.highlight}
                </span>
              </h1>

              <p className="text-base md:text-lg text-gray-300 mb-8 max-w-lg leading-relaxed font-light">
                {currentMode.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link to="/portfolio">
                  <button className={`px-8 py-4 font-bold rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer ${currentMode.btnPrimaryClass}`}>
                    View Portfolio <ChevronRight size={20} />
                  </button>
                </Link>
                <a 
                  href="/Harshit_Negi_Cybersecurity_Resume.pdf"
                  download="Harshit_Negi_Cybersecurity_Resume.pdf"
                  className="px-8 py-4 glass border border-white/20 font-bold rounded-xl hover:border-white/50 text-white hover:bg-white/5 transition-all cursor-pointer inline-flex items-center gap-2.5"
                >
                  <FileText className="w-5 h-5 text-gray-300" />
                  Download CV
                </a>
              </div>
            </motion.div>

            {/* Profile Avatar with Clean Dynamic Ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-[spin_20s_linear_infinite] transition-colors duration-500 ${profileRing1}`} />
                <div className={`absolute inset-[-10px] rounded-full border animate-[spin_15s_linear_infinite_reverse] transition-colors duration-500 ${profileRing2}`} />
                <div 
                  className={`absolute inset-4 rounded-full overflow-hidden border-4 transition-all duration-500 select-none ${profileBorder}`}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img 
                    src="/Profile.jpg" 
                    alt="Harshit Negi - Cybersecurity" 
                    className="w-full h-full object-cover select-none pointer-events-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    style={{ WebkitTouchCallout: 'none' }}
                  />
                  {/* Transparent protective shield overlay */}
                  <div 
                    className="absolute inset-0 bg-transparent select-none z-10" 
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>

                {/* Floating Stats dynamic */}
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className={`absolute -top-4 -right-4 glass p-4 rounded-2xl border transition-all duration-500 shadow-lg ${currentMode.heroStats.stat1.border}`}
                >
                  <div className={`text-2xl font-bold font-display ${currentMode.heroStats.stat1.color}`}>{currentMode.heroStats.stat1.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">{currentMode.heroStats.stat1.label}</div>
                </motion.div>
                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className={`absolute -bottom-4 -left-4 glass p-4 rounded-2xl border transition-all duration-500 shadow-lg ${currentMode.heroStats.stat2.border}`}
                >
                  <div className={`text-2xl font-bold font-display ${currentMode.heroStats.stat2.color}`}>{currentMode.heroStats.stat2.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">{currentMode.heroStats.stat2.label}</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* About Section - Clean, Dark, Consistent */}
        <section id="about" className="py-20 bg-black/25 backdrop-blur-sm border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <SectionHeading 
                  title="Background & Mindset" 
                  subtitle="About Me" 
                  accent={mode === 'web' ? 'blue' : mode === 'network' ? 'red' : 'green'} 
                />
                <p className="text-gray-300 leading-relaxed mb-6">
                  I am a passionate and dedicated aspiring Cybersecurity Specialist with a strong foundation in offensive security principles, computer networks, and web technologies. My journey revolves around understanding systems deeply to uncover potential security gaps and engineer effective mitigations.
                </p>
                <p className="text-gray-300 leading-relaxed mb-8">
                  Constantly engaged in CTF challenges, hands-on lab environments, and real-world vulnerability research, I specialize in finding edge-case logic flaws, unauthorized data access channels, and misconfigurations.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-4 rounded-xl border border-white/10">
                    <div className="text-2xl font-bold font-mono text-white mb-1">01</div>
                    <div className="text-sm font-semibold text-gray-200">Ethical Standards</div>
                    <div className="text-xs text-gray-400 mt-0.5">Strict adherence to responsible disclosure guidelines.</div>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/10">
                    <div className="text-2xl font-bold font-mono text-white mb-1">02</div>
                    <div className="text-sm font-semibold text-gray-200">Offensive Mindset</div>
                    <div className="text-xs text-gray-400 mt-0.5">Thinking like an adversary to fortify defenses.</div>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-2xl border border-white/10 relative">
                <h3 className="text-lg font-mono font-bold uppercase tracking-wider mb-6 text-gray-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${mode === 'web' ? 'bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]' : mode === 'network' ? 'bg-[#ff003c] shadow-[0_0_10px_rgba(255,0,60,0.9)]' : 'bg-neon-green'}`} />
                  Key Security Tenets
                </h3>
                <ul className="space-y-4">
                  {[
                    'End-to-end vulnerability scanning and penetration test reporting',
                    'OWASP Top 10 web assessment and API flaw verification',
                    'Network traffic capture, packet dissection, and service reconnaissance',
                    'Linux host privilege escalation and SUID/cron auditing',
                    'Secure code review, remediation guidance, and developer advisory'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className={`font-mono font-bold mt-0.5 ${mode === 'web' ? 'text-blue-400' : mode === 'network' ? 'text-[#ff2a55] drop-shadow-[0_0_6px_rgba(255,0,60,0.7)]' : 'text-neon-green'}`}>▶</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <SectionHeading 
                title={mode === 'web' ? 'Web VAPT Services' : mode === 'network' ? 'Network & Host Services' : 'Specialized Services'} 
                subtitle="What I Do" 
                accent={mode === 'web' ? 'blue' : mode === 'network' ? 'red' : 'green'} 
              />
              <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
                {mode === 'web' 
                  ? 'High-impact web application security assessments, API fuzzing, and business logic validation.'
                  : mode === 'network'
                  ? 'Network architecture scanning, host exploitation, active directory testing, and credential auditing.'
                  : 'Delivering end-to-end offensive assessments to uncover weaknesses before bad actors exploit them.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentMode.services.map((service, idx) => (
                <ServiceCard 
                  key={idx}
                  icon={service.icon} 
                  title={service.title} 
                  description={service.description}
                  badge={service.badge}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Technical Arsenal / Skills Section - Clean, Dark, Consistent */}
        <section id="skills" className="py-20 bg-black/25 backdrop-blur-sm border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="md:w-1/3 sticky top-28">
                <SectionHeading 
                  title="Technical Arsenal" 
                  subtitle="Skills & Tools" 
                  accent={mode === 'web' ? 'blue' : mode === 'network' ? 'red' : 'green'} 
                />
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                  My toolkit adapts dynamically according to offensive specialization — covering interceptors, fuzzers, network scanners, and privilege escalation frameworks.
                </p>
                <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-white/10">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Zap className={mode === 'web' ? 'text-blue-400' : mode === 'network' ? 'text-[#ff2a55] drop-shadow-[0_0_8px_rgba(255,0,60,0.8)]' : 'text-neon-green'} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Continuous Research</div>
                    <div className="text-xs text-gray-400">Regularly updated with Zero-Day CVEs</div>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3 w-full">
                <div className="space-y-8">
                  {currentMode.arsenal.map((group, idx) => (
                    <div key={idx} className="glass p-6 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-300">
                          {group.category}
                        </h4>
                        {group.highlight && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            mode === 'web' 
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
                              : mode === 'network' 
                              ? 'bg-[#ff003c]/20 text-[#ff2a55] border-[#ff003c]/40 shadow-[0_0_10px_rgba(255,0,60,0.35)]' 
                              : 'bg-neon-green/15 text-neon-green border-neon-green/30'
                          }`}>
                            Active Focus
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {group.tools.map((tool, tIdx) => (
                          <SkillTag key={tIdx} name={tool} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section id="projects" className="py-20">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-16">
              <SectionHeading 
                title="Security Tools & Operations" 
                subtitle="Projects" 
                accent={mode === 'web' ? 'blue' : mode === 'network' ? 'red' : 'green'} 
              />
              <Link to="/portfolio" className="hidden md:flex items-center gap-2 font-bold hover:underline mb-12 text-sm text-gray-300 hover:text-white">
                View All Projects <ExternalLink size={16} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProjects.map((proj) => (
                <ProjectCard 
                  key={proj.id}
                  id={proj.id}
                  title={proj.title}
                  category={proj.category}
                  image={proj.image}
                  tags={proj.tags}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Accredited Certifications Section */}
        <section id="certifications" className="py-20 border-t border-white/5 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <SectionHeading 
                  title="Accredited Certifications" 
                  subtitle="Industry Credentials" 
                  accent={mode === 'web' ? 'blue' : mode === 'network' ? 'red' : 'green'} 
                />
                <p className="text-gray-400 max-w-2xl text-sm md:text-base mt-2">
                  Recognized cybersecurity certifications covering Ethical Hacking, Penetration Testing, OSINT, and Network Defense.
                </p>
              </div>
              <Link 
                to="/portfolio" 
                className="inline-flex items-center gap-2 font-mono text-xs md:text-sm text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 w-fit"
              >
                View Full Archive ({certificatesList.length}) <ExternalLink size={15} />
              </Link>
            </div>

            {/* Uniform Certificate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {certificatesList.slice(0, 6).map((cert, idx) => (
                <CertificateCard
                  key={cert.id}
                  cert={cert}
                  index={idx}
                  onView={(c) => setSelectedCert(c)}
                  accentColor={mode === 'web' ? 'text-blue-400' : mode === 'network' ? 'text-[#ff2a55]' : 'text-neon-green'}
                />
              ))}
            </div>

            {certificatesList.length > 6 && (
              <div className="mt-12 text-center">
                <Link to="/portfolio">
                  <button className="px-8 py-3.5 glass border border-white/20 hover:border-white/40 text-white font-mono text-sm rounded-xl transition-all hover:bg-white/5 cursor-pointer">
                    Explore All {certificatesList.length} Professional Certificates →
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Contact Section - Clean with Verified Email */}
        <section id="contact" className="py-20 border-t border-white/5 bg-black/30">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <SectionHeading 
              title="Initiate Contact" 
              subtitle="Let's Connect" 
              accent={mode === 'web' ? 'blue' : mode === 'network' ? 'red' : 'green'} 
            />
            <p className="text-gray-400 mb-8 text-sm md:text-base leading-relaxed">
              Available for penetration testing opportunities, application security reviews, CTF collaborations, and cybersecurity consulting.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="mailto:harshit.negi2003@gmail.com" 
                className={`px-8 py-4 font-bold rounded-xl transition-all cursor-pointer ${currentMode.btnPrimaryClass}`}
              >
                Send Email (harshit.negi2003@gmail.com)
              </a>
              <a 
                href="/Harshit_Negi_Cybersecurity_Resume.pdf"
                download="Harshit_Negi_Cybersecurity_Resume.pdf"
                className="px-8 py-4 glass border border-white/20 font-bold rounded-xl text-white hover:bg-white/5 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <FileText className="w-5 h-5 text-gray-300" />
                Download Resume (PDF)
              </a>
              <Link 
                to="/portfolio" 
                className="px-8 py-4 glass border border-white/20 font-bold rounded-xl text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Explore Archive
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Certificate Inspection Lightbox Modal */}
      <CertificateModal
        selectedCert={selectedCert}
        certificates={certificatesList}
        onClose={() => setSelectedCert(null)}
        onSelect={(c) => setSelectedCert(c)}
        accentColor={mode === 'web' ? 'text-blue-400' : mode === 'network' ? 'text-[#ff2a55]' : 'text-neon-green'}
      />
    </div>
  );
};

export default Home;
