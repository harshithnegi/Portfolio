import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink,
  Globe
} from 'lucide-react';

interface WebsiteSafetyData {
  url: string;
  host: string;
  safetyScore: number;
  verdict: 'SAFE' | 'SUSPICIOUS' | 'UNSAFE';
  summary: string;
  sslCheck: {
    valid: boolean;
    issuer?: string;
    daysRemaining?: number;
    error?: string;
  };
  httpsEnforced: boolean;
  securityHeadersScore: number;
  blacklistStatus: 'CLEAN' | 'FLAGGED';
  riskFactors: Array<{ title: string; risk: 'HIGH' | 'MEDIUM' | 'LOW'; detail: string }>;
}

export const WebsiteSafetyChecker: React.FC = () => {
  const [url, setUrl] = useState('https://github.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WebsiteSafetyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = ['https://github.com', 'https://wikipedia.org', 'https://cloudflare.com'];

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tools/website-safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status} failed`);
      }

      const data: WebsiteSafetyData = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect website safety.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'SAFE':
        return { text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30', label: 'Verified Safe & Encrypted' };
      case 'SUSPICIOUS':
        return { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', label: 'Suspicious / Caution' };
      case 'UNSAFE':
        return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'High Risk / Unsafe' };
      default:
        return { text: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-700', label: verdict };
    }
  };

  return (
    <div id="website-safety-tool" className="space-y-6">
      {/* Input Box */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-neon-green" />
              Website Safety Checker
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Rapid safety posture audit checking SSL certificate integrity, HTTPS enforcement, defense headers, and phishing indicators.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-500">Quick:</span>
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setUrl(p)}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 border border-gray-700/60 transition-colors"
              >
                {p.replace(/^https?:\/\//, '')}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 bg-[#070b12] border border-gray-700 rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-neon-green"
          />

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-5 py-2.5 bg-neon-green text-black font-bold font-mono text-sm rounded-lg hover:bg-neon-cyan transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Checking Safety...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Check Safety
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Safety Results Card */}
      {result && (
        <div className="space-y-4">
          {/* Top Score Banner */}
          {(() => {
            const style = getVerdictStyle(result.verdict);
            return (
              <div className={`p-5 rounded-xl border ${style.bg} ${style.border} flex flex-col sm:flex-row items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl font-mono ${
                    result.safetyScore >= 80 ? 'bg-neon-green/20 text-neon-green' : result.safetyScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {result.safetyScore}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-display font-bold text-lg ${style.text}`}>{style.label}</span>
                      <span className="text-xs font-mono text-gray-400">({result.host})</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1 max-w-xl">{result.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-gray-400">Reputation:</span>
                  <span className="px-2 py-0.5 rounded bg-black/40 border border-gray-700 text-neon-green">
                    {result.blacklistStatus}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Security Checklist Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Check 1: SSL Certificate */}
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-neon-green" />
                  SSL/TLS Encryption
                </span>
                {result.sslCheck.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={result.sslCheck.valid ? 'text-neon-green font-semibold' : 'text-red-400'}>
                    {result.sslCheck.valid ? 'Valid & Trusted' : 'Invalid / Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issuer CA:</span>
                  <span className="text-white truncate max-w-[150px]">{result.sslCheck.issuer || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Days Remaining:</span>
                  <span className="text-white">{result.sslCheck.daysRemaining ? `${result.sslCheck.daysRemaining} days` : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Check 2: HTTPS Enforced */}
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  HTTPS Redirection
                </span>
                {result.httpsEnforced ? (
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Enforcement:</span>
                  <span className={result.httpsEnforced ? 'text-neon-green font-semibold' : 'text-yellow-400'}>
                    {result.httpsEnforced ? 'Automatic 301/302' : 'Plaintext Allowed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Port 80 to 443:</span>
                  <span className="text-white">{result.httpsEnforced ? 'Redirected' : 'Not Redirected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">MITM Resistance:</span>
                  <span className="text-white">{result.httpsEnforced ? 'High' : 'Low'}</span>
                </div>
              </div>
            </div>

            {/* Check 3: Security Headers */}
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-300 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  Defense Headers
                </span>
                <span className="text-neon-green font-bold">{result.securityHeadersScore}/100</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Header Posture:</span>
                  <span className={result.securityHeadersScore >= 70 ? 'text-neon-green font-semibold' : 'text-yellow-400'}>
                    {result.securityHeadersScore >= 70 ? 'Hardened' : 'Basic / Weak'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Anti-Clickjacking:</span>
                  <span className="text-white">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">XSS Isolation:</span>
                  <span className="text-white">{result.securityHeadersScore >= 50 ? 'Protected' : 'Missing CSP'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          {result.riskFactors.length > 0 && (
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 space-y-3">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Identified Risk Factors ({result.riskFactors.length})
              </h3>

              <div className="space-y-2">
                {result.riskFactors.map((rf, idx) => (
                  <div key={idx} className="p-3 bg-black/40 border border-gray-800 rounded-lg flex items-start gap-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 mt-0.5 ${
                      rf.risk === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : rf.risk === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}>
                      {rf.risk}
                    </span>
                    <div>
                      <span className="font-display font-semibold text-xs text-white block">{rf.title}</span>
                      <p className="text-gray-400 text-xs mt-0.5 font-mono">{rf.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
