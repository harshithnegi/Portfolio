import React, { useState } from 'react';
import { 
  Search, 
  Server, 
  Globe, 
  Activity, 
  ExternalLink, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface SubdomainEntry {
  subdomain: string;
  ip: string;
  cname?: string;
  latencyMs: number;
}

interface SubdomainReconResult {
  domain: string;
  subdomains: SubdomainEntry[];
}

export const SubdomainDnsRecon: React.FC = () => {
  const [domain, setDomain] = useState('github.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubdomainReconResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [filterText, setFilterText] = useState('');

  const presets = ['github.com', 'tesla.com', 'cloudflare.com', 'microsoft.com'];

  const handleRecon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/scan/subdomains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status} reconnaissance failure`);
      }

      const data: SubdomainReconResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to enumerate subdomains.');
    } finally {
      setLoading(false);
    }
  };

  const filteredList = result?.subdomains.filter(
    (s) => s.subdomain.toLowerCase().includes(filterText.toLowerCase()) || s.ip.includes(filterText)
  ) ?? [];

  const copyAllSubdomains = () => {
    if (!result) return;
    const text = result.subdomains.map((s) => `${s.subdomain}\t${s.ip}\t${s.cname || ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    if (!result) return;
    const csvContent = 'Subdomain,Resolved_IP,CNAME,Latency_ms\n' + 
      result.subdomains.map((s) => `"${s.subdomain}","${s.ip}","${s.cname || ''}",${s.latencyMs}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subdomains_${result.domain}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id="subdomain-recon-root" className="space-y-6">
      {/* Search Bar */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Live DNS Reconnaissance
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Search className="w-6 h-6 text-cyan-400" />
              Subdomain & DNS Reconnaissance Tool
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Perform concurrent DNS brute-force queries across top network infrastructure subdomains (api, mail, dev, vpn, admin, portal).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">Presets:</span>
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDomain(p)}
                className="text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-gray-700/50 transition-colors font-mono"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRecon} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="subdomain-input"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. github.com, example.com"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 bg-[#070b12] border border-gray-700/80 rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
          </div>

          <button
            type="submit"
            id="subdomain-scan-button"
            disabled={loading || !domain.trim()}
            className="px-6 py-3 bg-cyan-500 text-black font-bold font-mono text-sm rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Querying DNS Zones...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Enumerate Subdomains
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Recon Error</p>
              <p className="text-xs text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div>
              <span className="text-xs font-mono uppercase text-gray-400">Target Root Domain</span>
              <div className="text-lg font-mono font-bold text-white flex items-center gap-2 mt-0.5">
                <span className="text-cyan-400">{result.domain}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                  {result.subdomains.length} Active Host{result.subdomains.length === 1 ? '' : 's'} Discovered
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filter hosts or IP..."
                className="px-3 py-1.5 bg-black/50 border border-gray-700 rounded text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />

              <button
                type="button"
                onClick={copyAllSubdomains}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-gray-700 rounded text-xs font-mono text-gray-200 flex items-center gap-1.5 transition-colors"
                title="Copy TSV to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>

              <button
                type="button"
                onClick={exportCsv}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-gray-700 rounded text-xs font-mono text-gray-200 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>
          </div>

          {result.subdomains.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-black/40 rounded-lg">
              <p>No standard subdomains resolved for {result.domain}.</p>
              <p className="text-xs text-gray-500 mt-1">Target might use wildcard DNS or dedicated private reverse proxies.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="py-2.5 px-3">Subdomain Hostname</th>
                    <th className="py-2.5 px-3">Resolved IP Address</th>
                    <th className="py-2.5 px-3">CNAME / Alias</th>
                    <th className="py-2.5 px-3">DNS Latency</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredList.map((entry) => (
                    <tr key={entry.subdomain} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        {entry.subdomain}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">{entry.ip}</td>
                      <td className="py-2.5 px-3 text-gray-400 truncate max-w-xs">
                        {entry.cname || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-400">{entry.latencyMs} ms</td>
                      <td className="py-2.5 px-3 text-right">
                        <a
                          href={`https://${entry.subdomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                          Visit <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
