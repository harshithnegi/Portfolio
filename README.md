<div align="center">

# 🛡️ Harshit Negi — Cybersecurity Portfolio

### Penetration Testing • Ethical Hacking • Offensive Security

[![Live Website](https://img.shields.io/badge/🌐_Live_Website-harshitnegi.in-000000?style=for-the-badge)](https://harshitnegi.in/)
[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge\&logo=github)](https://github.com/harshithnegi)

</div>

---

## 👨‍💻 About

Welcome to my personal **Cybersecurity & Penetration Testing Portfolio**.

I am **Harshit Negi**, a Computer Science graduate focused on offensive security, penetration testing, web application security, network security, and ethical hacking.

This repository contains the source code for my personal cybersecurity portfolio website, including my projects, certifications, technical skills, security research, and custom-built security assessment tools.

🌐 **Live Portfolio:** https://harshitnegi.in/

---

## 🎯 Focus Areas

* 🔴 Penetration Testing
* 🌐 Web Application Security
* 🕵️ Reconnaissance & OSINT
* 🖥️ Network Security
* 🪟 Windows Security & Privilege Escalation
* 🐧 Linux Security
* 🧑‍💻 Ethical Hacking
* 🔐 Vulnerability Assessment
* 🛡️ Red Teaming
* 🔎 Security Tool Development

---

## 🚀 Features

The portfolio is more than a static personal website.

### 🧑‍💻 Cybersecurity Portfolio

* Professional cybersecurity profile
* Technical skills and security domains
* Certifications and training
* Cybersecurity projects
* Penetration-testing related experience
* Interactive project details
* Resume access

### 🔎 Security Assessment Tools

The website includes custom-built security assessment functionality designed to demonstrate practical understanding of reconnaissance and vulnerability assessment.

Current functionality includes:

* Domain reconnaissance
* DNS enumeration
* Domain/RDAP information gathering
* Network/IP information
* Service and port scanning
* TLS/SSL inspection
* HTTP security-header analysis
* Server banner detection
* Security configuration checks
* Web vulnerability identification
* Sensitive-file and directory probing
* Risk/severity classification
* Remediation recommendations
* Terminal-style scan output

> **Important:** These tools are intended for authorized security testing and educational purposes only. Always obtain explicit permission before scanning systems or domains you do not own.

---

## 🛠️ Tech Stack

### Frontend

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **React Router**
* **Motion**
* **Lucide React**

### Backend

* **Node.js**
* **Express**
* **TypeScript**
* **tsx**
* **esbuild**

### Security & Application Features

* DNS resolution
* RDAP lookups
* TCP service probing
* TLS inspection
* HTTP header analysis
* Security-header auditing
* Web vulnerability checks
* Client-side PDF generation
* Interactive security tooling

### APIs / Services

* Google Gemini API
* RDAP
* DNS services
* IP/network information services

---

## 📂 Project Structure

```text
harshit-negi---cybersecurity-portfolio/
│
├── public/
│   ├── certificates/
│   ├── Profile.jpg
│   └── resume/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── CertificateCard.tsx
│   │   ├── CertificateModal.tsx
│   │   ├── HackerLoader.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProjectCard.tsx
│   │   └── ...
│   │
│   ├── context/
│   │   └── ModeContext.tsx
│   │
│   ├── data/
│   │   └── certificatesData.ts
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Portfolio.tsx
│   │   ├── SecurityTools.tsx
│   │   ├── DedicatedToolPage.tsx
│   │   └── ProjectDetail.tsx
│   │
│   ├── index.css
│   └── main.tsx
│
├── server/
│   ├── dossierAndTools.ts
│   ├── securityScanner.ts
│   └── ...
│
├── server.ts
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔐 Security Tools

### 1. Domain Dossier

The Domain Dossier module performs multiple reconnaissance operations against a target.

It can gather:

* Domain information
* IP address
* RDAP/WHOIS information
* DNS records

  * A
  * AAAA
  * MX
  * NS
  * TXT
  * CNAME
  * SOA
* Network/ISP information
* ASN information
* Geographic network information
* Service/port information
* TLS information

---

### 2. Web Security Scanner

The web security scanner performs a series of HTTP-based security checks.

Examples include:

* Server banner disclosure
* `X-Frame-Options`
* Content Security Policy
* HSTS
* Security headers
* Sensitive file exposure
* `.git` exposure
* `.env` exposure
* `robots.txt`
* `.DS_Store`
* WordPress login detection
* phpMyAdmin detection
* Apache server-status detection

Findings are categorized according to severity such as:

```text
CRITICAL
HIGH
MEDIUM
LOW
INFO
```

The scanner also provides remediation recommendations for identified issues.

---

## 📜 Certifications

The portfolio currently showcases certifications and training covering areas including:

* **Certified Ethical Hacker (CEH) v13 AI**
* **Jr. Penetration Tester — TryHackMe**
* **Red Team & Penetration Testing**
* **Ethical Hacking with AI**
* **Open Source Intelligence**
* **Network Assessments**
* **SQL Injection Attacks**
* **Windows Penetration Testing**
* **Cyber Security**
* **Introduction to Cybersecurity**

---

## 💻 Local Development

### Prerequisites

Make sure you have:

* Node.js
* npm

installed on your system.

### 1. Clone the repository

```bash
git clone https://github.com/harshithnegi/Portfolio.git
cd Portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create your environment file based on `.env.example`.

```bash
cp .env.example .env
```

Add the required API configuration if you intend to use features that depend on external APIs.

### 4. Start the development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

### 6. Start the production server

```bash
npm start
```

---

## 📦 Available Scripts

| Command           | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the development environment         |
| `npm run build`   | Build frontend and backend for production |
| `npm start`       | Start the production server               |
| `npm run preview` | Preview the Vite production build         |
| `npm run lint`    | Run TypeScript checks                     |
| `npm run clean`   | Remove the build directory                |

---

## 🌐 Deployment

The portfolio is deployed as a live web application and is accessible through:

### 🔗 https://harshitnegi.in/

The application is hosted using a cloud deployment platform with the custom domain configured through the domain registrar.

---

## 🧪 Purpose

This project serves as:

* My personal cybersecurity portfolio
* A demonstration of practical security knowledge
* A collection of cybersecurity projects
* A demonstration of security-tool development
* A central place for certifications and technical work
* A professional profile for cybersecurity opportunities

---

## ⚠️ Legal & Ethical Disclaimer

The security tools included in this project are intended **only for authorized security testing, educational purposes, and systems you own or have explicit permission to assess**.

Do not use these tools against third-party infrastructure without authorization.

The author is not responsible for misuse, unauthorized scanning, disruption, or damage caused through the use of this project.

Always follow applicable laws, regulations, and responsible disclosure practices.

---

## 📬 Contact

If you'd like to discuss cybersecurity, penetration testing, security research, or potential opportunities, feel free to connect with me.

🌐 **Portfolio:**
https://harshitnegi.in/

💻 **GitHub:**
https://github.com/harshithnegi

---

<div align="center">

### 🛡️ Security is not just a skill — it's a mindset.

**© Harshit Negi**

</div>
