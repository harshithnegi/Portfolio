import React, { useState } from 'react';
import { Radio, Play, RotateCcw, ShieldAlert, CheckCircle2, Laptop, Wifi, Shield, ArrowRight, Lock, Key } from 'lucide-react';

interface SniffedPacket {
  id: number;
  time: string;
  source: string;
  destination: string;
  protocol: 'HTTP' | 'DNS' | 'TCP' | 'ARP';
  info: string;
  payload?: string;
  isSensitive?: boolean;
}

export default function ArpMitmLab() {
  const [isPoisoned, setIsPoisoned] = useState<boolean>(false);
  const [capturedCredentials, setCapturedCredentials] = useState<{ user: string; pass: string; url: string } | null>(null);

  const initialPackets: SniffedPacket[] = [
    { id: 1, time: '0.000', source: '192.168.1.50', destination: '192.168.1.1', protocol: 'DNS', info: 'Standard query 0x1a2b A intranet-portal.corp' },
    { id: 2, time: '0.015', source: '192.168.1.1', destination: '192.168.1.50', protocol: 'DNS', info: 'Standard query response 0x1a2b A 192.168.1.100' },
  ];

  const poisonedPackets: SniffedPacket[] = [
    { id: 3, time: '0.042', source: '192.168.1.75 (Attacker)', destination: '192.168.1.50', protocol: 'ARP', info: 'ARP Reply: 192.168.1.1 is-at DE:AD:BE:EF:00:01 (Spoofed)', isSensitive: true },
    { id: 4, time: '0.043', source: '192.168.1.75 (Attacker)', destination: '192.168.1.1', protocol: 'ARP', info: 'ARP Reply: 192.168.1.50 is-at DE:AD:BE:EF:00:01 (Spoofed)', isSensitive: true },
    { id: 5, time: '0.120', source: '192.168.1.50 (Victim)', destination: '192.168.1.75 (MITM)', protocol: 'HTTP', info: 'POST /auth/login HTTP/1.1 (application/x-www-form-urlencoded)', payload: 'user=admin_negi&pass=HarshitSecurityMaster2026!&token=xyz99', isSensitive: true },
    { id: 6, time: '0.125', source: '192.168.1.75 (MITM)', destination: '192.168.1.100', protocol: 'HTTP', info: 'Forwarded: POST /auth/login HTTP/1.1' },
    { id: 7, time: '0.210', source: '192.168.1.100', destination: '192.168.1.75 (MITM)', protocol: 'HTTP', info: 'HTTP/1.1 200 OK (Set-Cookie: session_auth=a98b7c6d5e)' },
  ];

  const [packets, setPackets] = useState<SniffedPacket[]>(initialPackets);

  const handleStartPoisoning = () => {
    setIsPoisoned(true);
    setPackets([...initialPackets, ...poisonedPackets]);
    setCapturedCredentials({
      user: 'admin_negi',
      pass: 'HarshitSecurityMaster2026!',
      url: 'http://intranet-portal.corp/auth/login',
    });
  };

  const handleReset = () => {
    setIsPoisoned(false);
    setPackets(initialPackets);
    setCapturedCredentials(null);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              ARP Cache Poisoning & MITM Sniffer
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                LIVE INTERACTIVE LAB
              </span>
            </h3>
            <p className="text-xs font-mono text-gray-400">Layer-2 Man-In-The-Middle Packet Interception Simulator</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {!isPoisoned ? (
            <button
              onClick={handleStartPoisoning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,60,0.5)] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Broadcast ARP Poison Packets
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-mono text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Flush ARP Cache
            </button>
          )}
        </div>
      </div>

      {/* Visual Network Topology Diagram */}
      <div className="my-8 p-6 rounded-2xl bg-black/80 border border-white/10">
        <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-6 text-center">
          LOCAL SUBNET TOPOLOGY (192.168.1.0/24)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Victim PC */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center flex flex-col items-center">
            <div className="p-3 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 mb-2">
              <Laptop className="w-6 h-6" />
            </div>
            <div className="font-bold text-white text-sm">Victim Workstation</div>
            <div className="text-xs font-mono text-blue-400">192.168.1.50</div>
            <div className="text-[10px] font-mono text-gray-500">MAC: AA:BB:CC:11:22:33</div>
            <div className="mt-3 text-[10px] font-mono p-1.5 rounded bg-black/60 border border-white/10 text-gray-400 w-full">
              ARP Cache: {isPoisoned ? <span className="text-red-400 font-bold">192.168.1.1 → DE:AD:BE:EF:00:01</span> : '192.168.1.1 → 00:14:22:FE:DC:BA'}
            </div>
          </div>

          {/* Attacker (Harshit) */}
          <div className={`p-5 rounded-xl border text-center flex flex-col items-center transition-all ${
            isPoisoned
              ? 'border-red-500 bg-red-950/30 shadow-[0_0_30px_rgba(255,0,60,0.4)]'
              : 'border-white/10 bg-white/5'
          }`}>
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 mb-2">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="font-bold text-red-300 text-sm">Attacker Node (MITM Proxy)</div>
            <div className="text-xs font-mono text-red-400">192.168.1.75</div>
            <div className="text-[10px] font-mono text-gray-400">MAC: DE:AD:BE:EF:00:01</div>
            <div className="mt-3 text-[10px] font-mono p-1.5 rounded bg-black/60 border border-red-500/30 text-red-300 w-full">
              Status: {isPoisoned ? '⚡ IN-LINE TRAFFIC INTERCEPT ACTIVE' : 'Idle Listener'}
            </div>
          </div>

          {/* Gateway Router */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center flex flex-col items-center">
            <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-2">
              <Wifi className="w-6 h-6" />
            </div>
            <div className="font-bold text-white text-sm">Default Gateway Router</div>
            <div className="text-xs font-mono text-emerald-400">192.168.1.1</div>
            <div className="text-[10px] font-mono text-gray-500">MAC: 00:14:22:FE:DC:BA</div>
            <div className="mt-3 text-[10px] font-mono p-1.5 rounded bg-black/60 border border-white/10 text-gray-400 w-full">
              ARP Cache: {isPoisoned ? <span className="text-red-400 font-bold">192.168.1.50 → DE:AD:BE:EF:00:01</span> : '192.168.1.50 → AA:BB:CC:11:22:33'}
            </div>
          </div>
        </div>
      </div>

      {/* Captured Plaintext Credentials Banner */}
      {capturedCredentials && (
        <div className="mb-6 p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-mono text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-2 border-b border-emerald-500/30">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              IN-FLIGHT PLAINTEXT CREDENTIALS INTERCEPTED!
            </div>
            <span className="bg-black/60 px-3 py-1 rounded border border-emerald-500/30 text-emerald-300 font-bold">
              FLAG&#123;ARP_CACHE_POISONING_MITM_CREDENTIALS_CAPTURED&#125;
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-2.5 rounded bg-black/60 border border-emerald-500/20">
              <span className="text-gray-400 block text-[10px]">URL:</span>
              <span className="text-white font-bold">{capturedCredentials.url}</span>
            </div>
            <div className="p-2.5 rounded bg-black/60 border border-emerald-500/20">
              <span className="text-gray-400 block text-[10px]">USERNAME:</span>
              <span className="text-blue-300 font-bold">{capturedCredentials.user}</span>
            </div>
            <div className="p-2.5 rounded bg-black/60 border border-emerald-500/20">
              <span className="text-gray-400 block text-[10px]">EXTRACTED PASSWORD:</span>
              <span className="text-red-400 font-bold">{capturedCredentials.pass}</span>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Wireshark Packet Sniffer Table */}
      <div className="rounded-xl border border-white/10 bg-black/90 p-5 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-gray-400 mb-4">
          <span className="font-bold text-white">WIRESHARK-STYLE PACKET DISSECTION STREAM</span>
          <span>{packets.length} PACKETS CAPTURED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-white/10">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-2 border-b border-white/10">NO.</th>
                <th className="p-2 border-b border-white/10">TIME</th>
                <th className="p-2 border-b border-white/10">SOURCE</th>
                <th className="p-2 border-b border-white/10">DESTINATION</th>
                <th className="p-2 border-b border-white/10">PROTO</th>
                <th className="p-2 border-b border-white/10">INFO / PAYLOAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300 font-mono text-[11px]">
              {packets.map((pkt) => (
                <tr
                  key={pkt.id}
                  className={`hover:bg-white/5 transition-colors ${
                    pkt.isSensitive ? 'bg-red-500/10 text-red-300' : ''
                  }`}
                >
                  <td className="p-2 font-bold">{pkt.id}</td>
                  <td className="p-2 text-gray-400">{pkt.time}</td>
                  <td className="p-2 text-blue-300">{pkt.source}</td>
                  <td className="p-2 text-purple-300">{pkt.destination}</td>
                  <td className="p-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      pkt.protocol === 'HTTP' ? 'bg-emerald-500/20 text-emerald-300' :
                      pkt.protocol === 'ARP' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-gray-300'
                    }`}>
                      {pkt.protocol}
                    </span>
                  </td>
                  <td className="p-2">
                    <div>{pkt.info}</div>
                    {pkt.payload && (
                      <div className="mt-1 font-bold text-red-400 bg-black/60 p-1 rounded border border-red-500/30">
                        Payload: {pkt.payload}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
