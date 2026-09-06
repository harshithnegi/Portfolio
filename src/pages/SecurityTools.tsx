import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  KeyRound, 
  Bug, 
  Binary, 
  ShieldCheck, 
  Network, 
  ExternalLink,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { DomainDossier } from '../components/tools/DomainDossier';
import { PasswordStrengthChecker } from '../components/tools/PasswordStrengthChecker';
import { WebVulnerabilityScanner } from '../components/tools/WebVulnerabilityScanner';
import { IpDomainValidator } from '../components/tools/IpDomainValidator';
import { WebsiteSafetyChecker } from '../components/tools/WebsiteSafetyChecker';
import { IpAddressChecker } from '../components/tools/IpAddressChecker';

export const SecurityTools: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTool = searchParams.get('tool') || 'domain-dossier';
  const [activeTool, setActiveTool] = useState<string>(initialTool);

  useEffect(() => {
    const t = searchParams.get('tool');
    if (t) {
      setActiveTool(t);
    }
  }, [searchParams]);

  const handleSelectTool = (id: string) => {
    setActiveTool(id);
    setSearchParams({ tool: id });
  };

  const tools = [
    {
      id: 'domain-dossier',
      name: 'Domain Dossier',
      tagline: 'Whois, DNS, Traceroute & Ports',
      icon: Globe,
      accent: 'text-neon-green',
      badge: 'CentralOps Style',
      description: 'Domain WHOIS, authoritative DNS records, network traceroute hops, IP network WHOIS & service scan.',
    },
    {
      id: 'password-checker',
      name: 'Password Strength Checker',
      tagline: 'Entropy & Common Patterns',
      icon: KeyRound,
      accent: 'text-emerald-400',
      badge: 'Authentication',
      description: 'Calculates cryptographic entropy, character diversity, dictionary sequences, and keyboard walk patterns.',
    },
    {
      id: 'web-vuln-nikto',
      name: 'Web Vulnerability Identifier',
      tagline: 'Nikto Security Scan Engine',
      icon: Bug,
      accent: 'text-rose-400',
      badge: 'Nikto Scanner',
      description: 'Web vulnerability scanner testing sensitive endpoints, server banners, clickjacking, CSP, and dangerous HTTP methods.',
    },
    {
      id: 'ip-domain-validator',
      name: 'IP / Domain Validator',
      tagline: 'IPv4, IPv6, Domain & URL Verification',
      icon: Binary,
      accent: 'text-cyan-400',
      badge: 'RFC Standards',
      description: 'Detects and validates IPv4, IPv6, FQDN domain, and URLs with in-depth binary, scope, and class analysis.',
    },
    {
      id: 'website-safety',
      name: 'Website Safety Checker',
      tagline: 'Basic Security & Posture Audit',
      icon: ShieldCheck,
      accent: 'text-violet-400',
      badge: 'Web Hygiene',
      description: 'Checks SSL/TLS certificate validity, HTTPS redirection, defense headers, and phishing risk indicators.',
    },
    {
      id: 'my-ip',
      name: 'IP Address Checker',
      tagline: '"What is my IP?" & Info',
      icon: Network,
      accent: 'text-yellow-400',
      badge: 'Identity Recon',
      description: 'Instant public IP lookup, ISP provider, Autonomous System (ASN), reverse DNS PTR, and geolocation.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-white selection:bg-neon-green selection:text-black">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
        {/* Clean Header with Compact Tool Selector */}
        <div className="pb-4 border-b border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neon-green" />
                Security Tools Suite
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Interactive cybersecurity reconnaissance, assessment, and cryptographic auditing tools.
              </p>
            </div>

            <Link
              to={`/tools/${activeTool}`}
              className="px-3.5 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green hover:text-black transition-all text-xs font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto"
            >
              Open in Dedicated Page <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Compact Tab Switcher */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-neon-green/15 border-neon-green/50 text-neon-green font-bold shadow-[0_0_12px_rgba(0,255,159,0.15)]'
                      : 'bg-white/5 border-gray-800 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tool.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tool Workspace */}
        <div className="pt-2">
          {activeTool === 'domain-dossier' && <DomainDossier />}
          {activeTool === 'password-checker' && <PasswordStrengthChecker />}
          {activeTool === 'web-vuln-nikto' && <WebVulnerabilityScanner />}
          {activeTool === 'ip-domain-validator' && <IpDomainValidator />}
          {activeTool === 'website-safety' && <WebsiteSafetyChecker />}
          {activeTool === 'my-ip' && <IpAddressChecker />}
        </div>
      </main>
    </div>
  );
};
