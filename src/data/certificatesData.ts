export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
  image: string;
  category: string;
  skills: string[];
}

export const certificatesList: CertificateItem[] = [
  {
    id: "ceh-v13",
    title: "Certified Ethical Hacker (CEH) v13 AI",
    issuer: "Ec-Council",
    year: "2026",
    image: "/certificates/1-ceh-v13.png",
    category: "Offensive Security",
    skills: ["Ethical Hacking", "AI Threats & Defense", "Vulnerability Analysis", "System Penetration"]
  },
  {
    id: "thm-jpt",
    title: "Jr. Penetration Tester",
    issuer: "TryHackMe",
    year: "2026",
    image: "/certificates/2-thm-jpt.png",
    category: "Penetration Testing",
    skills: ["Network Security", "Privilege Escalation", "Web Exploitation", "Metasploit"]
  },
  {
    id: "udemy-redteam",
    title: "Red Team and Penetration Testing",
    issuer: "Udemy",
    year: "2025",
    image: "/certificates/3-udemy-redteam.jpg",
    category: "Red Teaming",
    skills: ["Active Directory Attacks", "Network Pivoting", "AV Evasion", "Command & Control"]
  },
  {
    id: "internshala-ethical-hacking",
    title: "Ethical Hacking with AI",
    issuer: "Internshala",
    year: "2025",
    image: "/certificates/4-internshala-ethical-hacking.png",
    category: "Ethical Hacking",
    skills: ["AI Security Tooling", "Web Application Testing", "Information Gathering", "Cryptography"]
  },
  {
    id: "codered-osint",
    title: "Open Source Intelligence",
    issuer: "CodeRed",
    year: "2026",
    image: "/certificates/5-codered-osint.png",
    category: "Threat Intelligence",
    skills: ["OSINT Reconnaissance", "Footprinting", "Social Engineering Analysis", "Metadata Extraction"]
  },
  {
    id: "codered-network-assessments",
    title: "Deep Dive Into Network Assessments",
    issuer: "CodeRed",
    year: "2026",
    image: "/certificates/6-codered-network-assessments.png",
    category: "Network Defense",
    skills: ["Network Vulnerability Assessment", "Nmap Deep Scanning", "Port Auditing", "Firewall Analysis"]
  },
  {
    id: "codered-sql-injection",
    title: "SQL Injection Attacks",
    issuer: "CodeRed",
    year: "2026",
    image: "/certificates/7-codered-sql-injection.png",
    category: "Web Application Security",
    skills: ["SQLi Exploitation", "Blind SQL Injection", "Database Extraction", "Remediation & Defense"]
  },
  {
    id: "codered-windows-pentesting",
    title: "Windows Penetration Testing Essentials",
    issuer: "CodeRed",
    year: "2026",
    image: "/certificates/8-codered-windows-pentesting.png",
    category: "Host Exploitation",
    skills: ["Windows Privilege Escalation", "PowerShell Exploitation", "SAM / LSASS Auditing", "Token Impersonation"]
  },
  {
    id: "smarted-cybersecurity",
    title: "Cyber Security",
    issuer: "SmartED",
    year: "2025",
    image: "/certificates/9-smarted-cybersecurity.png",
    category: "Core Security",
    skills: ["Cybersecurity Fundamentals", "Network Defense", "Threat Vectors", "Security Hygiene"]
  },
  {
    id: "cisco-intro-cybersecurity",
    title: "Introduction to Cybersecurity",
    issuer: "CISCO",
    year: "2025",
    image: "/certificates/10-cisco-intro-cybersecurity.png",
    category: "Foundations",
    skills: ["Cyber Threat Landscape", "Data Confidentiality", "Enterprise Defense", "CISCO Security"]
  }
];
