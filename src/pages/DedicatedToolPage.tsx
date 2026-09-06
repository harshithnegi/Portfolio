import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Terminal, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import { DomainDossier } from '../components/tools/DomainDossier';
import { PasswordStrengthChecker } from '../components/tools/PasswordStrengthChecker';
import { WebVulnerabilityScanner } from '../components/tools/WebVulnerabilityScanner';
import { IpDomainValidator } from '../components/tools/IpDomainValidator';
import { WebsiteSafetyChecker } from '../components/tools/WebsiteSafetyChecker';
import { IpAddressChecker } from '../components/tools/IpAddressChecker';

export const toolMeta: Record<string, {
  name: string;
  category: string;
  badge: string;
  desc: string;
}> = {
  'domain-dossier': {
    name: 'Domain Dossier',
    category: 'Network Reconnaissance',
    badge: 'CentralOps Engine',
    desc: 'Perform domain whois, DNS zone resolution, network traceroute hops, IP network whois & port service scanning.',
  },
  'password-checker': {
    name: 'Password Strength Checker',
    category: 'Authentication Security',
    badge: 'Entropy & Patterns',
    desc: 'Evaluate password strength based on entropy, character diversity, dictionary sequences, and keyboard walk patterns.',
  },
  'web-vuln-nikto': {
    name: 'Web Vulnerability Identifier',
    category: 'Vulnerability Assessment',
    badge: 'Nikto Scanner',
    desc: 'Conduct automated web vulnerability assessments, live scan progress tracking, sensitive path probes, and remediation guidance.',
  },
  'ip-domain-validator': {
    name: 'IP / Domain Validator',
    category: 'Input Verification & Networking',
    badge: 'RFC Standards',
    desc: 'Instantly detect and validate IPv4, IPv6, Domain FQDN, or URL inputs with in-depth binary, class, and RFC scope analysis.',
  },
  'website-safety': {
    name: 'Website Safety Checker',
    category: 'Web Hygiene & Defense',
    badge: 'Posture Audit',
    desc: 'Inspect website SSL/TLS certificate validity, HTTPS enforcement, defense headers posture, and phishing risk factors.',
  },
  'my-ip': {
    name: 'IP Address Checker',
    category: 'Identity & Geo Reconnaissance',
    badge: 'What Is My IP?',
    desc: 'Identify your public IP address, ISP provider, Autonomous System (ASN), reverse DNS PTR, and geolocation coordinates.',
  },
};

export const DedicatedToolPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const toolKey = id || 'domain-dossier';
  const meta = toolMeta[toolKey] || {
    name: 'Security Tool',
    category: 'Cybersecurity Utility',
    badge: 'Operational',
    desc: 'Interactive operational security script.',
  };

  const renderTool = () => {
    switch (toolKey) {
      case 'domain-dossier':
      case 'vapt-scanner':
        return <DomainDossier />;
      case 'password-checker':
      case 'password-crypto-analyzer':
        return <PasswordStrengthChecker />;
      case 'web-vuln-nikto':
      case 'web-header-analyzer':
        return <WebVulnerabilityScanner />;
      case 'ip-domain-validator':
      case 'subdomain-recon-tool':
        return <IpDomainValidator />;
      case 'website-safety':
      case 'cors-request-analyzer':
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

      <main className="pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Minimal Clean Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-800 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Tools
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-xs font-mono text-neon-green font-bold uppercase">{meta.category}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">
              ● {meta.badge}
            </span>
          </div>
        </div>

        {/* Dedicated Tool Workspace */}
        <div className="relative">
          {renderTool()}
        </div>
      </main>
    </div>
  );
};
