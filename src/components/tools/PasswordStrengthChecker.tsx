import React, { useState, useId } from 'react';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Hash, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export const PasswordStrengthChecker: React.FC = () => {
  const [password, setPassword] = useState('Tr0ub4dor&3#Security');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const passwordInputId = useId();

  // Pattern checks
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  // Variety score
  const varietyCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  // Common pattern detections
  const patternsDetected: string[] = [];

  // 1. Repetitive characters (e.g. aaa, 1111)
  if (/(.)\1{2,}/.test(password)) {
    patternsDetected.push('Repeated characters detected (e.g., "aaa")');
  }

  // 2. Sequential numbers or letters (e.g., 1234, abcd)
  const sequences = ['1234', '2345', '3456', '4567', '5678', '6789', 'abcd', 'bcde', 'cdef', 'defg'];
  if (sequences.some((seq) => password.toLowerCase().includes(seq))) {
    patternsDetected.push('Sequential characters detected (e.g., "1234", "abcd")');
  }

  // 3. Keyboard walks (e.g. qwerty, asdfgh)
  const keyboardWalks = ['qwerty', 'qwert', 'asdfgh', 'asdf', 'zxcvbn', 'zxcv'];
  if (keyboardWalks.some((kw) => password.toLowerCase().includes(kw))) {
    patternsDetected.push('Keyboard walk pattern detected (e.g., "qwerty")');
  }

  // 4. Common dictionary terms
  const dictionaryWords = ['password', 'admin', 'welcome', 'login', 'monkey', 'secret', 'master', 'football', 'shadow', 'hunter'];
  if (dictionaryWords.some((w) => password.toLowerCase().includes(w))) {
    patternsDetected.push('Common dictionary word found in password');
  }

  // 5. Common substitution patterns (e.g. P@ssw0rd)
  if (/p[@a]ssw[o0]rd/i.test(password)) {
    patternsDetected.push('Predictable character substitution pattern ("P@ssw0rd")');
  }

  // Entropy Calculation (Bits of Entropy: H = L * log2(R))
  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 33;

  let entropy = 0;
  if (length > 0 && poolSize > 0) {
    entropy = Math.round(length * (Math.log(poolSize) / Math.log(2)));
  }

  // Penalize entropy if common patterns are found
  const patternPenalty = patternsDetected.length * 15;
  const effectiveEntropy = Math.max(0, entropy - patternPenalty);

  // Strength classification
  let strengthLabel = 'Very Weak';
  let strengthColor = 'text-red-400';
  let strengthBg = 'bg-red-500';
  let strengthPercent = 15;

  if (effectiveEntropy > 80 && length >= 14 && patternsDetected.length === 0) {
    strengthLabel = 'Very Strong';
    strengthColor = 'text-neon-green';
    strengthBg = 'bg-neon-green';
    strengthPercent = 100;
  } else if (effectiveEntropy >= 60 && length >= 12) {
    strengthLabel = 'Strong';
    strengthColor = 'text-emerald-400';
    strengthBg = 'bg-emerald-400';
    strengthPercent = 80;
  } else if (effectiveEntropy >= 40 && length >= 8) {
    strengthLabel = 'Fair';
    strengthColor = 'text-yellow-400';
    strengthBg = 'bg-yellow-400';
    strengthPercent = 50;
  } else if (length >= 6) {
    strengthLabel = 'Weak';
    strengthColor = 'text-orange-400';
    strengthBg = 'bg-orange-400';
    strengthPercent = 30;
  }

  // Cracking time estimation
  const getCrackTime = (bits: number) => {
    if (bits <= 25) return 'Instant (< 1 millisecond)';
    if (bits <= 35) return 'Few seconds';
    if (bits <= 45) return 'A few hours to 1 day';
    if (bits <= 55) return 'Several months';
    if (bits <= 65) return 'Centuries';
    if (bits <= 80) return 'Millions of years';
    return 'Trillions of years (Cryptographically Hard)';
  };

  // Generate strong random passphrase
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+';
    let res = '';
    const array = new Uint32Array(16);
    crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      res += chars[array[i] % chars.length];
    }
    setPassword(res);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="password-strength-tool" className="space-y-6">
      {/* Input Box */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-neon-green" />
              Password Strength & Pattern Analyzer
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Evaluates cryptographic entropy, character diversity, dictionary sequences, and brute-force resistance.
            </p>
          </div>

          <button
            type="button"
            onClick={generateStrongPassword}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-gray-700 text-xs font-mono text-neon-green flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Secure
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              id={passwordInputId}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type password to evaluate..."
              className="w-full pl-4 pr-24 py-3 bg-[#070b12] border border-gray-700 rounded-lg text-white font-mono text-base placeholder-gray-500 focus:outline-none focus:border-neon-green"
            />
            <div className="absolute right-2 top-2.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors"
                title="Copy password"
              >
                {copied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Strength Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Security Rating:</span>
              <span className={`font-bold ${strengthColor}`}>{strengthLabel}</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strengthBg}`}
                style={{ width: `${strengthPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Entropy & Crack Time */}
        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-gray-800 pb-2">
            <Cpu className="w-4 h-4" />
            Entropy & Crack Resistance
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Raw Entropy:</span>
              <span className="text-white font-bold">{entropy} bits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Effective Entropy:</span>
              <span className="text-neon-green font-bold">{effectiveEntropy} bits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Character Pool:</span>
              <span className="text-white">{poolSize} symbols</span>
            </div>
            <div className="pt-2 border-t border-gray-800">
              <span className="text-gray-500 block text-[11px]">Est. GPU Brute-Force Time:</span>
              <span className="text-white font-bold text-sm block mt-0.5">
                {getCrackTime(effectiveEntropy)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Variety & Length Checklist */}
        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-yellow-400 font-bold border-b border-gray-800 pb-2">
            <Hash className="w-4 h-4" />
            Character Diversity
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Length (≥12 chars):</span>
              <span className={length >= 12 ? 'text-neon-green' : 'text-orange-400'}>
                {length} chars {length >= 12 ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Lowercase (a-z):</span>
              <span className={hasLower ? 'text-neon-green' : 'text-gray-500'}>{hasLower ? 'Included ✓' : 'Missing ✗'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Uppercase (A-Z):</span>
              <span className={hasUpper ? 'text-neon-green' : 'text-gray-500'}>{hasUpper ? 'Included ✓' : 'Missing ✗'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Digits (0-9):</span>
              <span className={hasDigit ? 'text-neon-green' : 'text-gray-500'}>{hasDigit ? 'Included ✓' : 'Missing ✗'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Special Symbols:</span>
              <span className={hasSymbol ? 'text-neon-green' : 'text-gray-500'}>{hasSymbol ? 'Included ✓' : 'Missing ✗'}</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Vulnerability & Pattern Audit */}
        <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-gray-800 pb-2">
            <ShieldAlert className="w-4 h-4" />
            Pattern Vulnerabilities
          </div>

          {patternsDetected.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {patternsDetected.length} Weakness{patternsDetected.length > 1 ? 'es' : ''} Found:
              </div>
              <ul className="space-y-1 pl-1">
                {patternsDetected.map((p, i) => (
                  <li key={i} className="text-gray-300 text-[11px] leading-tight flex items-start gap-1">
                    <span className="text-rose-400">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-neon-green font-semibold">
                <ShieldCheck className="w-4 h-4" />
                No Common Patterns Found
              </div>
              <p className="text-gray-400 text-[11px]">
                No repeated characters, dictionary tokens, or predictable keyboard walks identified.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Authentication Security Education (Educational Component) */}
      <div className="bg-[#0c121e] border border-gray-800 rounded-xl p-5 space-y-3">
        <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Authentication Security Guide (NIST SP 800-63B Standards)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-gray-300">
          <div className="p-3 bg-black/40 border border-gray-800/80 rounded-lg space-y-1">
            <span className="text-cyan-400 font-bold block">1. Length Beats Complexity</span>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              A 16-character passphrase like <code className="text-neon-green">correct-horse-battery-staple</code> provides exponential search space resistance compared to an 8-character mixed string.
            </p>
          </div>

          <div className="p-3 bg-black/40 border border-gray-800/80 rounded-lg space-y-1">
            <span className="text-cyan-400 font-bold block">2. Credential Stuffing Risks</span>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Attackers utilize leaked databases (billions of credentials) with automated bots to test credentials across banking, email, and social apps. Never reuse passwords.
            </p>
          </div>

          <div className="p-3 bg-black/40 border border-gray-800/80 rounded-lg space-y-1">
            <span className="text-cyan-400 font-bold block">3. Multi-Factor (MFA)</span>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Hardware keys (FIDO2/WebAuthn) and TOTP authenticator apps neutralize 99% of automated password-stealing attacks even if your password is compromised.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
