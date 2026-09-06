import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  CheckSquare, 
  Square, 
  Server, 
  Network, 
  Shield, 
  Clock, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal,
  ExternalLink,
  FileText,
  Radio,
  Layers,
  CheckCircle2,
  XCircle,
  Activity,
  Code
} from 'lucide-react';

export interface ScannedPort {
  name: string;
  port: number;
  isOpen: boolean;
  banner: string;
}

export interface RealDossierResponse {
  target: string;
  host: string;
  ip: string;
  rawReport: string;
  addressLookup: {
    canonicalName: string;
    aliases: string[];
    addresses: string[];
  };
  domainWhoisText: string;
  networkWhoisText: string;
  dnsRecordsText: string;
  tracerouteText: string;
  serviceScanText: string;
  servicePorts?: ScannedPort[];
  timestamp: string;
}

export const DomainDossier: React.FC = () => {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RealDossierResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [serviceViewMode, setServiceViewMode] = useState<'highlighted' | 'raw'>('highlighted');

  // Options toggles (CentralOps style)
  const [options, setOptions] = useState({
    whois: true,
    networkWhois: true,
    dns: true,
    traceroute: true,
    serviceScan: true,
  });

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleScan = async (queryTarget?: string) => {
    const domainToScan = (queryTarget || target).trim();
    if (!domainToScan) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tools/domain-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: domainToScan }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Domain dossier query failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to query live WHOIS and network servers');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.rawReport) return;
    navigator.clipboard.writeText(result.rawReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to parse ports from text or structured response
  const parsedPorts: ScannedPort[] = React.useMemo(() => {
    if (!result) return [];
    if (result.servicePorts && result.servicePorts.length > 0) {
      return result.servicePorts;
    }
    if (!result.serviceScanText) return [];

    const lines = result.serviceScanText.split('\n');
    const items: ScannedPort[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'Service scan' || trimmed === '-- end --') continue;
      const tabIdx = trimmed.indexOf('\t');
      if (tabIdx !== -1) {
        const name = trimmed.slice(0, tabIdx).trim();
        const banner = trimmed.slice(tabIdx + 1).trim();
        const portMatch = name.match(/(\d+)$/);
        const portNum = portMatch ? parseInt(portMatch[1], 10) : 0;
        const isTimedOut = banner.toLowerCase().includes('timedout');
        const isError = banner.toLowerCase().startsWith('error') || banner.toLowerCase().startsWith('connection error');
        items.push({
          name,
          port: portNum,
          isOpen: !isTimedOut && !isError,
          banner,
        });
      }
    }
    return items;
  }, [result]);

  const openPortsCount = parsedPorts.filter((p) => p.isOpen).length;
  const closedPortsCount = parsedPorts.length - openPortsCount;

  return (
    <div className="w-full space-y-6 text-gray-200">
      {/* Search Header and CentralOps Controls */}
      <div className="p-6 rounded-2xl bg-[#0d131f]/90 border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-xl font-mono font-bold text-white tracking-wide">Domain Dossier</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                Live WHOIS • Port 43 • Real DNS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
              className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              {viewMode === 'formatted' ? 'View Raw CentralOps Text' : 'View Structured Layout'}
            </button>
            {result && (
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                {copied ? 'Copied Full Dossier' : 'Copy Full Dossier'}
              </button>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="mt-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Enter domain or IP"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !target.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-mono font-semibold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Querying Registries...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Run Dossier</span>
                </>
              )}
            </button>
          </div>

          {/* CentralOps Dossier Query Options */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="text-gray-500 font-medium">Sections:</span>
            <button
              type="button"
              onClick={() => toggleOption('whois')}
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              {options.whois ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-gray-500" />}
              <span>Domain Whois</span>
            </button>
            <button
              type="button"
              onClick={() => toggleOption('networkWhois')}
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              {options.networkWhois ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-gray-500" />}
              <span>Network Whois</span>
            </button>
            <button
              type="button"
              onClick={() => toggleOption('dns')}
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              {options.dns ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-gray-500" />}
              <span>DNS records</span>
            </button>
            <button
              type="button"
              onClick={() => toggleOption('traceroute')}
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              {options.traceroute ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-gray-500" />}
              <span>Traceroute</span>
            </button>
            <button
              type="button"
              onClick={() => toggleOption('serviceScan')}
              className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              {options.serviceScan ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-gray-500" />}
              <span>Service scan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-sm flex items-center gap-3">
          <Shield className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <div className="font-semibold text-rose-200">Query Encountered An Error</div>
            <div className="text-xs text-rose-400/90 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="p-8 rounded-2xl bg-[#090d16]/90 border border-white/10 flex flex-col items-center justify-center gap-3 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <div className="font-mono text-sm text-white">Contacting Authoritative Registries & Probing Services...</div>
          <div className="font-mono text-xs text-gray-400">
            Querying port 43 WHOIS, resolving DNS zone records, calculating route hops, and connecting to active ports.
          </div>
        </div>
      )}

      {/* Standby state when no domain scanned yet */}
      {!result && !loading && !error && (
        <div className="p-10 rounded-2xl bg-[#0a0f1d]/40 border border-white/10 text-center flex flex-col items-center justify-center gap-2">
          <Terminal className="w-8 h-8 text-cyan-400/60 mb-1" />
          <div className="font-mono text-sm text-gray-300">Ready for Dossier Generation</div>
          <p className="font-mono text-xs text-gray-500 max-w-md">
            Enter any domain name or IP address above and click Generate Dossier to query WHOIS records, DNS zone entries, route trace, and service ports.
          </p>
        </div>
      )}

      {/* Dossier Output */}
      {result && !loading && (
        <div className="space-y-6">
          {viewMode === 'raw' ? (
            /* RAW CentralOps Output View */
            <div className="rounded-2xl bg-[#06090e] border border-white/15 p-6 overflow-x-auto shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="text-xs font-mono text-emerald-400 font-semibold">
                  RAW CENTRALOPS DOSSIER STREAM FOR [{result.host}]
                </div>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <pre className="font-mono text-xs leading-relaxed text-gray-200 whitespace-pre-wrap select-all font-normal">
                {result.rawReport}
              </pre>
            </div>
          ) : (
            /* STRUCTURED CentralOps Layout View */
            <div className="space-y-6 font-mono">
              {/* 1. Address lookup */}
              <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/10 shadow-lg">
                <h3 className="text-base font-bold text-emerald-400 pb-3 mb-4 border-b border-white/10 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Address lookup
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-gray-400 w-44 font-semibold">canonical name</td>
                        <td className="py-2.5 text-white font-mono">{result.addressLookup.canonicalName}</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-gray-400 font-semibold">aliases</td>
                        <td className="py-2.5 text-gray-300 font-mono">
                          {result.addressLookup.aliases.length > 0 ? result.addressLookup.aliases.join(', ') : '—'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-gray-400 font-semibold">addresses</td>
                        <td className="py-2.5 text-cyan-300 font-mono">
                          {result.addressLookup.addresses.map((addr, idx) => (
                            <div key={idx}>{addr}</div>
                          ))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Domain Whois record */}
              {options.whois && (
                <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Domain Whois record
                    </h3>
                    <span className="text-xs text-gray-400">Port 43 TCP Query</span>
                  </div>
                  <div className="bg-[#050810] p-4 rounded-xl border border-white/5 overflow-x-auto max-h-[380px] overflow-y-auto">
                    <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.domainWhoisText}
                    </pre>
                  </div>
                </div>
              )}

              {/* 3. Network Whois record */}
              {options.networkWhois && (
                <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <h3 className="text-base font-bold text-purple-400 flex items-center gap-2">
                      <Network className="w-4 h-4" />
                      Network Whois record
                    </h3>
                    <span className="text-xs text-gray-400">RIPE / ARIN Database</span>
                  </div>
                  <div className="bg-[#050810] p-4 rounded-xl border border-white/5 overflow-x-auto max-h-[380px] overflow-y-auto">
                    <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.networkWhoisText}
                    </pre>
                  </div>
                </div>
              )}

              {/* 4. DNS records */}
              {options.dns && (
                <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      DNS records
                    </h3>
                    <span className="text-xs text-gray-400">Zone Resolution</span>
                  </div>
                  <div className="bg-[#050810] p-4 rounded-xl border border-white/5 overflow-x-auto">
                    <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.dnsRecordsText}
                    </pre>
                  </div>
                </div>
              )}

              {/* 5. Traceroute */}
              {options.traceroute && (
                <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/10 shadow-lg">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                    <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      Traceroute
                    </h3>
                    <span className="text-xs text-gray-400">Route Hops Resolution</span>
                  </div>
                  <div className="bg-[#050810] p-4 rounded-xl border border-white/5 overflow-x-auto">
                    <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {result.tracerouteText}
                    </pre>
                  </div>
                </div>
              )}

              {/* 6. Service scan */}
              {options.serviceScan && (
                <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-white/10 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Service scan
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {openPortsCount} Found Open
                        </span>
                        {closedPortsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-white/5 border border-white/10 text-gray-400">
                            {closedPortsCount} Timed Out
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setServiceViewMode(serviceViewMode === 'highlighted' ? 'raw' : 'highlighted')}
                        className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                      >
                        <Code className="w-3.5 h-3.5 text-cyan-400" />
                        {serviceViewMode === 'highlighted' ? 'Show Raw Port Stream' : 'Show Highlighted Ports'}
                      </button>
                    </div>
                  </div>

                  {serviceViewMode === 'highlighted' ? (
                    <div className="space-y-3">
                      {parsedPorts.map((sp) => (
                        <div
                          key={sp.name}
                          className={`p-4 rounded-xl border transition-all ${
                            sp.isOpen
                              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/30'
                              : 'bg-[#050810]/50 border-white/5 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  sp.isOpen ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-gray-600'
                                }`}
                              />
                              <span className={`font-mono text-sm font-bold ${sp.isOpen ? 'text-white' : 'text-gray-400'}`}>
                                {sp.name}
                              </span>
                            </div>

                            {sp.isOpen ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400" />
                                OPEN / RESPONSIVE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 font-mono text-[11px]">
                                TIMED OUT / FILTERED
                              </span>
                            )}
                          </div>

                          {/* Port Response Banner */}
                          <div
                            className={`mt-2.5 p-3 rounded-lg border font-mono text-xs whitespace-pre-wrap break-all leading-relaxed ${
                              sp.isOpen
                                ? 'bg-[#040810] border-emerald-500/30 text-emerald-300'
                                : 'bg-black/30 border-white/5 text-gray-500 italic'
                            }`}
                          >
                            {sp.banner}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#050810] p-4 rounded-xl border border-white/5 overflow-x-auto">
                      <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {result.serviceScanText}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
