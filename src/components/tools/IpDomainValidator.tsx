import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Binary, 
  Globe, 
  Link, 
  Layers, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export const IpDomainValidator: React.FC = () => {
  const [input, setInput] = useState('192.168.1.1');
  const [copied, setCopied] = useState(false);

  const clean = input.trim();

  // 1. Check IPv4
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const isIpv4Format = ipv4Regex.test(clean);
  let isIpv4Valid = false;
  let ipv4Octets: number[] = [];

  if (isIpv4Format) {
    const parts = clean.split('.').map(Number);
    if (parts.every((p) => p >= 0 && p <= 255)) {
      isIpv4Valid = true;
      ipv4Octets = parts;
    }
  }

  // 2. Check IPv6
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  const isIpv6Valid = ipv6Regex.test(clean);

  // 3. Check URL
  let isUrlValid = false;
  let parsedUrl: URL | null = null;
  if (/^https?:\/\//i.test(clean) || /^ftp:\/\//i.test(clean)) {
    try {
      parsedUrl = new URL(clean);
      isUrlValid = true;
    } catch {
      isUrlValid = false;
    }
  }

  // 4. Check Domain (FQDN)
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,}$/;
  const isDomainValid = !isIpv4Format && !isIpv6Valid && !isUrlValid && domainRegex.test(clean);

  // Detected Primary Type
  let detectedType: 'IPv4' | 'IPv6' | 'Domain' | 'URL' | 'Unknown' = 'Unknown';
  let isValid = false;

  if (isIpv4Valid) {
    detectedType = 'IPv4';
    isValid = true;
  } else if (isIpv6Valid) {
    detectedType = 'IPv6';
    isValid = true;
  } else if (isUrlValid) {
    detectedType = 'URL';
    isValid = true;
  } else if (isDomainValid) {
    detectedType = 'Domain';
    isValid = true;
  } else if (isIpv4Format) {
    detectedType = 'IPv4';
    isValid = false; // Octet out of bounds
  }

  // Helper functions for IPv4 details
  const getIpv4Class = (firstOctet: number) => {
    if (firstOctet >= 1 && firstOctet <= 126) return 'Class A (Unicast / Large Networks)';
    if (firstOctet === 127) return 'Loopback Address Range (127.0.0.0/8)';
    if (firstOctet >= 128 && firstOctet <= 191) return 'Class B (Medium Networks)';
    if (firstOctet >= 192 && firstOctet <= 223) return 'Class C (Small Local Networks)';
    if (firstOctet >= 224 && firstOctet <= 239) return 'Class D (Multicast)';
    if (firstOctet >= 240 && firstOctet <= 255) return 'Class E (Reserved / Experimental)';
    return 'Unknown Class';
  };

  const getIpv4Scope = (octets: number[]) => {
    const [a, b] = octets;
    if (a === 10) return 'Private (RFC 1918: 10.0.0.0/8)';
    if (a === 172 && b >= 16 && b <= 31) return 'Private (RFC 1918: 172.16.0.0/12)';
    if (a === 192 && b === 168) return 'Private (RFC 1918: 192.168.0.0/16)';
    if (a === 127) return 'Loopback Localhost (RFC 1122)';
    if (a === 169 && b === 254) return 'Link-Local APIPA (RFC 3927: 169.254.0.0/16)';
    if (a >= 224 && a <= 239) return 'Multicast (RFC 5771)';
    if (a === 0) return 'Current Network (RFC 1122)';
    if (a === 255) return 'Limited Broadcast';
    return 'Public Globally Routable (Internet)';
  };

  const getIpv4Binary = (octets: number[]) => {
    return octets.map((o) => o.toString(2).padStart(8, '0')).join('.');
  };

  const getIpv4Hex = (octets: number[]) => {
    return '0x' + octets.map((o) => o.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  const getIpv4Int = (octets: number[]) => {
    return (octets[0] * 16777216) + (octets[1] * 65536) + (octets[2] * 256) + octets[3];
  };

  // Helper functions for IPv6
  const getIpv6Scope = (ip: string) => {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return 'Loopback Localhost';
    if (lower.startsWith('fe80:')) return 'Link-Local Unicast (fe80::/10)';
    if (lower.startsWith('fc00:') || lower.startsWith('fd')) return 'Unique Local Address ULA (fc00::/7)';
    if (lower.startsWith('ff')) return 'Multicast (ff00::/8)';
    if (lower.startsWith('2001:db8')) return 'Documentation Prefix (RFC 3849)';
    return 'Global Unicast (Public Internet)';
  };

  const presets = [
    { label: 'Public IPv4', val: '8.8.8.8' },
    { label: 'Private IPv4', val: '192.168.1.1' },
    { label: 'IPv6 Global', val: '2001:4860:4860::8888' },
    { label: 'IPv6 Local', val: '::1' },
    { label: 'Domain', val: 'api.github.com' },
    { label: 'Secure URL', val: 'https://security.example.org:8443/auth/login?ref=portal#dashboard' },
  ];

  const copyVal = (v: string) => {
    navigator.clipboard.writeText(v);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ip-domain-validator-tool" className="space-y-6">
      {/* Input Box */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Binary className="w-5 h-5 text-neon-green" />
              IP / Domain Validator
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time syntax validation and classification for IPv4, IPv6, Domain FQDNs, and URLs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-gray-500">Presets:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setInput(p.val)}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 border border-gray-700/60 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter any IPv4, IPv6, Domain or URL..."
            className="w-full px-4 py-3 bg-[#070b12] border border-gray-700 rounded-lg text-white font-mono text-base placeholder-gray-500 focus:outline-none focus:border-neon-green"
          />

          {/* Quick Status Pill Bar */}
          <div className="flex items-center justify-between font-mono text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Detected Format:</span>
              <span className="px-2.5 py-0.5 rounded bg-white/10 font-bold text-white border border-gray-700">
                {detectedType}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isValid ? (
                <span className="text-neon-green flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Valid Syntax
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1 font-bold">
                  <XCircle className="w-4 h-4" /> Invalid Specification
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deep Technical Analysis Breakdown */}
      {isValid && detectedType === 'IPv4' && (
        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="border-b border-gray-800 pb-2 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-neon-green" />
              IPv4 Address Specification Breakdown
            </h3>
            <button
              type="button"
              onClick={() => copyVal(clean)}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
              Copy IP
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Routable Scope</span>
              <span className="text-neon-green font-bold block mt-1">{getIpv4Scope(ipv4Octets)}</span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Address Class</span>
              <span className="text-cyan-400 font-bold block mt-1">{getIpv4Class(ipv4Octets[0])}</span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">32-Bit Integer Decimal</span>
              <span className="text-white font-bold block mt-1">{getIpv4Int(ipv4Octets)}</span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Hexadecimal Notation</span>
              <span className="text-violet-400 font-bold block mt-1">{getIpv4Hex(ipv4Octets)}</span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg md:col-span-2">
              <span className="text-gray-500 block text-[10px] uppercase">32-Bit Binary Form</span>
              <span className="text-yellow-400 font-bold block mt-1 tracking-wider">
                {getIpv4Binary(ipv4Octets)}
              </span>
            </div>
          </div>
        </div>
      )}

      {isValid && detectedType === 'IPv6' && (
        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="border-b border-gray-800 pb-2">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              IPv6 128-Bit Address Specification Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Address Scope (RFC 4291)</span>
              <span className="text-cyan-400 font-bold block mt-1">{getIpv6Scope(clean)}</span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">RFC 5952 Normalized</span>
              <span className="text-white font-bold block mt-1 truncate">{clean.toLowerCase()}</span>
            </div>
          </div>
        </div>
      )}

      {isValid && detectedType === 'Domain' && (
        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="border-b border-gray-800 pb-2">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-neon-green" />
              Fully Qualified Domain Name (FQDN) Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Top-Level Domain (TLD)</span>
              <span className="text-neon-green font-bold block mt-1">.{clean.split('.').pop()}</span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Label Depth (Subdomains)</span>
              <span className="text-white font-bold block mt-1">{clean.split('.').length} labels</span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Total Character Length</span>
              <span className="text-white font-bold block mt-1">{clean.length} / 253 max</span>
            </div>
          </div>
        </div>
      )}

      {isValid && detectedType === 'URL' && parsedUrl && (
        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="border-b border-gray-800 pb-2">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <Link className="w-4 h-4 text-neon-green" />
              Uniform Resource Locator (URL) Component Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Scheme / Protocol</span>
              <span className={`font-bold block mt-1 ${parsedUrl.protocol === 'https:' ? 'text-neon-green' : 'text-orange-400'}`}>
                {parsedUrl.protocol.replace(':', '')} {parsedUrl.protocol === 'https:' ? '(Encrypted)' : '(Insecure Plaintext)'}
              </span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Hostname</span>
              <span className="text-white font-bold block mt-1 truncate">{parsedUrl.hostname}</span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Port</span>
              <span className="text-white font-bold block mt-1">
                {parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443 (Default)' : '80 (Default)')}
              </span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg md:col-span-2">
              <span className="text-gray-500 block text-[10px] uppercase">Pathname</span>
              <span className="text-white font-bold block mt-1 truncate">{parsedUrl.pathname || '/'}</span>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-lg">
              <span className="text-gray-500 block text-[10px] uppercase">Query Parameters</span>
              <span className="text-cyan-400 font-bold block mt-1 truncate">
                {parsedUrl.search || 'None'}
              </span>
            </div>
          </div>
        </div>
      )}

      {!isValid && (
        <div className="bg-[#0c121e] border border-red-500/30 rounded-xl p-5 space-y-2 text-xs font-mono text-gray-300">
          <div className="flex items-center gap-2 text-red-400 font-bold">
            <HelpCircle className="w-4 h-4" />
            Validation Rules & Criteria:
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-400 pl-2">
            <li><strong>IPv4:</strong> 4 octets separated by dots, each in range 0-255 (e.g. <code className="text-gray-300">192.168.1.1</code>).</li>
            <li><strong>IPv6:</strong> 8 hextets in hexadecimal separated by colons with optional RFC 5952 compression (e.g. <code className="text-gray-300">2001:db8::1</code>).</li>
            <li><strong>Domain:</strong> Alphanumeric labels with hyphens ending in a valid 2+ char TLD (e.g. <code className="text-gray-300">sub.example.com</code>).</li>
            <li><strong>URL:</strong> Must include a protocol prefix like <code className="text-gray-300">https://</code> or <code className="text-gray-300">http://</code> followed by a valid host.</li>
          </ul>
        </div>
      )}
    </div>
  );
};
