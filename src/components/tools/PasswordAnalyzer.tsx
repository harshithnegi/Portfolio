import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Zap, 
  Copy, 
  Check, 
  Eye, 
  EyeOff,
  Hash,
  Server
} from 'lucide-react';
import { motion } from 'motion/react';

export const PasswordAnalyzer: React.FC = () => {
  const [password, setPassword] = useState('P@ssw0rd2026!#Cyber');
  const [showPassword, setShowPassword] = useState(false);
  const [hashes, setHashes] = useState<{ md5: string; sha1: string; sha256: string; sha512: string }>({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute character pool size R and mathematical entropy
  const getPoolSize = (pwd: string) => {
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
    return pool || 1;
  };

  const poolSize = getPoolSize(password);
  const length = password.length;
  // Entropy H = L * log2(R)
  const entropy = Math.round(length * (Math.log(poolSize) / Math.log(2)));

  // Total combinations
  const combinations = BigInt(poolSize) ** BigInt(Math.max(1, length));

  // Format seconds into readable time
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds > 1e15) return 'Centuries (> 1,000 Years)';
    if (seconds < 1) return 'Instant (< 1 second)';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
    return `${Math.round(seconds / 31536000).toLocaleString()} years`;
  };

  // Hardware attack rates (guesses/second)
  const attackerTiers = [
    { name: 'Online Rate-Limited Attack (Web Login)', rate: 100, icon: Server, desc: 'Protected by captcha or throttling (100 req/sec)' },
    { name: 'Online Fast Web / API Endpoint', rate: 1000, icon: Zap, desc: 'Unthrottled OAuth/API endpoint (1,000 req/sec)' },
    { name: 'Consumer Desktop CPU (John The Ripper)', rate: 10_000_000, icon: Cpu, desc: 'Single multi-core desktop CPU (10 Million H/s)' },
    { name: '8x NVIDIA RTX 4090 Hashcat Rig', rate: 100_000_000_000, icon: Cpu, desc: 'Dedicated GPU hash-cracking cluster (100 Billion H/s)' },
    { name: 'Nation-State Supercomputer Cluster', rate: 1_000_000_000_000, icon: Lock, desc: 'Massive parallel ASIC / GPU cluster (1 Trillion H/s)' },
  ];

  // Fetch or calculate hashes
  useEffect(() => {
    if (!password) {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/scan/hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: password }),
        });
        if (res.ok) {
          const data = await res.json();
          setHashes(data);
        }
      } catch {
        // ignore
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [password]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getEntropyScore = () => {
    if (entropy < 28) return { label: 'Very Weak', color: 'text-red-400', barColor: 'bg-red-500' };
    if (entropy < 45) return { label: 'Weak', color: 'text-orange-400', barColor: 'bg-orange-500' };
    if (entropy < 65) return { label: 'Moderate', color: 'text-yellow-400', barColor: 'bg-yellow-400' };
    if (entropy < 85) return { label: 'Strong', color: 'text-blue-400', barColor: 'bg-blue-400' };
    return { label: 'Military-Grade', color: 'text-neon-green', barColor: 'bg-neon-green' };
  };

  const scoreInfo = getEntropyScore();

  return (
    <div id="password-analyzer-root" className="space-y-6">
      {/* Top Controller */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Cryptographic Audit Tool
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <KeyRound className="w-6 h-6 text-emerald-400" />
              Password & Cryptographic Security Analyzer
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Calculate Shannon entropy, hardware brute-force resistance across GPU rigs, and generate live crypto hashes.
            </p>
          </div>
        </div>

        {/* Input Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password-audit-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type or paste password to analyze..."
            className="w-full pl-10 pr-24 py-3 bg-[#070b12] border border-gray-700/80 rounded-lg text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Character Pool Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs font-mono">
          <div className={`p-2 rounded border flex items-center justify-between ${
            /[a-z]/.test(password) ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-black/30 border-gray-800 text-gray-500'
          }`}>
            <span>Lowercase (a-z)</span>
            <span>{/[a-z]/.test(password) ? '✓' : '✗'}</span>
          </div>
          <div className={`p-2 rounded border flex items-center justify-between ${
            /[A-Z]/.test(password) ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-black/30 border-gray-800 text-gray-500'
          }`}>
            <span>Uppercase (A-Z)</span>
            <span>{/[A-Z]/.test(password) ? '✓' : '✗'}</span>
          </div>
          <div className={`p-2 rounded border flex items-center justify-between ${
            /[0-9]/.test(password) ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-black/30 border-gray-800 text-gray-500'
          }`}>
            <span>Digits (0-9)</span>
            <span>{/[0-9]/.test(password) ? '✓' : '✗'}</span>
          </div>
          <div className={`p-2 rounded border flex items-center justify-between ${
            /[^a-zA-Z0-9]/.test(password) ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-black/30 border-gray-800 text-gray-500'
          }`}>
            <span>Symbols (!@#$)</span>
            <span>{/[^a-zA-Z0-9]/.test(password) ? '✓' : '✗'}</span>
          </div>
        </div>
      </div>

      {/* Entropy and Strength Metric */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 shadow-lg">
          <span className="text-xs uppercase text-gray-400">Entropy Value</span>
          <div className="text-2xl font-bold text-white mt-1">
            {entropy} <span className="text-sm font-normal text-gray-400">bits</span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${scoreInfo.barColor}`}
              style={{ width: `${Math.min(100, (entropy / 90) * 100)}%` }}
            />
          </div>
          <span className={`text-xs block mt-2 font-bold ${scoreInfo.color}`}>{scoreInfo.label}</span>
        </div>

        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 shadow-lg">
          <span className="text-xs uppercase text-gray-400">Search Space (Keyspace)</span>
          <div className="text-xl font-bold text-neon-green mt-1 truncate">
            {poolSize}^{length}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Pool size {poolSize} characters across {length} positions.
          </p>
        </div>

        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 shadow-lg">
          <span className="text-xs uppercase text-gray-400">Password Length</span>
          <div className="text-2xl font-bold text-white mt-1">
            {length} <span className="text-sm font-normal text-gray-400">chars</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {length >= 14 ? 'Meets NIST SP 800-63B guidelines.' : 'Less than 14 characters recommended.'}
          </p>
        </div>
      </div>

      {/* Hardware Crack Times Matrix */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" />
          Hardware Brute-Force Time Estimates (Hashcat Benchmark)
        </h3>
        <p className="text-xs text-gray-400">
          Theoretical time to exhaust 50% of keyspace at given hardware hash rates.
        </p>

        <div className="space-y-2.5 font-mono text-xs">
          {attackerTiers.map((tier) => {
            const Icon = tier.icon;
            // Half keyspace / rate
            let seconds = 0;
            try {
              const halfComb = combinations / BigInt(2);
              seconds = Number(halfComb / BigInt(tier.rate));
            } catch {
              seconds = 1e20;
            }

            const timeStr = formatTime(seconds);
            const isInstant = timeStr.includes('Instant') || timeStr.includes('seconds');

            return (
              <div key={tier.name} className="p-3.5 bg-black/40 border border-gray-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-gray-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">{tier.name}</span>
                    <span className="text-gray-500 text-[11px]">{tier.desc}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-bold text-sm block ${isInstant ? 'text-red-400' : 'text-neon-green'}`}>
                    {timeStr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Cryptographic Hashes */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-display font-semibold text-white flex items-center gap-2">
          <Hash className="w-5 h-5 text-emerald-400" />
          Real-Time Cryptographic Hashes
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {[
            { label: 'MD5 (Legacy / Broken)', val: hashes.md5, risk: 'Broken' },
            { label: 'SHA-1 (Deprecated)', val: hashes.sha1, risk: 'Weak' },
            { label: 'SHA-256 (Standard)', val: hashes.sha256, risk: 'Secure' },
            { label: 'SHA-512 (High Security)', val: hashes.sha512, risk: 'Secure' },
          ].map((h) => (
            <div key={h.label} className="p-3 bg-black/50 border border-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-400 font-semibold">{h.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  h.risk === 'Secure' ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-400'
                }`}>
                  {h.risk}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-gray-200 truncate">{h.val || 'Calculating...'}</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(h.val, h.label)}
                  disabled={!h.val}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-gray-700 text-gray-300 hover:text-white shrink-0 flex items-center gap-1"
                >
                  {copiedKey === h.label ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
