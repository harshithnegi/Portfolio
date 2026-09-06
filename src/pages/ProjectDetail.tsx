import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import { allProjects } from '../data/projectsData';

// 6 Core Security Tools (Real Data Collection & Live Probing)
import { DomainDossier } from '../components/tools/DomainDossier';
import { PasswordStrengthChecker } from '../components/tools/PasswordStrengthChecker';
import { WebVulnerabilityScanner } from '../components/tools/WebVulnerabilityScanner';
import { IpDomainValidator } from '../components/tools/IpDomainValidator';
import { WebsiteSafetyChecker } from '../components/tools/WebsiteSafetyChecker';
import { IpAddressChecker } from '../components/tools/IpAddressChecker';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();

  const project = allProjects.find((p) => p.id === id) || allProjects[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const renderTool = () => {
    switch (project.id) {
      case 'domain-dossier':
        return <DomainDossier />;
      case 'password-checker':
        return <PasswordStrengthChecker />;
      case 'web-vuln-nikto':
        return <WebVulnerabilityScanner />;
      case 'ip-domain-validator':
        return <IpDomainValidator />;
      case 'website-safety':
        return <WebsiteSafetyChecker />;
      case 'my-ip':
        return <IpAddressChecker />;
      default:
        return <DomainDossier />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-white selection:bg-neon-green selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        {/* Clean, Minimalist Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
          <div className="flex items-center gap-3 text-xs font-mono">
            <Link
              to="/portfolio"
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-gray-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft size={14} className="text-neon-green" /> Back to Projects
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-neon-green font-bold tracking-wide uppercase">{project.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Operational Tool
            </span>
          </div>
        </div>

        {/* Minimal Tool Header - No Pretext, Just Crisp Title & Purpose */}
        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white mb-1">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-mono">
              {project.subtitle || project.description}
            </p>
          </div>
        </div>

        {/* Dedicated Live Tool Workspace */}
        <div className="relative">
          {renderTool()}
        </div>
      </main>
    </div>
  );
}
