import dns from 'dns';
import net from 'net';
import tls from 'tls';
import http from 'http';
import https from 'https';

const dnsPromises = dns.promises;

export interface VaptScanResult {
  target: string;
  normalizedHost: string;
  ip: string;
  scanTimestamp: string;
  riskScore: number; // 0 - 100 (higher is safer)
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
  dnsRecords: {
    a: string[];
    aaaa: string[];
    mx: { exchange: string; priority: number }[];
    txt: string[];
    ns: string[];
    cname: string[];
    soa?: any;
    spfPresent: boolean;
    dmarcPresent: boolean;
    dmarcRecord?: string;
  };
  whois: {
    registrar?: string;
    creationDate?: string;
    expirationDate?: string;
    status?: string[];
    nameServers?: string[];
    raw?: string;
  };
  networkGeo: {
    ip: string;
    org?: string;
    isp?: string;
    country?: string;
    city?: string;
    asn?: string;
  };
  ports: {
    port: number;
    service: string;
    state: 'OPEN' | 'CLOSED' | 'FILTERED';
    banner?: string;
    risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  }[];
  ssl: {
    enabled: boolean;
    issuer?: string;
    validFrom?: string;
    validTo?: string;
    daysRemaining?: number;
    subjectAltNames?: string[];
    authorized?: boolean;
    error?: string;
  };
  securityHeaders: {
    header: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    value?: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    recommendation: string;
  }[];
  vulnerabilities: {
    id: string;
    title: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    description: string;
    impact: string;
    remediation: string;
  }[];
}

// Clean and normalize target domain or IP
export function cleanTarget(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  cleaned = cleaned.replace(/:[0-9]+$/, '');
  return cleaned;
}

// Check single TCP port with timeout
export function checkPort(host: string, port: number, timeoutMs = 1800): Promise<{ open: boolean; banner?: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let banner = '';
    let isResolved = false;

    const finalize = (open: boolean) => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve({ open, banner: banner.trim() || undefined });
      }
    };

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      // Send simple probe to elicit banner
      try {
        socket.write('HEAD / HTTP/1.0\r\n\r\n');
      } catch {
        // ignore
      }
      setTimeout(() => finalize(true), 250);
    });

    socket.on('data', (data) => {
      banner += data.toString('utf-8', 0, 100);
      finalize(true);
    });

    socket.on('timeout', () => finalize(false));
    socket.on('error', () => finalize(false));
    socket.on('close', () => finalize(false));

    socket.connect(port, host);
  });
}

// Inspect SSL/TLS Certificate on 443
export function checkSsl(host: string, port = 443, timeoutMs = 3000): Promise<VaptScanResult['ssl']> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host,
        port,
        servername: host,
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate(true);
          const authorized = socket.authorized;
          socket.end();

          if (!cert || Object.keys(cert).length === 0) {
            return resolve({ enabled: false, error: 'No certificate presented' });
          }

          const validToDate = new Date(cert.valid_to);
          const daysRemaining = Math.round((validToDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          resolve({
            enabled: true,
            issuer: typeof cert.issuer === 'object' 
              ? (Array.isArray(cert.issuer.O) ? cert.issuer.O[0] : cert.issuer.O) || 
                (Array.isArray(cert.issuer.CN) ? cert.issuer.CN[0] : cert.issuer.CN) || 
                'Unknown' 
              : String(cert.issuer),
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysRemaining,
            subjectAltNames: cert.subjectaltname ? cert.subjectaltname.split(', ') : [],
            authorized,
          });
        } catch (err: any) {
          socket.destroy();
          resolve({ enabled: false, error: err.message || 'TLS inspection failed' });
        }
      }
    );

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ enabled: false, error: 'Connection timed out' });
    });

    socket.on('error', (err) => {
      resolve({ enabled: false, error: err.message });
    });
  });
}

