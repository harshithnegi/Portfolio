import React, { useState } from 'react';
import { Network, Play, RotateCcw, Shield, Server, Cpu, CheckCircle2, Radar, AlertTriangle } from 'lucide-react';

interface DiscoveredNode {
  ip: string;
  hostname: string;
  role: string;
  threat: 'Critical' | 'High' | 'Medium' | 'Low';
  latency: string;
  openServices: string[];
}

export default function CidrThreatLab() {
  const [baseIp, setBaseIp] = useState<string>('192.168.1.0');
  const [cidr, setCidr] = useState<number>(24);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [discoveredNodes, setDiscoveredNodes] = useState<DiscoveredNode[] | null>(null);
  const [selectedNode, setSelectedNode] = useState<DiscoveredNode | null>(null);

  // Subnet Calculation
  const totalIps = Math.pow(2, 32 - cidr);
  const usableHosts = totalIps > 2 ? totalIps - 2 : 0;
  const netmaskMap: Record<number, string> = {
    24: '255.255.255.0',
    26: '255.255.255.192',
    28: '255.255.255.240',
    30: '255.255.255.252',
  };

  const sampleNodes: DiscoveredNode[] = [
    { ip: '192.168.1.1', hostname: 'edge-gw-router', role: 'Gateway Firewall', threat: 'Low', latency: '1.2ms', openServices: ['53/DNS', '80/HTTP', '443/HTTPS'] },
    { ip: '192.168.1.15', hostname: 'sec-db-vault', role: 'PostgreSQL Database', threat: 'Critical', latency: '2.4ms', openServices: ['5432/Postgres (Unauthenticated)', '22/SSH'] },
    { ip: '192.168.1.42', hostname: 'dev-api-stage', role: 'Shadow Web API', threat: 'High', latency: '3.1ms', openServices: ['8080/HTTP (Swagger Exposed)', '3000/Node'] },
    { ip: '192.168.1.88', hostname: 'hq-dc-primary', role: 'Active Directory DC', threat: 'High', latency: '1.8ms', openServices: ['88/Kerberos', '445/SMB', '389/LDAP'] },
    { ip: '192.168.1.105', hostname: 'corp-cam-lobby', role: 'IoT Surveillance', threat: 'Critical', latency: '4.8ms', openServices: ['554/RTSP (Default RTSP Stream)', '80/HTTP'] },
  ];

  const handleSweep = () => {
    setIsSweeping(true);
    setDiscoveredNodes(null);
    setSelectedNode(null);

    setTimeout(() => {
      setIsSweeping(false);
      setDiscoveredNodes(sampleNodes);
      setSelectedNode(sampleNodes[1]); // default select the critical db
    }, 1200);
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
              Subnet CIDR Recon & Threat Radar
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                LIVE INTERACTIVE LAB
              </span>
            </h3>
            <p className="text-xs font-mono text-gray-400">Automated Network Calculation & ICMP Host Discovery</p>
          </div>
        </div>

        <button
          onClick={handleSweep}
          disabled={isSweeping}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,60,0.5)] transition-all cursor-pointer whitespace-nowrap"
        >
          <Play className="w-4 h-4" />
          {isSweeping ? 'Sweeping Subnet...' : 'Execute Ping Sweep'}
        </button>
      </div>

      {/* Subnet Controls & Calculator Box */}
      <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3.5 rounded-xl bg-black/80 border border-white/10">
          <span className="text-gray-500 block text-[10px] mb-1">NETWORK IP:</span>
          <input
            type="text"
            value={baseIp}
            onChange={(e) => setBaseIp(e.target.value)}
            className="w-full bg-transparent font-bold text-white focus:outline-none"
          />
        </div>

        <div className="p-3.5 rounded-xl bg-black/80 border border-white/10">
          <span className="text-gray-500 block text-[10px] mb-1">CIDR PREFIX:</span>
          <select
            value={cidr}
            onChange={(e) => setCidr(Number(e.target.value))}
            className="w-full bg-transparent font-bold text-red-400 focus:outline-none cursor-pointer"
          >
            <option value={24}>/24 (255.255.255.0)</option>
            <option value={26}>/26 (255.255.255.192)</option>
            <option value={28}>/28 (255.255.255.240)</option>
            <option value={30}>/30 (255.255.255.252)</option>
          </select>
        </div>

        <div className="p-3.5 rounded-xl bg-black/80 border border-white/10">
          <span className="text-gray-500 block text-[10px] mb-1">NETMASK:</span>
          <span className="font-bold text-white">{netmaskMap[cidr] || '255.255.255.0'}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-black/80 border border-white/10">
          <span className="text-gray-500 block text-[10px] mb-1">USABLE HOST CAPACITY:</span>
          <span className="font-bold text-emerald-400">{usableHosts} Hosts</span>
        </div>
      </div>

      {/* Discovered Hosts & Threat Surface Inspector */}
      {discoveredNodes && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Host Cards List */}
          <div className="md:col-span-2 space-y-3">
            <div className="text-xs font-mono text-gray-400 flex items-center justify-between mb-2">
              <span>DISCOVERED ACTIVE ASSETS ({discoveredNodes.length}):</span>
              <span className="text-red-400 font-bold">CTF FLAG: FLAG&#123;SUBNET_RECON_SHADOW_ASSETS_MAP&#125;</span>
            </div>

            {discoveredNodes.map((node) => (
              <div
                key={node.ip}
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-xl border font-mono text-xs transition-all cursor-pointer flex items-center justify-between ${
                  selectedNode?.ip === node.ip
                    ? 'border-red-500 bg-red-950/30 shadow-[0_0_20px_rgba(255,0,60,0.3)]'
                    : 'border-white/10 bg-black/80 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    node.threat === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    node.threat === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">{node.ip} ({node.hostname})</div>
                    <div className="text-gray-400 text-[11px]">{node.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-500">{node.latency}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    node.threat === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    node.threat === 'High' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {node.threat}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Asset Threat Inspector */}
          {selectedNode && (
            <div className="p-5 rounded-xl border border-white/10 bg-black/90 font-mono text-xs">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-white/10 flex items-center justify-between">
                <span>ASSET PROFILE</span>
                <span className="text-red-400 font-bold">{selectedNode.threat} THREAT</span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 block text-[10px]">HOSTNAME & IP:</span>
                  <span className="text-white font-bold">{selectedNode.hostname} ({selectedNode.ip})</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">ROLE:</span>
                  <span className="text-gray-300">{selectedNode.role}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] mb-1.5">OPEN ATTACK SURFACE:</span>
                  <div className="space-y-1">
                    {selectedNode.openServices.map((srv, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-white/5 border border-white/10 text-[11px] text-red-300">
                        • {srv}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
