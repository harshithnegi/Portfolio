import { 
  Bug, 
  Search, 
  Globe, 
  Network, 
  Target, 
  Terminal, 
  Shield, 
  Lock, 
  Key, 
  Database, 
  Server, 
  FileCode, 
  AlertTriangle, 
  Radio, 
  Fingerprint 
} from 'lucide-react';
import { OffensiveMode } from '../context/ModeContext';

export interface ModeContent {
  themeClass: string;
  badge: {
    text: string;
    pillClass: string;
    dotColor: string;
  };
  headline: {
    prefix: string;
    highlight: string;
    accentColor: string;
    suffix?: string;
  };
  description: string;
  heroStats: {
    stat1: { value: string; label: string; color: string; border: string };
    stat2: { value: string; label: string; color: string; border: string };
  };
  btnPrimaryClass: string;
  services: {
    icon: any;
    title: string;
    description: string;
    badge?: string;
  }[];
  arsenal: {
    category: string;
    tools: string[];
    highlight?: boolean;
  }[];
  featuredProjects: {
    id?: string;
    title: string;
    category: string;
    description: string;
    image: string;
    tags: string[];
    findings: string[];
    severity: 'Critical' | 'High' | 'Medium';
  }[];
}

export const modeDataMap: Record<OffensiveMode, ModeContent> = {
  default: {
    themeClass: 'theme-default',
    badge: {
      text: 'CYBERSECURITY & OFFENSIVE SECURITY SPECIALIST',
      pillClass: 'border-neon-green/30 text-neon-green bg-neon-green/5 shadow-[0_0_15px_rgba(0,255,159,0.15)]',
      dotColor: 'bg-neon-green',
    },
    headline: {
      prefix: 'Securing the',
      highlight: 'Digital World',
      accentColor: 'neon-text-green',
      suffix: 'with precision.',
    },
    description:
      "I'm Harshit Negi, an aspiring Cybersecurity Specialist & Ethical Hacker focused on web application security, penetration testing, and vulnerability assessment. I help identify and fix security flaws before attackers do.",
    heroStats: {
      stat1: { value: '75+', label: 'Labs Completed', color: 'neon-text-green', border: 'border-neon-green/30' },
      stat2: { value: '5%', label: 'Top TryHackMe Ranking', color: 'neon-text-blue', border: 'border-blue-500/30' },
    },
    btnPrimaryClass: 'bg-neon-green text-black shadow-[0_0_20px_rgba(0,255,159,0.4)] hover:bg-opacity-90',
    services: [
      {
        icon: Bug,
        title: 'Penetration Testing',
        description: 'Performing manual and automated security testing on web applications to identify vulnerabilities like XSS, SQLi, and misconfigurations.',
      },
      {
        icon: Search,
        title: 'Vulnerability Assessment',
        description: 'Scanning and analyzing systems to find critical security weaknesses and recommending hardening fixes.',
      },
      {
        icon: Globe,
        title: 'Web Security Analysis',
        description: 'Testing websites against OWASP Top 10 vulnerabilities and enhancing their security posture.',
      },
      {
        icon: Network,
        title: 'Network Penetration Testing',
        description: 'Understanding and probing network infrastructures with tools like Nmap, Wireshark, and Metasploit.',
      },
      {
        icon: Target,
        title: 'Bug Bounty Practice',
        description: 'Actively discovering real-world vulnerabilities, logic bypasses, and privilege issues across testing grounds.',
      },
      {
        icon: Terminal,
        title: 'Linux & Exploit Arsenal',
        description: 'Working with Kali Linux, Bash scripting, and custom Python payloads for fast reconnaissance.',
      },
    ],
    arsenal: [
      { category: 'Web Application Security', tools: ['Burp Suite Pro', 'OWASP ZAP', 'Postman', 'Ffuf', 'SQLMap'] },
      { category: 'Network & Packet Inspection', tools: ['Nmap', 'Wireshark', 'Metasploit', 'Netcat', 'TCPDump'] },
      { category: 'Environments & Scripting', tools: ['Kali Linux', 'Parrot OS', 'Python', 'Bash', 'Git'] },
      { category: 'Security Frameworks', tools: ['OWASP Top 10', 'CVSS 3.1', 'NIST CSF', 'MITRE ATT&CK'] },
    ],
    featuredProjects: [
      {
        id: 'domain-dossier',
        title: 'Domain Dossier (CentralOps Style)',
        category: 'Network Reconnaissance',
        description: 'Comprehensive domain and IP intelligence: WHOIS registration, DNS zone records, network traceroute hops, and active TCP port service inspection.',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        tags: ['Domain Dossier', 'CentralOps', 'Whois', 'DNS Records', 'Traceroute', 'Port Scan'],
        findings: ['Authoritative DNS zone records resolution', 'Real-time traceroute route calculation'],
        severity: 'High',
      },
      {
        id: 'password-checker',
        title: 'Password Strength & Pattern Analyzer',
        category: 'Authentication Security',
        description: 'Cryptographic Shannon entropy evaluator, dictionary phrase pattern detection, and keyboard walk sequence analyzer.',
        image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800',
        tags: ['Password Strength', 'Entropy', 'Pattern Detection', 'NIST Standards', 'MFA'],
        findings: ['Brute-force crack resistance analysis', 'Detects predictable keyboard walk sequences'],
        severity: 'High',
      },
      {
        id: 'web-vuln-nikto',
        title: 'Web Vulnerability Identifier (Nikto Scanner)',
        category: 'Web Application VAPT',
        description: 'Automated Nikto-style web vulnerability scanning with real-time terminal log stream, progress bar, and remediation guidance.',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
        tags: ['Nikto Scanner', 'Web Vulnerability', 'Information Leak', 'OWASP Top 10', 'Terminal Log'],
        findings: ['Exposed sensitive git repositories and env files probe', 'Security headers posture inspection'],
        severity: 'Critical',
      },
    ],
  },

  web: {
    themeClass: 'theme-web',
    badge: {
      text: 'APPLICATION SECURITY & API VAPT SPECIALIST',
      pillClass: 'border-blue-500/40 text-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
      dotColor: 'bg-blue-500',
    },
    headline: {
      prefix: 'Hunting Flaws in',
      highlight: 'Modern Web & APIs',
      accentColor: 'neon-text-blue',
      suffix: 'before launch.',
    },
    description:
      'Specialized in uncovering complex business logic vulnerabilities, authorization bypasses (IDOR/BOLA), authentication flaws, and injection vectors across cloud applications and microservices.',
    heroStats: {
      stat1: { value: 'OWASP', label: 'Top 10 Expertise', color: 'neon-text-blue', border: 'border-blue-500/40' },
      stat2: { value: 'REST / GraphQL', label: 'API Security Testing', color: 'text-blue-300', border: 'border-blue-500/40' },
    },
    btnPrimaryClass: 'bg-blue-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:bg-blue-500',
    services: [
      {
        icon: Globe,
        title: 'OWASP Top 10 Auditing',
        description: 'Exhaustive manual testing for SQL Injection, XSS, SSRF, Cross-Origin Resource Sharing (CORS) flaws, and misconfigurations.',
        badge: 'CORE FOCUS',
      },
      {
        icon: Key,
        title: 'REST & GraphQL API Pentest',
        description: 'Fuzzing endpoints for Broken Object-Level Authorization (BOLA), mass assignment, and excessive data exposure vulnerabilities.',
        badge: 'HIGH DEMAND',
      },
      {
        icon: AlertTriangle,
        title: 'Business Logic Testing',
        description: 'Simulating complex race conditions, coupon code manipulation, price tampering, and multi-step transaction workflow bypasses.',
      },
      {
        icon: Lock,
        title: 'Authentication & Session Review',
        description: 'Analyzing JWT token structures, None-algorithm fallbacks, OAuth2 implementations, and session fixation weaknesses.',
      },
      {
        icon: Database,
        title: 'Database Injection Exploits',
        description: 'Manual verification of blind, boolean, and time-based SQL/NoSQL injection payloads across PostgreSQL, MySQL, and MongoDB.',
      },
      {
        icon: FileCode,
        title: 'Developer Advisory & Remediation',
        description: 'Clear, reproducible curl commands, CVSS 3.1 severity scores, and exact code mitigation instructions for engineering teams.',
      },
    ],
    arsenal: [
      { category: 'Web Interception & Proxies', tools: ['Burp Suite Professional', 'OWASP ZAP', 'Caido', 'Mitmproxy'], highlight: true },
      { category: 'Fuzzing & Directory Discovery', tools: ['Ffuf', 'Dirsearch', 'Feroxbuster', 'Gobuster'], highlight: true },
      { category: 'API Security & Analysis', tools: ['Postman', 'Arjun', 'Kiterunner', 'Swagger UI Parser'] },
      { category: 'Injection & Exploits', tools: ['SQLMap', 'Commix', 'XSS Hunter', 'Tplmap (SSTI)'] },
    ],
    featuredProjects: [
      {
        id: 'web-vuln-nikto',
        title: 'Web Vulnerability Identifier (Nikto Scanner)',
        category: 'Web Application VAPT',
        description: 'Live Nikto vulnerability scanning with progress bar, log stream, and actionable mitigations.',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
        tags: ['Nikto Scanner', 'Web Vulnerability', 'Information Leak', 'OWASP Top 10', 'Terminal Log'],
        findings: ['Uncovers sensitive git/env files and outdated server software', 'Audits anti-clickjacking headers'],
        severity: 'Critical',
      },
      {
        id: 'website-safety',
        title: 'Website Safety Checker',
        category: 'Web Application Hygiene',
        description: 'Performs live SSL/TLS certificate validity checks, HTTPS redirection audit, and security header evaluation.',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
        tags: ['Website Safety', 'SSL Certificate', 'HTTPS Enforcement', 'Security Headers', 'Phishing Check'],
        findings: ['Verifies certificate validity and expiration dates', 'Checks automatic 301 redirection to HTTPS'],
        severity: 'High',
      },
      {
        id: 'password-checker',
        title: 'Password Strength & Pattern Analyzer',
        category: 'Authentication Security',
        description: 'Evaluates password entropy, common dictionary sequences, and keyboard walk patterns.',
        image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800',
        tags: ['Password Strength', 'Entropy', 'Pattern Detection', 'NIST Standards', 'MFA'],
        findings: ['Calculates cryptographic entropy bits', 'Flags predictable substitution patterns'],
        severity: 'High',
      },
    ],
  },

  network: {
    themeClass: 'theme-network',
    badge: {
      text: 'NETWORK RECON & HOST EXPLOITATION SPECIALIST',
      pillClass: 'border-[#ff003c]/60 text-[#ff2a55] bg-[#ff003c]/15 shadow-[0_0_24px_rgba(255,0,60,0.45)]',
      dotColor: 'bg-[#ff003c]',
    },
    headline: {
      prefix: 'Penetrating Hosts &',
      highlight: 'Escalating Privileges',
      accentColor: 'neon-text-red',
      suffix: 'to root level.',
    },
    description:
      'Focused on network perimeter reconnaissance, Active Directory auditing, privilege escalation vectors, and exploiting misconfigurations across Linux and Windows server fleets.',
    heroStats: {
      stat1: { value: '75+', label: 'CTF Machines Pwned', color: 'neon-text-red', border: 'border-[#ff003c]/50 shadow-[0_0_18px_rgba(255,0,60,0.3)]' },
      stat2: { value: 'Root PrivEsc', label: 'Linux & Windows Systems', color: 'text-[#ff6b8b]', border: 'border-[#ff003c]/50 shadow-[0_0_18px_rgba(255,0,60,0.3)]' },
    },
    btnPrimaryClass: 'bg-gradient-to-r from-[#ff003c] to-[#d60032] hover:from-[#ff1a4f] hover:to-[#ff003c] text-white font-bold shadow-[0_0_30px_rgba(255,0,60,0.65)] hover:shadow-[0_0_40px_rgba(255,0,60,0.9)]',
    services: [
      {
        icon: Network,
        title: 'Network Port & Service Mapping',
        description: 'Deep network reconnaissance with Nmap scripts, banner grabbing, OS fingerprinting, and vulnerable service detection.',
        badge: 'RECON FOCUS',
      },
      {
        icon: Terminal,
        title: 'Linux Privilege Escalation',
        description: 'Finding SUID abuse vectors, sudo misconfigurations, vulnerable cron jobs, capability abuses, and path hijacking to achieve root.',
        badge: 'PRIV-ESC',
      },
      {
        icon: Server,
        title: 'Active Directory Exploitation',
        description: 'Kerberoasting, AS-REP Roasting, BloodHound graph path analysis, and privilege escalation on domain controllers.',
      },
      {
        icon: Radio,
        title: 'Traffic & Packet Inspection',
        description: 'Sniffing and analyzing raw packets using Wireshark and TCPDump to isolate plaintext secrets and protocol anomalies.',
      },
      {
        icon: Fingerprint,
        title: 'Credential & Hash Cracking',
        description: 'Auditing password strengths and cracking NTLM, SHA-512, and bcrypt dumps with John the Ripper and Hashcat.',
      },
      {
        icon: Shield,
        title: 'IDS / Firewall Evasion Testing',
        description: 'Simulating stealthy fragmented scans and testing rule thresholds across Suricata and IPTables.',
      },
    ],
    arsenal: [
      { category: 'Network Recon & Discovery', tools: ['Nmap', 'Masscan', 'Wireshark', 'TCPDump', 'Netcat'], highlight: true },
      { category: 'Exploitation Frameworks', tools: ['Metasploit Framework', 'Searchsploit', 'CrackMapExec', 'Responder'], highlight: true },
      { category: 'Privilege Escalation', tools: ['LinPEAS', 'WinPEAS', 'GTFOBins', 'BloodHound', 'Mimikatz'] },
      { category: 'Credential Auditing', tools: ['John the Ripper', 'Hashcat', 'Hydra', 'Medusa'] },
    ],
    featuredProjects: [
      {
        id: 'domain-dossier',
        title: 'Domain Dossier (CentralOps Style)',
        category: 'Network Reconnaissance',
        description: 'Comprehensive domain and IP intelligence with whois, DNS zone records, and traceroute.',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        tags: ['Domain Dossier', 'CentralOps', 'Whois', 'DNS Records', 'Traceroute', 'Port Scan'],
        findings: ['Deep WHOIS and DNS zone resolution', 'Network traceroute hops analysis'],
        severity: 'High',
      },
      {
        id: 'ip-domain-validator',
        title: 'IP / Domain Validator',
        category: 'Input Verification & Networking',
        description: 'Detect and validate IPv4, IPv6, Domain FQDN, or URL inputs with RFC compliance specifications.',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800',
        tags: ['IP Validator', 'IPv4 / IPv6', 'Domain FQDN', 'URL Parser', 'RFC Standards'],
        findings: ['RFC 1918 private vs public scope detection', 'IPv6 hextet format validation'],
        severity: 'Medium',
      },
      {
        id: 'my-ip',
        title: 'IP Address Checker ("What Is My IP?")',
        category: 'Identity & Geo Reconnaissance',
        description: 'Live public IP lookup with ISP provider, Autonomous System (ASN), reverse DNS, and geolocation.',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        tags: ['My IP', 'Public IP', 'ISP Info', 'ASN Lookup', 'Reverse DNS', 'GeoIP'],
        findings: ['Resolves public IP address and ISP', 'Calculates location and ASN details'],
        severity: 'Medium',
      },
    ],
  },
};
