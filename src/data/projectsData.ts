export interface InteractiveProject {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  mode: 'web' | 'network' | 'host' | 'default';
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  severity: 'Critical' | 'High' | 'Medium';
  findings: string[];
  cvssScore: string;
  targetEnvironment: string;
  vulnerabilityOverview: string;
  remediation: string;
}

// Exactly the 3 Live Security Tools requested
export const allProjects: InteractiveProject[] = [
  {
    id: 'domain-dossier',
    title: 'Domain Dossier (CentralOps Style)',
    subtitle: 'Domain WHOIS, DNS Zone Records, Traceroute, Network WHOIS & Port Scan',
    category: 'Network Reconnaissance',
    mode: 'default',
    description: 'CentralOps-style comprehensive domain and IP dossier with real-time WHOIS port 43 resolution, authoritative DNS zone records, network traceroute hops, and live service port scan.',
    longDescription: 'A complete domain intelligence dossier. Conducts domain registration whois queries on port 43, authoritative DNS zone lookups, traceroute network hop calculations, IP network whois resolution, and TCP port checks across common services (21, 25, 80, 110, 143, 443).',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
    tags: ['Domain Dossier', 'CentralOps', 'Whois', 'DNS Records', 'Traceroute', 'Port Scan'],
    severity: 'High',
    cvssScore: '8.2 (Reconnaissance)',
    targetEnvironment: 'Any Public Domain Name or IPv4/IPv6 Address',
    findings: [
      'Queries live registrar, creation, expiry, and authoritative nameservers via port 43',
      'Queries full DNS zone: A, AAAA, MX, NS, TXT, and SOA records',
      'Maps network traceroute hops with RTT latency and edge gateway nodes',
      'Audits common open ports: FTP, SMTP, HTTP, POP3, IMAP, HTTPS with live banner inspection',
    ],
    vulnerabilityOverview: 'Excessive network intelligence leakage allows adversaries to map infrastructure, pinpoint outdated mail exchange servers, and target open database ports.',
    remediation: 'Enable WHOIS privacy protection, prune unused DNS records, close non-essential ingress ports, and filter ping/traceroute responses.',
  },
  {
    id: 'password-checker',
    title: 'Password Strength & Pattern Analyzer',
    subtitle: 'Cryptographic Entropy, Pattern Vulnerabilities & Authentication Security',
    category: 'Authentication Security',
    mode: 'host',
    description: 'Evaluates password strength based on length, character variety, and common patterns (repetitions, sequences, dictionary terms, keyboard walks). Teaches NIST authentication security.',
    longDescription: 'Calculates cryptographic entropy H = L * log2(R), detects predictable patterns such as repeated characters, keyboard walks (qwerty), dictionary words, and common substitutions, while providing actionable guidance on passphrases and MFA.',
    image: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800',
    tags: ['Password Strength', 'Entropy', 'Pattern Detection', 'NIST Standards', 'MFA'],
    severity: 'High',
    cvssScore: '7.8 (Authentication)',
    targetEnvironment: 'Identity Providers / Active Directory / Web Login Forms',
    findings: [
      'Detects common dictionary phrases and keyboard walk sequences',
      'Calculates real-time Shannon entropy and GPU brute-force crack resistance',
      'Flags predictable leetspeak substitutions (e.g. P@ssw0rd)',
    ],
    vulnerabilityOverview: 'Predictable password patterns and low entropy enable attackers to bypass authentication using automated wordlists, credential stuffing, and rainbow tables.',
    remediation: 'Enforce minimum 12-16 character passphrases, reject known breached passwords, and require multi-factor authentication (MFA).',
  },
  {
    id: 'my-ip',
    title: 'IP Address Checker ("What Is My IP?")',
    subtitle: 'Public IP Lookup, Geolocation, ISP, ASN & Network Connection Audit',
    category: 'Identity & Geo Reconnaissance',
    mode: 'network',
    description: 'Discovers caller public IP address with ISP provider, Autonomous System Number (ASN), reverse DNS PTR hostname, coordinates, and network connection audit.',
    longDescription: 'Instant reconnaissance of the user public internet footprint. Retrieves IPv4/IPv6 address, ISP provider, Autonomous System (ASN), reverse DNS hostname, and geographic location coordinates.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
    tags: ['My IP', 'Public IP', 'ISP Info', 'ASN Lookup', 'Reverse DNS', 'GeoIP'],
    severity: 'Medium',
    cvssScore: '5.0 (Reconnaissance)',
    targetEnvironment: 'Client Browser Environment / Internet Ingress',
    findings: [
      'Detects public IPv4 / IPv6 internet address',
      'Maps geographic country, region, city, and coordinates',
      'Resolves Internet Service Provider (ISP) and Autonomous System (ASN)',
      'Identifies reverse DNS (PTR) hostname and connection classification',
    ],
    vulnerabilityOverview: 'Public IP disclosure reveals geographic location, network provider, and potential corporate network origin to web servers visited.',
    remediation: 'Utilize privacy-preserving VPNs, Tor, or encrypted proxies to mask source IP addresses when conducting threat intelligence.',
  },
];
