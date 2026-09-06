import React, { useState } from 'react';
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Server, 
  Globe, 
  Lock, 
  FileText, 
  Download, 
  RefreshCw, 
  Activity, 
  Radio, 
  ExternalLink,
  Info,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VaptResult {
  target: string;
  normalizedHost: string;
  ip: string;
  scanTimestamp: string;
  riskScore: number;
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

export const MiniVaptScanner: React.FC = () => {
  const [target, setTarget] = useState('scanme.nmap.org');
  const [scanning, setScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [result, setResult] = useState<VaptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vulns' | 'ports' | 'headers' | 'dossier' | 'dns' | 'ssl'>('vulns');

  const presets = [
    { label: 'Nmap ScanMe', val: 'scanme.nmap.org' },
    { label: 'GitHub', val: 'github.com' },
    { label: 'Example.com', val: 'example.com' },
    { label: 'Cloudflare', val: '1.1.1.1' },
  ];

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!target.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);

    const steps = [
      'Resolving DNS & Canonical Records...',
      'Querying RDAP / Whois Registrars & ASN Data...',
      'Probing TCP Ports & Gathering Service Banners...',
      'Handshaking TLS / Inspecting X.509 Certificate...',
      'Auditing HTTP Response Headers & Defensive Flags...',
      'Calculating Threat Severity & CVSS Risk Vector...',
    ];

    let stepIdx = 0;
    setCurrentStep(steps[0]);
    const stepTimer = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setCurrentStep(steps[stepIdx]);
      }
    }, 600);

    try {
      const response = await fetch('/api/scan/vapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: target.trim() }),
      });

      clearInterval(stepTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status} Scan Failed`);
      }

      const data: VaptResult = await response.json();
      setResult(data);
    } catch (err: any) {
      clearInterval(stepTimer);
      setError(err.message || 'Failed to conduct VAPT scan on target.');
    } finally {
      setScanning(false);
      setCurrentStep('');
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-neon-green border-neon-green/40 bg-neon-green/10';
      case 'B':
        return 'text-blue-400 border-blue-400/40 bg-blue-500/10';
      case 'C':
        return 'text-yellow-400 border-yellow-400/40 bg-yellow-500/10';
      case 'D':
        return 'text-orange-400 border-orange-400/40 bg-orange-500/10';
      default:
        return 'text-red-400 border-red-500/40 bg-red-500/10';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700';
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VAPT_Report_${result.normalizedHost}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id="vapt-scanner-root" className="space-y-6">
      {/* Top Controller */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-green animate-ping" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neon-green">
                Live Backend Engine
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-neon-green" />
              Mini VAPT & Domain Dossier Scanner
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Live automated reconnaissance, TCP port probing, HTTP defensive header inspection, DNS audit & risk calculation.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-mono text-gray-400">Quick Targets:</span>
            {presets.map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setTarget(p.val)}
                className="text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-gray-700/50 transition-colors font-mono"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="vapt-target-input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. scanme.nmap.org, example.com, 192.168.1.1"
              disabled={scanning}
              className="w-full pl-10 pr-4 py-3 bg-[#070b12] border border-gray-700/80 rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-neon-green/80 focus:ring-1 focus:ring-neon-green/80 transition-all"
            />
          </div>

          <button
            type="submit"
            id="vapt-scan-button"
            disabled={scanning || !target.trim()}
            className="px-6 py-3 bg-neon-green text-black font-bold font-mono text-sm rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,255,159,0.3)] shrink-0"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scanning Target...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Launch Security Scan
              </>
            )}
          </button>
        </form>

        {/* Real-time telemetry bar when scanning */}
        {scanning && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-black/60 border border-neon-green/30 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-neon-green animate-pulse" />
              <span className="text-xs font-mono text-neon-green font-medium">
                {currentStep}
              </span>
            </div>
            <span className="text-xs font-mono text-gray-400 animate-pulse">Socket active</span>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Scan Execution Error</p>
              <p className="text-xs text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Executive Score & Threat Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Grade Card */}
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-mono uppercase text-gray-400">Security Grade</span>
                <div className="text-xs text-gray-500 mt-0.5">Automated Posture</div>
              </div>
              <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-display font-black text-3xl shadow-inner ${getGradeColor(result.grade)}`}>
                {result.grade}
              </div>
            </div>

            {/* Risk Score */}
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase text-gray-400">Risk Score</span>
                <span className="text-xs font-mono text-gray-500">{result.riskScore}/100</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold font-mono text-white">
                  {result.riskScore} <span className="text-xs text-gray-400 font-normal">Score</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.riskScore > 75 ? 'bg-neon-green' : result.riskScore > 50 ? 'bg-yellow-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.riskScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Vulnerability Counts */}
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
              <span className="text-xs font-mono uppercase text-gray-400">Identified Vulnerabilities</span>
              <div className="grid grid-cols-4 gap-1 mt-2 text-center">
                <div className="bg-red-500/10 border border-red-500/20 rounded p-1.5">
                  <span className="text-xs font-mono text-red-400 block font-bold">{result.summary.criticalIssues}</span>
                  <span className="text-[10px] text-gray-400 uppercase">Crit</span>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded p-1.5">
                  <span className="text-xs font-mono text-orange-400 block font-bold">{result.summary.highIssues}</span>
                  <span className="text-[10px] text-gray-400 uppercase">High</span>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-1.5">
                  <span className="text-xs font-mono text-yellow-400 block font-bold">{result.summary.mediumIssues}</span>
                  <span className="text-[10px] text-gray-400 uppercase">Med</span>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-1.5">
                  <span className="text-xs font-mono text-blue-400 block font-bold">{result.summary.lowIssues}</span>
                  <span className="text-[10px] text-gray-400 uppercase">Low</span>
                </div>
              </div>
            </div>

            {/* Target Overview & Export */}
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs font-mono uppercase text-gray-400">Target IP</span>
                <div className="text-sm font-mono text-neon-green font-semibold mt-0.5 truncate">
                  {result.ip}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {result.networkGeo.country || 'Global'} {result.networkGeo.org ? `• ${result.networkGeo.org}` : ''}
                </div>
              </div>

              <button
                type="button"
                onClick={downloadReport}
                className="mt-3 w-full py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-gray-700 rounded text-xs font-mono text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON Report
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-800 gap-2 overflow-x-auto pb-1">
            {[
              { id: 'vulns', label: `Vulnerabilities (${result.vulnerabilities.length})`, icon: AlertTriangle },
              { id: 'ports', label: `Port Scan (${result.ports.filter(p => p.state === 'OPEN').length} Open)`, icon: Radio },
              { id: 'headers', label: `Security Headers (${result.securityHeaders.filter(h => h.status === 'PASS').length}/${result.securityHeaders.length})`, icon: Shield },
              { id: 'dossier', label: 'Domain Whois & Geo', icon: Globe },
              { id: 'dns', label: 'DNS Records', icon: Server },
              { id: 'ssl', label: result.ssl.enabled ? `TLS Certificate (Valid)` : 'TLS Inactive', icon: Lock },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono rounded-t-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0c121e] border-t-2 border-l border-r border-gray-800 border-t-neon-green text-neon-green font-bold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Vulnerabilities */}
          {activeTab === 'vulns' && (
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-display font-semibold text-white">
                  Identified Security Vulnerabilities & Remediation
                </h3>
                <span className="text-xs font-mono text-gray-400">
                  {result.vulnerabilities.length} Finding{result.vulnerabilities.length === 1 ? '' : 's'}
                </span>
              </div>

              {result.vulnerabilities.length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-black/30 rounded-lg border border-gray-800">
                  <CheckCircle2 className="w-10 h-10 text-neon-green mx-auto mb-2 opacity-80" />
                  <p className="text-white font-medium">No High/Critical Flaws Detected</p>
                  <p className="text-xs mt-1 text-gray-400">Core ports and defensive headers conform to standard baseline security.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.vulnerabilities.map((vuln) => (
                    <div key={vuln.id} className="p-4 bg-black/40 border border-gray-800/90 rounded-lg hover:border-gray-700 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${getSeverityBadge(vuln.severity)}`}>
                            {vuln.severity}
                          </span>
                          <span className="text-sm font-semibold text-white">{vuln.title}</span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-500">{vuln.id}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed mb-3">
                        {vuln.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-800/80 text-xs">
                        <div>
                          <span className="text-red-400 font-mono text-[11px] block font-semibold mb-0.5">Impact:</span>
                          <p className="text-gray-400">{vuln.impact}</p>
                        </div>
                        <div>
                          <span className="text-neon-green font-mono text-[11px] block font-semibold mb-0.5">Remediation:</span>
                          <p className="text-gray-300">{vuln.remediation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Ports */}
          {activeTab === 'ports' && (
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-display font-semibold text-white">
                    TCP Port & Service Fingerprinting
                  </h3>
                  <p className="text-xs text-gray-400">Probed against target host {result.ip}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-2.5 px-3">Port</th>
                      <th className="py-2.5 px-3">Protocol/Service</th>
                      <th className="py-2.5 px-3">State</th>
                      <th className="py-2.5 px-3">Banner / Service Output</th>
                      <th className="py-2.5 px-3">Exposure Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {result.ports.map((p) => (
                      <tr key={p.port} className={p.state === 'OPEN' ? 'bg-neon-green/5' : ''}>
                        <td className="py-2.5 px-3 font-bold text-white">{p.port}/TCP</td>
                        <td className="py-2.5 px-3 text-gray-300">{p.service}</td>
                        <td className="py-2.5 px-3">
                          {p.state === 'OPEN' ? (
                            <span className="inline-flex items-center gap-1 text-neon-green font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                              OPEN
                            </span>
                          ) : (
                            <span className="text-gray-500">CLOSED</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 truncate max-w-xs">
                          {p.banner || (p.state === 'OPEN' ? 'Connected (No banner transmitted)' : 'Connection refused / filtered')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(p.risk)}`}>
                            {p.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Security Headers */}
          {activeTab === 'headers' && (
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-display font-semibold text-white">
                HTTP Defensive Security Headers Audit
              </h3>
              <div className="space-y-3">
                {result.securityHeaders.map((h) => (
                  <div key={h.header} className="p-3.5 bg-black/40 border border-gray-800 rounded-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {h.status === 'PASS' ? (
                          <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
                        ) : h.status === 'FAIL' ? (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                        )}
                        <span className="font-mono text-sm font-semibold text-white">{h.header}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        h.status === 'PASS' ? 'bg-neon-green/20 text-neon-green' : h.status === 'FAIL' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {h.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-2">{h.description}</p>

                    <div className="bg-black/60 rounded p-2 text-xs font-mono text-gray-300 overflow-x-auto mb-2 border border-gray-800/80">
                      <span className="text-gray-500">Value: </span>
                      {h.value || <span className="text-red-400">Header Not Implemented</span>}
                    </div>

                    {h.status !== 'PASS' && (
                      <div className="text-xs text-gray-300 bg-white/5 rounded p-2 border border-gray-700/50">
                        <span className="text-neon-green font-mono font-bold">Recommended: </span>
                        {h.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Domain Whois & Network Dossier */}
          {activeTab === 'dossier' && (
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-6">
              <div>
                <h3 className="text-base font-display font-semibold text-white mb-3">
                  Domain Registration & RDAP Records
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="bg-black/40 border border-gray-800 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-gray-400">Registrar:</span>
                      <span className="text-white font-semibold">{result.whois.registrar || 'Protected / RDAP Unavailable'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-gray-300">{result.whois.creationDate ? new Date(result.whois.creationDate).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-gray-400">Expires:</span>
                      <span className="text-gray-300">{result.whois.expirationDate ? new Date(result.whois.expirationDate).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-neon-green truncate max-w-xs">{result.whois.status?.join(', ') || 'Active / Delegated'}</span>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-gray-800 rounded-lg p-3 space-y-2">
                    <span className="text-gray-400 block mb-1">Authoritative Nameservers:</span>
                    {result.whois.nameServers && result.whois.nameServers.length > 0 ? (
                      <ul className="space-y-1 text-gray-300">
                        {result.whois.nameServers.map((ns, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                            {ns}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Nameservers resolved via direct DNS</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-display font-semibold text-white mb-3">
                  Network Intelligence & ASN Topology
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                    <span className="text-gray-400 block text-[11px]">Primary IP</span>
                    <span className="text-neon-green font-bold text-sm">{result.networkGeo.ip}</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                    <span className="text-gray-400 block text-[11px]">Location</span>
                    <span className="text-white font-bold">{result.networkGeo.city ? `${result.networkGeo.city}, ` : ''}{result.networkGeo.country || 'Global'}</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                    <span className="text-gray-400 block text-[11px]">ISP / Host</span>
                    <span className="text-white truncate block">{result.networkGeo.isp || 'Datacenter / Cloud'}</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                    <span className="text-gray-400 block text-[11px]">ASN</span>
                    <span className="text-blue-400 truncate block">{result.networkGeo.asn || 'AS-Routing'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: DNS Records */}
          {activeTab === 'dns' && (
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-display font-semibold text-white">
                  Resolved DNS Zone Records
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${result.dnsRecords.spfPresent ? 'bg-neon-green/20 text-neon-green' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    SPF: {result.dnsRecords.spfPresent ? 'Configured' : 'Missing'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${result.dnsRecords.dmarcPresent ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-400'}`}>
                    DMARC: {result.dnsRecords.dmarcPresent ? 'Configured' : 'Missing'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* A Records */}
                <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                  <span className="text-neon-green font-bold block mb-1">A Records (IPv4):</span>
                  {result.dnsRecords.a.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.dnsRecords.a.map((ip, i) => (
                        <span key={i} className="px-2 py-1 bg-white/5 rounded border border-gray-700 text-gray-200">
                          {ip}
                        </span>
                      ))}
                    </div>
                  ) : <span className="text-gray-500">None detected</span>}
                </div>

                {/* MX Records */}
                <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                  <span className="text-blue-400 font-bold block mb-1">MX Records (Mail Exchangers):</span>
                  {result.dnsRecords.mx.length > 0 ? (
                    <div className="space-y-1">
                      {result.dnsRecords.mx.map((mx, i) => (
                        <div key={i} className="text-gray-300 flex items-center justify-between">
                          <span>{mx.exchange}</span>
                          <span className="text-gray-500">Priority: {mx.priority}</span>
                        </div>
                      ))}
                    </div>
                  ) : <span className="text-gray-500">No mail exchanger records</span>}
                </div>

                {/* TXT Records */}
                <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                  <span className="text-yellow-400 font-bold block mb-1">TXT Records (SPF & Verification):</span>
                  {result.dnsRecords.txt.length > 0 ? (
                    <div className="space-y-1.5">
                      {result.dnsRecords.txt.map((txt, i) => (
                        <div key={i} className="text-gray-300 bg-white/5 p-1.5 rounded break-all border border-gray-800">
                          {txt}
                        </div>
                      ))}
                    </div>
                  ) : <span className="text-gray-500">None detected</span>}
                </div>

                {/* NS Records */}
                <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                  <span className="text-purple-400 font-bold block mb-1">Authoritative NS Records:</span>
                  {result.dnsRecords.ns.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.dnsRecords.ns.map((ns, i) => (
                        <span key={i} className="px-2 py-1 bg-white/5 rounded border border-gray-700 text-gray-300">
                          {ns}
                        </span>
                      ))}
                    </div>
                  ) : <span className="text-gray-500">None</span>}
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: SSL / TLS */}
          {activeTab === 'ssl' && (
            <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-display font-semibold text-white">
                SSL / TLS X.509 Certificate Profile
              </h3>

              {result.ssl.enabled ? (
                <div className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                      <span className="text-gray-400 block text-[11px]">Certificate Authority</span>
                      <span className="text-neon-green font-bold text-sm block mt-0.5">{result.ssl.issuer}</span>
                    </div>
                    <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                      <span className="text-gray-400 block text-[11px]">Days Remaining</span>
                      <span className={`font-bold text-sm block mt-0.5 ${
                        (result.ssl.daysRemaining ?? 0) < 30 ? 'text-red-400' : 'text-white'
                      }`}>
                        {result.ssl.daysRemaining} Days
                      </span>
                    </div>
                    <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
                      <span className="text-gray-400 block text-[11px]">Trust Chain Status</span>
                      <span className="text-neon-green font-bold text-sm block mt-0.5">
                        {result.ssl.authorized ? 'Authorized / Trusted CA' : 'Self-Signed / Untrusted'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 border border-gray-800 rounded-lg space-y-2">
                    <div className="flex justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-gray-400">Valid From:</span>
                      <span className="text-gray-200">{result.ssl.validFrom}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-800 pb-1.5">
                      <span className="text-gray-400">Valid Until:</span>
                      <span className="text-gray-200">{result.ssl.validTo}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Subject Alternative Names (SAN):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.ssl.subjectAltNames?.map((san, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[11px] text-gray-300 border border-gray-800">
                            {san.replace('DNS:', '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg text-center text-red-400 text-sm">
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="font-semibold">No Active TLS Certificate on Port 443</p>
                  <p className="text-xs text-gray-400 mt-1">{result.ssl.error || 'Connection to port 443 failed.'}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
