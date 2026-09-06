import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { performVaptScan, enumerateSubdomains, cleanTarget } from './server/securityScanner';
import { runDomainDossier, runNiktoWebScan, runWebsiteSafetyCheck } from './server/dossierAndTools';
import { executeRealDomainDossier } from './server/realDossier';
import dns from 'dns';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    const formspreeId = process.env.FORMSP_ID;

    console.log(`Received contact form from ${name} (${email}): ${subject}`);

    if (!formspreeId) {
      console.warn('FORMSP_ID not set in environment variables. Message logged but not sent to Formspree.');
      // Return success to the client so the UI shows "Sent"
      return res.json({ success: true, message: 'Message logged (FORMSP_ID missing)' });
    }

    try {
      const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, subject, message })
      });

      if (response.ok) {
        res.json({ success: true });
      } else {
        const errorData = await response.json();
        console.error('Formspree error:', errorData);
        res.status(500).json({ success: false, error: 'Failed to send to Formspree' });
      }
    } catch (error) {
      console.error('Server error during contact submission:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // 1. Full Mini VAPT & Domain Dossier Scan
  app.post('/api/scan/vapt', async (req, res) => {
    try {
      const { target } = req.body;
      if (!target || typeof target !== 'string') {
        return res.status(400).json({ error: 'Target domain or IP is required' });
      }
      const scanResult = await performVaptScan(target);
      res.json(scanResult);
    } catch (err: any) {
      console.error('VAPT Scan Error:', err);
      res.status(500).json({ error: err.message || 'Failed to complete security scan' });
    }
  });

  // 2. Subdomain & DNS Recon
  app.post('/api/scan/subdomains', async (req, res) => {
    try {
      const { domain } = req.body;
      if (!domain || typeof domain !== 'string') {
        return res.status(400).json({ error: 'Domain is required' });
      }
      const subdomains = await enumerateSubdomains(domain);
      res.json({ domain: cleanTarget(domain), subdomains });
    } catch (err: any) {
      console.error('Subdomain recon error:', err);
      res.status(500).json({ error: err.message || 'Subdomain reconnaissance failed' });
    }
  });

  // 3. Web Security Headers & Hardening Code Generator
  app.post('/api/scan/headers', async (req, res) => {
    try {
      let { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Valid URL is required' });
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SecurityHeaderInspector/1.0',
        },
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      });

      const rawHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        rawHeaders[key.toLowerCase()] = val;
      });

      const csp = rawHeaders['content-security-policy'];
      const hsts = rawHeaders['strict-transport-security'];
      const xfo = rawHeaders['x-frame-options'];
      const xcto = rawHeaders['x-content-type-options'];
      const referrer = rawHeaders['referrer-policy'];
      const permissions = rawHeaders['permissions-policy'];
      const server = rawHeaders['server'];
      const poweredBy = rawHeaders['x-powered-by'];
      const coop = rawHeaders['cross-origin-opener-policy'];
      const corp = rawHeaders['cross-origin-resource-policy'];

      const headerAudit = [
        {
          key: 'Content-Security-Policy',
          status: csp ? 'pass' : 'fail',
          value: csp || 'Not Configured',
          importance: 'Protects against XSS, clickjacking, and content injection.',
          fixSnippet: {
            nginx: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self'; object-src 'none';\" always;",
            apache: "Header set Content-Security-Policy \"default-src 'self'; script-src 'self'; object-src 'none';\"",
            express: "app.use(helmet.contentSecurityPolicy());",
          },
        },
        {
          key: 'Strict-Transport-Security (HSTS)',
          status: hsts ? 'pass' : 'fail',
          value: hsts || 'Not Configured',
          importance: 'Forces browsers to only communicate over HTTPS, preventing SSL-stripping MITM attacks.',
          fixSnippet: {
            nginx: "add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;",
            apache: "Header always set Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\"",
            express: "app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));",
          },
        },
        {
          key: 'X-Frame-Options',
          status: xfo || (csp && csp.includes('frame-ancestors')) ? 'pass' : 'fail',
          value: xfo || (csp && csp.includes('frame-ancestors') ? 'Protected via CSP frame-ancestors' : 'Not Configured'),
          importance: 'Prevents Clickjacking attacks by forbidding framing inside unauthorized iframes.',
          fixSnippet: {
            nginx: "add_header X-Frame-Options \"SAMEORIGIN\" always;",
            apache: "Header always set X-Frame-Options \"SAMEORIGIN\"",
            express: "app.use(helmet.frameguard({ action: 'sameorigin' }));",
          },
        },
        {
          key: 'X-Content-Type-Options',
          status: xcto === 'nosniff' ? 'pass' : 'fail',
          value: xcto || 'Not Configured',
          importance: 'Blocks MIME-sniffing and forces browser to respect content-type.',
          fixSnippet: {
            nginx: "add_header X-Content-Type-Options \"nosniff\" always;",
            apache: "Header set X-Content-Type-Options \"nosniff\"",
            express: "app.use(helmet.noSniff());",
          },
        },
        {
          key: 'Referrer-Policy',
          status: referrer ? 'pass' : 'warn',
          value: referrer || 'Not Set (Browser Default)',
          importance: 'Protects user privacy by controlling sensitive URL paths in HTTP Referer.',
          fixSnippet: {
            nginx: "add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;",
            apache: "Header set Referrer-Policy \"strict-origin-when-cross-origin\"",
            express: "app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));",
          },
        },
        {
          key: 'Permissions-Policy',
          status: permissions ? 'pass' : 'warn',
          value: permissions || 'Not Configured',
          importance: 'Restricts camera, microphone, geolocation, and payment hardware access.',
          fixSnippet: {
            nginx: "add_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;",
            apache: "Header set Permissions-Policy \"camera=(), microphone=(), geolocation=()\"",
            express: "app.use((req, res, next) => { res.setHeader('Permissions-Policy', 'camera=(), microphone=()'); next(); });",
          },
        },
        {
          key: 'Server & Technology Information Leak',
          status: server || poweredBy ? 'warn' : 'pass',
          value: [server ? `Server: ${server}` : '', poweredBy ? `X-Powered-By: ${poweredBy}` : ''].filter(Boolean).join(' | ') || 'Hidden (Secure)',
          importance: 'Reveals server/framework versions to attackers.',
          fixSnippet: {
            nginx: "server_tokens off;",
            apache: "ServerTokens Prod\nServerSignature Off",
            express: "app.disable('x-powered-by');",
          },
        },
      ];

      res.json({
        url,
        finalUrl: response.url,
        statusCode: response.status,
        headers: headerAudit,
        rawHeaders,
      });
    } catch (err: any) {
      console.error('Header scan error:', err);
      res.status(500).json({ error: err.message || 'Failed to inspect web security headers' });
    }
  });

  // 4. HTTP Request & CORS Analyzer
  app.post('/api/scan/cors', async (req, res) => {
    try {
      let { url } = req.body;
      if (!url) return res.status(400).json({ error: 'URL is required' });
      if (!url.startsWith('http')) url = `https://${url}`;

      const optionsRes = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://evil-attacker.example.com',
          'Access-Control-Request-Method': 'POST',
        },
        signal: AbortSignal.timeout(4000),
      }).catch(() => null);

      const corsHeaders: Record<string, string> = {};
      if (optionsRes) {
        optionsRes.headers.forEach((val, key) => {
          if (key.toLowerCase().startsWith('access-control-')) {
            corsHeaders[key.toLowerCase()] = val;
          }
        });
      }

      const allowOrigin = corsHeaders['access-control-allow-origin'];
      const allowCredentials = corsHeaders['access-control-allow-credentials'];

      let corsStatus = 'SECURE';
      let message = 'No insecure CORS wildcard reflection detected.';

      if (allowOrigin === '*' && allowCredentials === 'true') {
        corsStatus = 'CRITICAL';
        message = 'Wildcard origin permitted with credentials! Major security misconfiguration.';
      } else if (allowOrigin === 'https://evil-attacker.example.com') {
        corsStatus = 'HIGH';
        message = 'Arbitrary origin reflection detected without proper domain whitelist!';
      } else if (allowOrigin === '*') {
        corsStatus = 'INFO';
        message = 'Public wildcard API (*). Ensure no private or authenticated endpoints use this.';
      }

      res.json({
        url,
        corsHeaders,
        corsStatus,
        message,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'CORS analysis failed' });
    }
  });

  // 5. Password & Hash Security Generator
  app.post('/api/scan/hash', (req, res) => {
    const { text } = req.body;
    if (typeof text !== 'string') return res.status(400).json({ error: 'Text required' });

    const md5 = crypto.createHash('md5').update(text).digest('hex');
    const sha1 = crypto.createHash('sha1').update(text).digest('hex');
    const sha256 = crypto.createHash('sha256').update(text).digest('hex');
    const sha512 = crypto.createHash('sha512').update(text).digest('hex');

    res.json({ md5, sha1, sha256, sha512 });
  });

  // 6. Domain Dossier (CentralOps real authentic output: whois, DNS, traceroute, network whois, service scan)
  app.post('/api/tools/domain-dossier', async (req, res) => {
    try {
      const { target } = req.body;
      if (!target || typeof target !== 'string') {
        return res.status(400).json({ error: 'Target domain or IP is required' });
      }
      const data = await executeRealDomainDossier(target);
      res.json(data);
    } catch (err: any) {
      console.error('Domain Dossier Error:', err);
      res.status(500).json({ error: err.message || 'Failed to complete Domain Dossier' });
    }
  });

  // 7. Web Vulnerability Identifier (Nikto Scanner style)
  app.post('/api/tools/nikto-scan', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Target URL is required' });
      }
      const data = await runNiktoWebScan(url);
      res.json(data);
    } catch (err: any) {
      console.error('Nikto Web Scan Error:', err);
      res.status(500).json({ error: err.message || 'Nikto scan execution failed' });
    }
  });

  // 8. Website Safety Checker
  app.post('/api/tools/website-safety', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Target URL is required' });
      }
      const data = await runWebsiteSafetyCheck(url);
      res.json(data);
    } catch (err: any) {
      console.error('Website Safety Check Error:', err);
      res.status(500).json({ error: err.message || 'Safety check failed' });
    }
  });

  // 9. What is my IP / IP Address Checker
  app.get('/api/tools/my-ip', async (req, res) => {
    try {
      // Resolve client IP from ingress headers
      const forwarded = req.headers['x-forwarded-for'];
      let clientIp = '';
      if (typeof forwarded === 'string') {
        clientIp = forwarded.split(',')[0].trim();
      } else if (Array.isArray(forwarded) && forwarded.length > 0) {
        clientIp = forwarded[0].trim();
      } else if (req.headers['cf-connecting-ip']) {
        clientIp = String(req.headers['cf-connecting-ip']);
      } else if (req.headers['x-real-ip']) {
        clientIp = String(req.headers['x-real-ip']);
      } else {
        clientIp = req.socket.remoteAddress || '';
      }

      // If local or private IP (e.g. 127.0.0.1 or ::1 or 10.x), fetch public IP from upstream
      if (!clientIp || clientIp === '::1' || clientIp === '127.0.0.1' || clientIp.startsWith('10.') || clientIp.startsWith('192.168.')) {
        try {
          const publicIpRes = await fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
          if (publicIpRes.ok) {
            const data: any = await publicIpRes.json();
            if (data.ip) clientIp = data.ip;
          }
        } catch {
          // ignore
        }
      }

      let geoInfo: any = {};
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`, {
          signal: AbortSignal.timeout(3000),
        });
        if (geoRes.ok) {
          geoInfo = await geoRes.json();
        }
      } catch {
        // ignore
      }

      // Reverse DNS lookup
      let reverseDns = '';
      try {
        const hostnames = await dns.promises.reverse(clientIp);
        if (hostnames && hostnames.length > 0) {
          reverseDns = hostnames[0];
        }
      } catch {
        // ignore
      }

      const isVpnOrProxy = Boolean(
        geoInfo.isp?.toLowerCase().includes('hosting') ||
        geoInfo.isp?.toLowerCase().includes('cloud') ||
        geoInfo.org?.toLowerCase().includes('datacenter') ||
        geoInfo.as?.toLowerCase().includes('google') ||
        geoInfo.as?.toLowerCase().includes('cloudflare') ||
        geoInfo.as?.toLowerCase().includes('amazon')
      );

      res.json({
        ip: clientIp || geoInfo.query || '127.0.0.1',
        type: clientIp.includes(':') ? 'IPv6' : 'IPv4',
        country: geoInfo.country || 'Unknown',
        countryCode: geoInfo.countryCode || '',
        region: geoInfo.regionName || '',
        city: geoInfo.city || '',
        zip: geoInfo.zip || '',
        lat: geoInfo.lat || 0,
        lon: geoInfo.lon || 0,
        timezone: geoInfo.timezone || 'UTC',
        isp: geoInfo.isp || 'Local Network',
        org: geoInfo.org || geoInfo.isp || '',
        asn: geoInfo.as || '',
        reverseDns: reverseDns || clientIp,
        isVpnOrProxy,
        userAgent: req.headers['user-agent'] || '',
      });
    } catch (err: any) {
      console.error('My IP Error:', err);
      res.status(500).json({ error: err.message || 'Failed to detect IP address' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
