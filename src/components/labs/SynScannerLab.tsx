import React, { useState } from 'react';
import { Network, Terminal, Play, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, Server, Cpu } from 'lucide-react';

interface ScannedPort {
  port: number;
  protocol: string;
  state: 'open' | 'filtered' | 'closed';
  service: string;
  version: string;
  cve?: string;
  severity?: 'Critical' | 'High' | 'Medium';
}

export default function SynScannerLab() {
  const [target, setTarget] = useState<string>('10.10.10.45');
  const [scanFlags, setScanFlags] = useState<string>('-sS -sV -T4');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'CyberSyn Port Scanner v3.4.1 initialized.',
    'Ready for stealth TCP SYN reconnaissance.',
  ]);
  const [results, setResults] = useState<ScannedPort[] | null>(null);

  const targetProfiles: Record<string, { os: string; ports: ScannedPort[] }> = {
    '10.10.10.45': {
      os: 'Linux 5.4.0 (Ubuntu 20.04 LTS)',
      ports: [
        { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsftpd 2.3.4', cve: 'CVE-2011-2523 (Smiley Backdoor RCE)', severity: 'Critical' },
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 7.4p1', cve: 'Outdated cipher suites' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.41', cve: 'Path Traversal CVE-2021-41773', severity: 'High' },
        { port: 3306, protocol: 'tcp', state: 'open', service: 'mysql', version: 'MySQL Community Server 5.7.33' },
      ],
    },
    '192.168.1.1': {
      os: 'Embedded Linux (OpenWrt / RouterOS)',
      ports: [
        { port: 53, protocol: 'tcp', state: 'open', service: 'domain', version: 'dnsmasq 2.78' },
        { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'lighttpd 1.4.35 (Admin WebUI)', cve: 'Default credentials vulnerability', severity: 'High' },
        { port: 443, protocol: 'tcp', state: 'open', service: 'https', version: 'OpenSSL 1.0.2k' },
      ],
    },
    '10.10.10.88': {
      os: 'Windows Server 2016 Datacenter',
      ports: [
        { port: 88, protocol: 'tcp', state: 'open', service: 'kerberos-sec', version: 'Microsoft Windows Kerberos' },
        { port: 135, protocol: 'tcp', state: 'open', service: 'msrpc', version: 'Microsoft Windows RPC' },
        { port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: 'Windows SMBv1', cve: 'MS17-010 EternalBlue RCE', severity: 'Critical' },
        { port: 3389, protocol: 'tcp', state: 'open', service: 'ms-wbt-server', version: 'Microsoft RDP (BlueKeep vulnerable)', severity: 'Critical' },
      ],
    },
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setScanProgress(10);
    setResults(null);
    setTerminalLogs([
      `Initiating stealth SYN scan on target: ${target} with flags: ${scanFlags}`,
      `Sending raw TCP SYN probes on privileged interface eth0...`,
    ]);

    setTimeout(() => {
      setScanProgress(45);
      setTerminalLogs(prev => [...prev, `[+] Host is up (0.014s latency). Scanned 1000 ports in 1.4s.`]);
    }, 600);

    setTimeout(() => {
      setScanProgress(80);
      setTerminalLogs(prev => [
        ...prev,
        `[+] Half-Open SYN-ACK response received on multiple endpoints.`,
        `[+] Grabbing service banners and performing active OS fingerprinting...`,
      ]);
    }, 1200);

    setTimeout(() => {
      setScanProgress(100);
      setIsScanning(false);
      const profile = targetProfiles[target] || targetProfiles['10.10.10.45'];
      setResults(profile.ports);
      setTerminalLogs(prev => [
        ...prev,
        `[+] OS Detection: ${profile.os}`,
        `[+] Nmap done: 1 IP address (1 host up) scanned in 2.18 seconds.`,
        `[+] CTF RECON FLAG UNLOCKED: FLAG{SYN_STEALTH_NMAP_EXPOSED_SERVICES_2026}`,
      ]);
    }, 1800);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              CyberSyn: TCP SYN Recon & Port Scanner
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                LIVE INTERACTIVE LAB
              </span>
            </h3>
            <p className="text-xs font-mono text-gray-400">Half-Open TCP SYN Handshake Probing Engine</p>
          </div>
        </div>

        {/* Target Profile Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.keys(targetProfiles).map((ip) => (
            <button
              key={ip}
              onClick={() => {
                setTarget(ip);
                setResults(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                target === ip
                  ? 'bg-red-500/20 border border-red-500/50 text-red-300 font-bold shadow-[0_0_12px_rgba(255,0,60,0.3)]'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {ip}
            </button>
          ))}
        </div>
      </div>

      {/* Target & Command Bar */}
      <div className="my-6 grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-1.5">TARGET IP ADDRESS:</label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-2.5 font-mono text-xs md:text-sm text-red-400 focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-mono text-gray-400 block mb-1.5">SCAN PARAMETERS & FLAGS:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scanFlags}
              onChange={(e) => setScanFlags(e.target.value)}
              className="flex-1 bg-black/80 border border-white/20 rounded-xl px-4 py-2.5 font-mono text-xs md:text-sm text-gray-200 focus:outline-none focus:border-red-500"
            />
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-mono font-bold text-xs md:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(255,0,60,0.5)] transition-all cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4" />
              {isScanning ? 'Probing...' : 'Execute SYN Scan'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <div className="mb-6">
          <div className="flex justify-between text-xs font-mono text-red-400 mb-1">
            <span>TRANSMITTING SYN PROBES...</span>
            <span>{scanProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-red-500 h-2 transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(255,0,60,0.8)]"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div className="rounded-xl border border-white/10 bg-black/90 p-5 font-mono text-xs text-gray-300 mb-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-red-400" />
            <span>NMAP INTERACTION CONSOLE</span>
          </div>
          <span className="text-[10px]">RAW SOCKET RAW_SYN</span>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className={log.includes('[+]') ? 'text-red-400' : 'text-gray-400'}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Discovered Services Table */}
      {results && (
        <div className="rounded-xl border border-white/10 bg-black/80 p-5 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-gray-400 mb-4">
            <span className="font-bold text-white">OPEN PORTS & SERVICE RECONNAISSANCE</span>
            <span className="text-red-400 font-bold">{results.length} SERVICES DISCOVERED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-white/10">
              <thead className="bg-white/5 text-gray-300">
                <tr>
                  <th className="p-2.5 border-b border-white/10">PORT/PROTO</th>
                  <th className="p-2.5 border-b border-white/10">STATE</th>
                  <th className="p-2.5 border-b border-white/10">SERVICE</th>
                  <th className="p-2.5 border-b border-white/10">VERSION / BANNER</th>
                  <th className="p-2.5 border-b border-white/10">THREAT / CVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-2.5 font-bold text-red-400">{r.port}/{r.protocol}</td>
                    <td className="p-2.5 text-emerald-400 font-bold">{r.state}</td>
                    <td className="p-2.5 text-white font-medium">{r.service}</td>
                    <td className="p-2.5 font-mono text-gray-300">{r.version}</td>
                    <td className="p-2.5">
                      {r.cve ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                          {r.cve}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[10px]">No public CVE</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
