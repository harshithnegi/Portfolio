import React, { useState } from 'react';
import { 
  Network, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Globe, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';

interface CorsResult {
  url: string;
  corsHeaders: Record<string, string>;
  corsStatus: 'SECURE' | 'CRITICAL' | 'HIGH' | 'INFO';
  message: string;
}

export const CorsRequestAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('https://api.github.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CorsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    'https://api.github.com',
    'https://example.com',
    'https://httpbin.org/get',
    'https://cloudflare.com',
  ];

  const handleInspect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/scan/cors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status} error probing CORS`);
      }

      const data: CorsResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to inspect HTTP CORS configuration.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'INFO':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-neon-green/20 text-neon-green border border-neon-green/30';
    }
  };

  return (
    <div id="cors-analyzer-root" className="space-y-6">
      {/* Search Header */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-violet-400">
                Live HTTP & CORS Probe
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Network className="w-6 h-6 text-violet-400" />
              HTTP Request & CORS Security Analyzer
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Simulate pre-flight OPTIONS requests with arbitrary origin payloads to detect CORS misconfigurations and credential leakage.
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

        <form onSubmit={handleInspect} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="cors-url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com"
              disabled={loading}
              className="w-full pl-10 pr-4 py-3 bg-[#070b12] border border-gray-700/80 rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all"
            />
          </div>

          <button
            type="submit"
            id="cors-scan-button"
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-violet-500 text-white font-bold font-mono text-sm rounded-lg hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing CORS...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze Request & CORS
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Inspection Failed</p>
              <p className="text-xs text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div>
              <span className="text-xs font-mono uppercase text-gray-400">Endpoint Audited</span>
              <div className="text-sm font-mono text-violet-400 font-bold mt-0.5">{result.url}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase ${getStatusBadge(result.corsStatus)}`}>
                {result.corsStatus}
              </span>
            </div>
          </div>

          <div className="p-4 bg-black/40 border border-gray-800 rounded-lg">
            <span className="text-xs font-mono uppercase text-gray-400 block mb-1">Security Evaluation</span>
            <p className="text-sm text-gray-200">{result.message}</p>
          </div>

          {/* Headers list */}
          <div>
            <h3 className="text-sm font-display font-semibold text-white mb-3">
              CORS Response Headers Captured
            </h3>
            {Object.keys(result.corsHeaders).length === 0 ? (
              <div className="p-6 bg-black/30 border border-gray-800 rounded-lg text-center text-xs font-mono text-gray-400">
                No explicit Access-Control headers transmitted in OPTIONS response. Standard Same-Origin Policy (SOP) is enforced.
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {Object.entries(result.corsHeaders).map(([k, v]) => (
                  <div key={k} className="p-3 bg-black/50 border border-gray-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-violet-300 font-bold">{k}</span>
                    <span className="text-gray-200 bg-white/5 px-2 py-0.5 rounded break-all">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
