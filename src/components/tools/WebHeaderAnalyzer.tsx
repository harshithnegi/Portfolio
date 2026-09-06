import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Check, 
  RefreshCw, 
  Code2, 
  ExternalLink,
  Lock,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderItem {
  key: string;
  status: 'pass' | 'fail' | 'warn';
  value: string;
  importance: string;
  fixSnippet: {
    nginx: string;
    apache: string;
    express: string;
  };
}

interface HeaderAuditResponse {
  url: string;
  finalUrl: string;
  statusCode: number;
  headers: HeaderItem[];
  rawHeaders: Record<string, string>;
}

export const WebHeaderAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<HeaderAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [serverType, setServerType] = useState<'nginx' | 'apache' | 'express'>('nginx');

  const presets = [
    'https://example.com',
    'https://github.com',
    'https://cloudflare.com',
    'https://wikipedia.org',
  ];

  const handleAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch('/api/scan/headers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status} error fetching headers`);
      }

      const resData: HeaderAuditResponse = await res.json();
      setData(resData);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect website security headers.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const passCount = data?.headers.filter((h) => h.status === 'pass').length ?? 0;
  const failCount = data?.headers.filter((h) => h.status === 'fail').length ?? 0;
  const warnCount = data?.headers.filter((h) => h.status === 'warn').length ?? 0;

  return (
    <div id="header-analyzer-root" className="space-y-6">
      {/* Search Header */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
                Live HTTP Inspector
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              Web Security Header Analyzer
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Test any live URL for critical OWASP HTTP security headers and generate copy-paste defense snippets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">Presets:</span>
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setUrl(p)}
                className="text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-gray-700/50 transition-colors font-mono"
              >
                {p.replace('https://', '')}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="header-url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 bg-[#070b12] border border-gray-700/80 rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            />
          </div>

          <button
            type="submit"
            id="header-analyze-button"
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-blue-500 text-white font-bold font-mono text-sm rounded-lg hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Querying URL...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze Headers
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Inspection Failure</p>
              <p className="text-xs text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Checklist */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Executive Overview Banner */}
          <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div>
              <span className="text-xs font-mono uppercase text-gray-400">Scanned Destination</span>
              <div className="text-sm font-mono text-white font-bold flex items-center gap-2 mt-0.5">
                <span className="text-blue-400">{data.finalUrl}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-gray-700 text-gray-300">
                  HTTP {data.statusCode}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-green/10 border border-neon-green/30 rounded-lg text-neon-green font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{passCount} Passed</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 font-bold">
                <XCircle className="w-4 h-4" />
                <span>{failCount} Missing</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>{warnCount} Warn</span>
              </div>
            </div>
          </div>

          {/* Server Config Fix Snippet Switcher */}
          <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
              <div>
                <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-400" />
                  Full Hardening Configuration Generator
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Copy and apply these hardened security directives directly to your web server.
                </p>
              </div>

              <div className="flex rounded-lg bg-black/50 p-1 border border-gray-800 text-xs font-mono">
                {(['nginx', 'apache', 'express'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setServerType(st)}
                    className={`px-3 py-1 rounded transition-colors uppercase ${
                      serverType === st
                        ? 'bg-blue-500 text-white font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Config Block */}
            <div className="relative">
              <pre className="p-4 bg-black/60 border border-gray-800 rounded-lg font-mono text-xs text-gray-200 overflow-x-auto leading-relaxed">
                {serverType === 'nginx' && `# Nginx Security Configuration (/etc/nginx/conf.d/security.conf)
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
server_tokens off;`}

                {serverType === 'apache' && `# Apache HTTP Server (.htaccess or httpd.conf)
<IfModule mod_headers.c>
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
ServerTokens Prod
ServerSignature Off`}

                {serverType === 'express' && `// Node.js Express Server (Helmet Middleware)
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'sameorigin' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.disable('x-powered-by');`}
              </pre>

              <button
                type="button"
                onClick={() => {
                  const txt = serverType === 'nginx'
                    ? `add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';" always;\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\nadd_header X-Frame-Options "SAMEORIGIN" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\nserver_tokens off;`
                    : serverType === 'apache'
                    ? `Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';"\nHeader always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\nHeader always set X-Frame-Options "SAMEORIGIN"\nHeader always set X-Content-Type-Options "nosniff"\nServerTokens Prod`
                    : `import helmet from 'helmet';\napp.use(helmet());\napp.disable('x-powered-by');`;
                  copyToClipboard(txt, 'full-config');
                }}
                className="absolute top-3 right-3 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-gray-700 rounded text-xs font-mono text-gray-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'full-config' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-neon-green" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Individual Header Breakdown (The exact format user asked for: ✓ / ✗) */}
          <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-display font-semibold text-white">
              Individual Header Verification & Diagnostic
            </h3>

            <div className="space-y-3">
              {data.headers.map((item) => (
                <div 
                  key={item.key} 
                  className={`p-4 rounded-lg border transition-colors ${
                    item.status === 'pass' 
                      ? 'bg-black/30 border-gray-800/80' 
                      : item.status === 'fail' 
                      ? 'bg-red-500/5 border-red-500/20' 
                      : 'bg-yellow-500/5 border-yellow-500/20'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {item.status === 'pass' ? (
                        <div className="w-6 h-6 rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green font-bold">
                          ✓
                        </div>
                      ) : item.status === 'fail' ? (
                        <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold">
                          ✗
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-400 font-bold">
                          !
                        </div>
                      )}
                      <span className="font-mono text-sm font-bold text-white">{item.key}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                      item.status === 'pass' 
                        ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' 
                        : item.status === 'fail' 
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                        : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {item.status === 'pass' ? 'Configured' : item.status === 'fail' ? 'Missing / Vulnerable' : 'Warning'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-2">{item.importance}</p>

                  <div className="bg-black/60 rounded p-2 text-xs font-mono text-gray-300 overflow-x-auto mb-3 border border-gray-800">
                    <span className="text-gray-500">Value: </span>
                    {item.value}
                  </div>

                  {/* Fix Snippet */}
                  <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2">
                    <div className="font-mono text-xs text-gray-400 truncate">
                      <span className="text-neon-green">Nginx Fix: </span>
                      <code className="text-gray-300">{item.fixSnippet.nginx}</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.fixSnippet.nginx, item.key)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded border border-gray-700 text-xs font-mono flex items-center gap-1 shrink-0"
                    >
                      {copiedKey === item.key ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                      Copy Fix
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