// Perform full VAPT Mini-Scan
export async function performVaptScan(rawTarget: string): Promise<VaptScanResult> {
  const host = cleanTarget(rawTarget);
  if (!host) {
    throw new Error('Invalid target host or IP specified');
  }

  // 1. Resolve Primary IP
  let primaryIp = host;
  try {
    const lookup = await dnsPromises.lookup(host);
    primaryIp = lookup.address;
  } catch (err: any) {
    // If not a hostname, might be IP already
    if (!net.isIP(host)) {
      throw new Error(`DNS resolution failed for ${host}: ${err.message || 'Host not found'}`);
    }
  }

  // 2. DNS Records
  const dnsRecords: VaptScanResult['dnsRecords'] = {
    a: [],
    aaaa: [],
    mx: [],
    txt: [],
    ns: [],
    cname: [],
    spfPresent: false,
    dmarcPresent: false,
  };

  if (!net.isIP(host)) {
    try {
      dnsRecords.a = await dnsPromises.resolve4(host);
    } catch { /* ignore */ }
    try {
      dnsRecords.aaaa = await dnsPromises.resolve6(host);
    } catch { /* ignore */ }
    try {
      dnsRecords.mx = await dnsPromises.resolveMx(host);
    } catch { /* ignore */ }
    try {
      const txt = await dnsPromises.resolveTxt(host);
      dnsRecords.txt = txt.map((chunks) => chunks.join(''));
      dnsRecords.spfPresent = dnsRecords.txt.some((t) => t.includes('v=spf1'));
    } catch { /* ignore */ }
    try {
      dnsRecords.ns = await dnsPromises.resolveNs(host);
    } catch { /* ignore */ }
    try {
      dnsRecords.cname = await dnsPromises.resolveCname(host);
    } catch { /* ignore */ }
    try {
      dnsRecords.soa = await dnsPromises.resolveSoa(host);
    } catch { /* ignore */ }

    // Check DMARC
    try {
      const dmarcTxt = await dnsPromises.resolveTxt(`_dmarc.${host}`);
      const dmarcJoined = dmarcTxt.map((chunks) => chunks.join('')).join('; ');
      if (dmarcJoined.includes('v=DMARC1')) {
        dnsRecords.dmarcPresent = true;
        dnsRecords.dmarcRecord = dmarcJoined;
      }
    } catch { /* ignore */ }
  } else {
    dnsRecords.a = [host];
  }

  // 3. Network / Geo / ASN Information (via ip-api or RDAP)
  const networkGeo: VaptScanResult['networkGeo'] = {
    ip: primaryIp,
  };

  try {
    const geoRes = await fetch(`http://ip-api.com/json/${primaryIp}?fields=status,country,city,isp,org,as,query`, {
      signal: AbortSignal.timeout(3000),
    });
    if (geoRes.ok) {
      const geoData: any = await geoRes.json();
      if (geoData.status === 'success') {
        networkGeo.country = geoData.country;
        networkGeo.city = geoData.city;
        networkGeo.isp = geoData.isp;
        networkGeo.org = geoData.org;
        networkGeo.asn = geoData.as;
      }
    }
  } catch {
    // Non-blocking fallback
  }

  // 4. Domain RDAP / Whois
  const whois: VaptScanResult['whois'] = {};
  if (!net.isIP(host)) {
    try {
      const rdapRes = await fetch(`https://rdap.org/domain/${host}`, {
        headers: { Accept: 'application/rdap+json' },
        signal: AbortSignal.timeout(3500),
      });
      if (rdapRes.ok) {
        const rdapData: any = await rdapRes.json();
        // Extract registrar from entities
        if (Array.isArray(rdapData.entities)) {
          const registrar = rdapData.entities.find((e: any) => e.roles && e.roles.includes('registrar'));
          if (registrar && registrar.vcardArray && registrar.vcardArray[1]) {
            const fnItem = registrar.vcardArray[1].find((i: any) => i[0] === 'fn');
            if (fnItem) whois.registrar = fnItem[3];
          }
        }
        // Extract events (creation, expiration)
        if (Array.isArray(rdapData.events)) {
          const created = rdapData.events.find((ev: any) => ev.eventAction === 'registration');
          if (created) whois.creationDate = created.eventDate;
          const expires = rdapData.events.find((ev: any) => ev.eventAction === 'expiration');
          if (expires) whois.expirationDate = expires.eventDate;
        }
        if (Array.isArray(rdapData.status)) {
          whois.status = rdapData.status;
        }
        if (Array.isArray(rdapData.nameservers)) {
          whois.nameServers = rdapData.nameservers.map((ns: any) => ns.ldhName || ns.handle);
        }
      }
    } catch {
      // Non-blocking
    }
  }

  // 5. Common Port Scan
  const targetPorts = [
    { port: 21, service: 'FTP', defaultRisk: 'HIGH' as const },
    { port: 22, service: 'SSH', defaultRisk: 'LOW' as const },
    { port: 25, service: 'SMTP', defaultRisk: 'MEDIUM' as const },
    { port: 53, service: 'DNS', defaultRisk: 'LOW' as const },
    { port: 80, service: 'HTTP', defaultRisk: 'INFO' as const },
    { port: 443, service: 'HTTPS', defaultRisk: 'INFO' as const },
    { port: 3306, service: 'MySQL', defaultRisk: 'CRITICAL' as const },
    { port: 5432, service: 'PostgreSQL', defaultRisk: 'CRITICAL' as const },
    { port: 8080, service: 'HTTP-Alt/Proxy', defaultRisk: 'LOW' as const },
    { port: 8443, service: 'HTTPS-Alt', defaultRisk: 'INFO' as const },
  ];

  const scannedPorts = await Promise.all(
    targetPorts.map(async (tp) => {
      const probe = await checkPort(primaryIp, tp.port, 1500);
      return {
        port: tp.port,
        service: tp.service,
        state: probe.open ? ('OPEN' as const) : ('CLOSED' as const),
        banner: probe.banner,
        risk: probe.open ? tp.defaultRisk : ('INFO' as const),
      };
    })
  );

  // 6. SSL / TLS Inspection
  const ssl = await checkSsl(host);

  // 7. HTTP Security Headers
  let httpHeaders: Record<string, string> = {};
  let serverDisclosed = '';
  let poweredByDisclosed = '';
  let cookiesRaw: string[] = [];

  const checkUrl = ssl.enabled ? `https://${host}` : `http://${host}`;
  try {
    const res = await fetch(checkUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MiniVaptSecurityScanner/1.0',
      },
      signal: AbortSignal.timeout(4000),
      redirect: 'follow',
    });

    res.headers.forEach((val, key) => {
      httpHeaders[key.toLowerCase()] = val;
    });

    serverDisclosed = httpHeaders['server'] || '';
    poweredByDisclosed = httpHeaders['x-powered-by'] || '';
    const cookieHeader = res.headers.get('set-cookie');
    if (cookieHeader) {
      cookiesRaw = [cookieHeader];
    }
  } catch (err) {
    // If https failed, fallback to http
    try {
      const fallbackRes = await fetch(`http://${host}`, {
        signal: AbortSignal.timeout(3000),
      });
      fallbackRes.headers.forEach((val, key) => {
        httpHeaders[key.toLowerCase()] = val;
      });
    } catch {
      // ignore
    }
  }

  // Security Header Rules
  const securityHeaders: VaptScanResult['securityHeaders'] = [
    {
      header: 'Content-Security-Policy',
      status: httpHeaders['content-security-policy'] ? 'PASS' : 'FAIL',
      value: httpHeaders['content-security-policy'],
      severity: 'HIGH',
      description: 'Restricts resources (scripts, images, styles) browsers are allowed to load to mitigate Cross-Site Scripting (XSS) and data injection.',
      recommendation: "Implement a robust CSP header: Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';",
    },
    {
      header: 'Strict-Transport-Security (HSTS)',
      status: httpHeaders['strict-transport-security'] ? 'PASS' : 'FAIL',
      value: httpHeaders['strict-transport-security'],
      severity: 'HIGH',
      description: 'Enforces secure HTTPS connections and prevents SSL-stripping man-in-the-middle attacks.',
      recommendation: 'Add header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    },
    {
      header: 'X-Frame-Options',
      status: httpHeaders['x-frame-options'] || (httpHeaders['content-security-policy'] && httpHeaders['content-security-policy'].includes('frame-ancestors')) ? 'PASS' : 'FAIL',
      value: httpHeaders['x-frame-options'],
      severity: 'MEDIUM',
      description: 'Protects visitors against Clickjacking attacks by forbidding rendering in iframes on unauthorized third-party sites.',
      recommendation: 'Add header: X-Frame-Options: DENY or SAMEORIGIN',
    },
    {
      header: 'X-Content-Type-Options',
      status: httpHeaders['x-content-type-options'] === 'nosniff' ? 'PASS' : 'FAIL',
      value: httpHeaders['x-content-type-options'],
      severity: 'MEDIUM',
      description: 'Prevents MIME type sniffing, forcing browsers to respect the declared Content-Type (mitigates drive-by downloads).',
      recommendation: 'Add header: X-Content-Type-Options: nosniff',
    },
    {
      header: 'Referrer-Policy',
      status: httpHeaders['referrer-policy'] ? 'PASS' : 'WARN',
      value: httpHeaders['referrer-policy'],
      severity: 'LOW',
      description: 'Controls how much referrer information (paths, query parameters) is leaked in outbound HTTP request headers.',
      recommendation: 'Add header: Referrer-Policy: strict-origin-when-cross-origin',
    },
    {
      header: 'Permissions-Policy',
      status: httpHeaders['permissions-policy'] ? 'PASS' : 'WARN',
      value: httpHeaders['permissions-policy'],
      severity: 'LOW',
      description: 'Restricts sensitive browser hardware features like camera, microphone, geolocation, and payment APIs.',
      recommendation: "Add header: Permissions-Policy: camera=(), microphone=(), geolocation=()",
    },
    {
      header: 'Server Software Disclosure',
      status: serverDisclosed || poweredByDisclosed ? 'WARN' : 'PASS',
      value: [serverDisclosed ? `Server: ${serverDisclosed}` : '', poweredByDisclosed ? `X-Powered-By: ${poweredByDisclosed}` : ''].filter(Boolean).join(' | '),
      severity: 'LOW',
      description: 'Revealing exact web server, runtime, or framework software versions helps attackers pinpoint CVE vulnerabilities.',
      recommendation: 'Disable banner banners in web server configuration (e.g. server_tokens off; in Nginx).',
    },
  ];

  // 8. Vulnerability & Risk Calculation
  const vulnerabilities: VaptScanResult['vulnerabilities'] = [];
  let deduction = 0;

  // Database ports exposed
  const openDb = scannedPorts.filter((p) => p.state === 'OPEN' && (p.port === 3306 || p.port === 5432));
  if (openDb.length > 0) {
    deduction += 35;
    vulnerabilities.push({
      id: 'VULN-PORT-DB',
      title: `Critical Database Port Exposed (${openDb.map((p) => `${p.service}/${p.port}`).join(', ')})`,
      severity: 'CRITICAL',
      description: `Database ports (${openDb.map((p) => p.port).join(', ')}) were detected in an OPEN state accessible directly over the public Internet.`,
      impact: 'Allows remote unauthenticated attackers to execute brute-force password attacks, exploit zero-day DB vulnerabilities, and compromise entire databases.',
      remediation: 'Immediately bind the database listening interface to 127.0.0.1 or an internal VPC subnet. Enforce strict firewall rules (UFW / AWS Security Groups) denying public ingress.',
    });
  }

  // Missing CSP
  if (!httpHeaders['content-security-policy']) {
    deduction += 18;
    vulnerabilities.push({
      id: 'VULN-SEC-CSP',
      title: 'Missing Content-Security-Policy (CSP) Header',
      severity: 'HIGH',
      description: 'The target web application does not transmit a Content-Security-Policy HTTP response header.',
      impact: 'Leaves the application vulnerable to client-side code execution via Reflected, Stored, or DOM-based Cross-Site Scripting (XSS).',
      remediation: "Deploy Content-Security-Policy headers restricting script execution to authorized domains and enforcing nonces for inline scripts.",
    });
  }

  // Missing HSTS
  if (!httpHeaders['strict-transport-security'] && ssl.enabled) {
    deduction += 15;
    vulnerabilities.push({
      id: 'VULN-SEC-HSTS',
      title: 'Missing HTTP Strict Transport Security (HSTS)',
      severity: 'HIGH',
      description: 'The web application does not enforce HSTS on HTTPS connections.',
      impact: 'Adversaries on local networks can execute SSL-stripping attacks to downgrade victim connections to insecure HTTP.',
      remediation: 'Configure the web server to send: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
    });
  }

  // Clickjacking
  const hasAntiClickjacking = httpHeaders['x-frame-options'] || (httpHeaders['content-security-policy'] && httpHeaders['content-security-policy'].includes('frame-ancestors'));
  if (!hasAntiClickjacking) {
    deduction += 12;
    vulnerabilities.push({
      id: 'VULN-SEC-CLICKJACK',
      title: 'Clickjacking Protection Deficient (Missing X-Frame-Options)',
      severity: 'MEDIUM',
      description: 'The web application allows itself to be framed within <iframe> or <frame> elements by any third-party website.',
      impact: 'Attackers can trick authenticated users into triggering unwanted actions (e.g. clicking buttons, deleting accounts) via invisible overlay frames.',
      remediation: "Set X-Frame-Options: SAMEORIGIN or utilize CSP frame-ancestors 'self';",
    });
  }

  // Missing X-Content-Type-Options
  if (httpHeaders['x-content-type-options'] !== 'nosniff') {
    deduction += 8;
    vulnerabilities.push({
      id: 'VULN-SEC-NOSNIFF',
      title: 'Missing MIME Sniffing Defense (X-Content-Type-Options)',
      severity: 'MEDIUM',
      description: 'Missing X-Content-Type-Options: nosniff header allows browsers to guess the MIME type of a response.',
      impact: 'Can lead to executable code injection when user-uploaded images or text files are executed as scripts by the browser.',
      remediation: 'Enforce header: X-Content-Type-Options: nosniff on all static and dynamic responses.',
    });
  }

  // Missing DMARC or SPF
  if (!dnsRecords.dmarcPresent && !net.isIP(host)) {
    deduction += 10;
    vulnerabilities.push({
      id: 'VULN-DNS-DMARC',
      title: 'Missing DMARC Email Authentication Record',
      severity: 'MEDIUM',
      description: 'No valid _dmarc TXT record was discovered in the domain DNS zone.',
      impact: 'Allows malicious actors to forge emails spoofing this domain name (CEO fraud, phishing campaigns against customers).',
      remediation: 'Publish a DMARC TXT record at _dmarc.yourdomain.com with policy p=quarantine or p=reject.',
    });
  }

  // Server banner disclosure
  if (serverDisclosed || poweredByDisclosed) {
    deduction += 5;
    vulnerabilities.push({
      id: 'VULN-INFO-BANNER',
      title: 'Server and Technology Banner Information Disclosure',
      severity: 'LOW',
      description: `Revealed: ${[serverDisclosed, poweredByDisclosed].filter(Boolean).join(', ')}`,
      impact: 'Assists reconnaissance by exposing exact software distributions and versions to automated vulnerability scanners.',
      remediation: 'Disable Server and X-Powered-By tokens in web server configurations.',
    });
  }

  // SSL Expiry Warning
  if (ssl.enabled && ssl.daysRemaining !== undefined && ssl.daysRemaining < 21) {
    deduction += 10;
    vulnerabilities.push({
      id: 'VULN-SSL-EXPIRING',
      title: `SSL Certificate Expiring Soon (${ssl.daysRemaining} Days)`,
      severity: 'HIGH',
      description: `The SSL/TLS certificate for ${host} will expire in ${ssl.daysRemaining} days.`,
      impact: 'Expired certificates trigger browser security blocks (NET::ERR_CERT_DATE_INVALID) stopping all legitimate user traffic.',
      remediation: 'Renew and deploy updated TLS certificates via Let’s Encrypt / Certbot or your Certificate Authority.',
    });
  }

  const finalScore = Math.max(10, Math.min(100, 100 - deduction));
  let grade: VaptScanResult['grade'] = 'F';
  if (finalScore >= 95) grade = 'A+';
  else if (finalScore >= 85) grade = 'A';
  else if (finalScore >= 72) grade = 'B';
  else if (finalScore >= 58) grade = 'C';
  else if (finalScore >= 42) grade = 'D';

  const criticalIssues = vulnerabilities.filter((v) => v.severity === 'CRITICAL').length;
  const highIssues = vulnerabilities.filter((v) => v.severity === 'HIGH').length;
  const mediumIssues = vulnerabilities.filter((v) => v.severity === 'MEDIUM').length;
  const lowIssues = vulnerabilities.filter((v) => v.severity === 'LOW').length;
  const passedChecks = securityHeaders.filter((h) => h.status === 'PASS').length;
  const failedChecks = securityHeaders.filter((h) => h.status === 'FAIL').length;

  return {
    target: rawTarget,
    normalizedHost: host,
    ip: primaryIp,
    scanTimestamp: new Date().toISOString(),
    riskScore: finalScore,
    grade,
    summary: {
      totalChecks: securityHeaders.length + targetPorts.length + 3,
      passedChecks,
      failedChecks,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
    },
    dnsRecords,
    whois,
    networkGeo,
    ports: scannedPorts,
    ssl,
    securityHeaders,
    vulnerabilities,
  };
}

