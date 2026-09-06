import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Globe, 
  MapPin, 
  Server, 
  Shield, 
  Clock, 
  Copy, 
  Check, 
  RefreshCw,
  Terminal,
  Activity
} from 'lucide-react';

interface MyIpData {
  ip: string;
  type: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  asn: string;
  reverseDns: string;
  isVpnOrProxy: boolean;
  userAgent: string;
}

export const IpAddressChecker: React.FC = () => {
  const [ipData, setIpData] = useState<MyIpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchMyIp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools/my-ip');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MyIpData = await res.json();
      setIpData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to detect IP address.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIp();
  }, []);

  const copyIp = () => {
    if (ipData?.ip) {
      navigator.clipboard.writeText(ipData.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="my-ip-tool" className="space-y-6">
      {/* Top Hero Card with Detected IP */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-5 h-5 text-neon-green" />
              <h2 className="text-xl font-display font-bold text-white">IP Address Checker</h2>
              <span className="text-xs font-mono text-gray-500">("What Is My IP?")</span>
            </div>
            <p className="text-xs text-gray-400">
              Detects your public IP address, ISP provider, ASN routing block, and geolocation.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMyIp}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-700 text-xs font-mono text-gray-300 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* IP Highlight Box */}
        <div className="mt-6 p-5 bg-[#070b12] border border-gray-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block">
              Your Detected Public IP
            </span>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 font-mono text-xl">
                <RefreshCw className="w-5 h-5 animate-spin text-neon-green" />
                Detecting address...
              </div>
            ) : ipData ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide">
                  {ipData.ip}
                </span>
                <span className="px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-mono font-semibold">
                  {ipData.type}
                </span>
              </div>
            ) : (
              <span className="text-red-400 font-mono text-sm">Failed to retrieve IP</span>
            )}
          </div>

          {ipData && (
            <button
              type="button"
              onClick={copyIp}
              className="px-4 py-2 bg-neon-green text-black font-mono font-bold text-xs rounded-lg hover:bg-neon-cyan transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy IP'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Geolocation & Network Dossier */}
      {ipData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Card 1: Geographic Location */}
          <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-200 font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon-green" />
                Geographic Location
              </span>
              <span className="text-gray-500 text-[11px]">{ipData.timezone}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">Country:</span>
                <span className="text-white font-semibold">{ipData.country} ({ipData.countryCode || 'N/A'})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">Region / State:</span>
                <span className="text-white">{ipData.region || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">City / Postal Code:</span>
                <span className="text-white">{ipData.city || 'N/A'} {ipData.zip ? `(${ipData.zip})` : ''}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Coordinates:</span>
                <span className="text-cyan-400">{ipData.lat}, {ipData.lon}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Internet Service Provider (ISP) & Routing */}
          <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-200 font-bold flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                Network Provider & ASN
              </span>
              <span className="text-neon-green text-[11px]">{ipData.type} Protocol</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">ISP Provider:</span>
                <span className="text-white font-semibold truncate max-w-[200px]">{ipData.isp || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">Autonomous System:</span>
                <span className="text-white truncate max-w-[200px]">{ipData.asn || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/60">
                <span className="text-gray-500">Reverse DNS (PTR):</span>
                <span className="text-gray-300 truncate max-w-[200px]">{ipData.reverseDns || ipData.ip}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Connection Classification:</span>
                <span className={ipData.isVpnOrProxy ? 'text-yellow-400 font-semibold' : 'text-neon-green font-semibold'}>
                  {ipData.isVpnOrProxy ? 'Cloud / Datacenter / Proxy' : 'Residential / Enterprise Broadband'}
                </span>
              </div>
            </div>
          </div>

          {/* Client Environment Info */}
          <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-4 md:col-span-2 space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-gray-500" />
              <span>User Agent Signature:</span>
            </div>
            <p className="p-2 bg-black/40 border border-gray-800 rounded text-gray-400 text-[11px] truncate">
              {ipData.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