// Subdomain Enumeration via Live DNS Resolution
export async function enumerateSubdomains(domain: string): Promise<Array<{ subdomain: string; ip: string; cname?: string; latencyMs: number }>> {
  const cleanDomain = cleanTarget(domain);
  const commonPrefixes = [
    'www', 'mail', 'api', 'dev', 'staging', 'admin', 'vpn', 'portal', 'test',
    'app', 'auth', 'blog', 'cdn', 'secure', 'shop', 'git', 'cloud', 'remote',
    'status', 'docs', 'm', 'cpanel', 'beta', 'sso', 'gw'
  ];

  const results: Array<{ subdomain: string; ip: string; cname?: string; latencyMs: number }> = [];

  await Promise.all(
    commonPrefixes.map(async (prefix) => {
      const sub = `${prefix}.${cleanDomain}`;
      const startTime = Date.now();
      try {
        const addresses = await dnsPromises.resolve4(sub);
        const latencyMs = Date.now() - startTime;
        let cname: string | undefined;
        try {
          const cnames = await dnsPromises.resolveCname(sub);
          if (cnames && cnames.length > 0) cname = cnames[0];
        } catch { /* ignore */ }

        if (addresses && addresses.length > 0) {
          results.push({
            subdomain: sub,
            ip: addresses[0],
            cname,
            latencyMs,
          });
        }
      } catch {
        // Did not resolve -> inactive
      }
    })
  );

  return results.sort((a, b) => a.subdomain.localeCompare(b.subdomain));
}
